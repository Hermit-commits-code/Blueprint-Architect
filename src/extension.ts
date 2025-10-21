// --- Scaffold Blueprint Config ---
async function scaffoldBlueprintConfig(targetUri: vscode.Uri): Promise<void> {
  vscode.window.showInformationMessage(
    'Blueprint Architect: Ready to scaffold a new blueprint config! If you already have a config, you can skip this step.',
  );
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'Blueprint Architect: No workspace is open. Please open a folder in VS Code and try again.',
    );
    return;
  }
  // Multi-root support: find the workspace folder containing the targetUri
  let workspaceRoot = workspaceFolders[0].uri;
  for (const folder of workspaceFolders) {
    if (targetUri.fsPath.startsWith(folder.uri.fsPath)) {
      workspaceRoot = folder.uri;
      break;
    }
  }
  const configPath = vscode.Uri.file(
    path.join(workspaceRoot.fsPath, '.blueprint-architect.json'),
  );
  try {
    // Check if file already exists
    await vscode.workspace.fs.stat(configPath);
    vscode.window.showWarningMessage(
      'A .blueprint-architect.json config already exists in your workspace root. You can edit it directly or delete it to scaffold a new one.',
    );
    return;
  } catch {
    // File does not exist, proceed to create
  }
  const starterConfig = {
    reactArrowComponent: {
      files: [
        {
          path: '{{Name_pascalCase}}/index.tsx',
          content:
            "import React from 'react';\nimport './{{Name_pascalCase}}.css';\n\nconst {{Name_pascalCase}} = () => {\n  return <div>{{Name_pascalCase}}</div>;\n};\n\nexport default {{Name_pascalCase}};",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_pascalCase}}.css',
          content: '',
        },
      ],
    },
    reactNamedExportComponent: {
      files: [
        {
          path: '{{Name_pascalCase}}/index.tsx',
          content:
            "import React from 'react';\nimport './{{Name_pascalCase}}.css';\n\nexport const {{Name_pascalCase}} = () => <div>{{Name_pascalCase}}</div>;",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_pascalCase}}.css',
          content: '',
        },
      ],
    },
    reactClassComponent: {
      files: [
        {
          path: '{{Name_pascalCase}}/index.tsx',
          content:
            "import React, { Component } from 'react';\nimport './{{Name_pascalCase}}.css';\n\nexport class {{Name_pascalCase}} extends Component {\n  render() {\n    return <div>{{Name_pascalCase}}</div>;\n  }\n}",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_pascalCase}}.css',
          content: '',
        },
      ],
    },
    reactHook: {
      files: [
        {
          path: 'hooks/use{{Name_pascalCase}}.ts',
          content:
            "import { useState } from 'react';\n\nexport function use{{Name_pascalCase}}() {\n  const [state, setState] = useState(null);\n  // logic here\n  return state;\n}",
        },
      ],
    },
  };
  await vscode.workspace.fs.writeFile(
    configPath,
    Buffer.from(JSON.stringify(starterConfig, null, 2), 'utf8'),
  );
  vscode.window.showInformationMessage(
    'Blueprint Architect: Successfully created .blueprint-architect.json in your workspace root! Edit this file to customize your blueprints.',
  );
}
import * as vscode from 'vscode';
import * as path from 'path';
import { Buffer } from 'buffer';
import { toPascalCase, toKebabCase, toSnakeCase } from './utils/case';

// --- Type Definitions ---
export interface BlueprintFile {
  path: string;
  content: string;
}

export interface Blueprint {
  files: BlueprintFile[];
}

export interface BlueprintConfig {
  [key: string]: Blueprint;
}

// --- Case Transformation Utilities ---
// --- Case Transform Aggregator ---
function applyCaseTransforms(name: string): {
  Name_pascalCase: string;
  Name_kebabCase: string;
  Name_snakeCase: string;
} {
  return {
    Name_pascalCase: toPascalCase(name),
    Name_kebabCase: toKebabCase(name),
    Name_snakeCase: toSnakeCase(name),
  };
}

// --- Simple Template Renderer ---
function renderTemplate(
  template: string,
  variables: { [key: string]: string },
): string {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] || '');
}

// --- Read Blueprints Config ---
export async function getBlueprints(
  workspaceRoot: vscode.Uri,
): Promise<BlueprintConfig | null> {
  try {
    const configPath = vscode.Uri.file(
      path.join(workspaceRoot.fsPath, '.blueprint-architect.json'),
    );
    const data = await vscode.workspace.fs.readFile(configPath);
    const text = Buffer.from(data).toString('utf8');

    let config: unknown;
    try {
      config = JSON.parse(text);
    } catch (jsonErr) {
      vscode.window.showErrorMessage(
        'Blueprint Architect: Your config file contains invalid JSON. Please fix any syntax errors in .blueprint-architect.json (use an online JSON validator if needed).',
      );
      return null;
    }

    // Validate config structure
    if (
      typeof config !== 'object' ||
      config === null ||
      Array.isArray(config)
    ) {
      vscode.window.showErrorMessage(
        'Blueprint Architect: Config must be a top-level JSON object (not an array). Please see the README for an example config structure.',
      );
      return null;
    }

    const blueprintNames = new Set<string>();
    for (const [key, blueprintObj] of Object.entries(
      config as Record<string, unknown>,
    )) {
      // Check for duplicate blueprint names
      if (blueprintNames.has(key)) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Duplicate blueprint name '${key}' found. Each blueprint key must be unique. Please check your .blueprint-architect.json.`,
        );
        return null;
      }
      blueprintNames.add(key);

      const blueprint = blueprintObj as {
        files?: { path?: unknown; content?: unknown }[];
      };
      if (
        !blueprint ||
        typeof blueprint !== 'object' ||
        Array.isArray(blueprint)
      ) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: The blueprint '${key}' must be an object with a 'files' array. Please see the README for an example.`,
        );
        return null;
      }
      if (!Array.isArray(blueprint.files)) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: The blueprint '${key}' is missing a 'files' array. Please see the README for an example.`,
        );
        return null;
      }
      if (blueprint.files.length === 0) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: The blueprint '${key}' has an empty 'files' array. Please add at least one file entry.`,
        );
        return null;
      }
      for (let i = 0; i < blueprint.files.length; i++) {
        const file = blueprint.files[i] as {
          path?: unknown;
          content?: unknown;
        };
        if (!file || typeof file !== 'object' || Array.isArray(file)) {
          vscode.window.showErrorMessage(
            `Blueprint Architect: File entry #${
              i + 1
            } in blueprint '${key}' must be an object with 'path' and 'content' strings. Please check your config.`,
          );
          return null;
        }
        if (typeof file.path !== 'string' || !file.path.trim()) {
          vscode.window.showErrorMessage(
            `Blueprint Architect: File entry #${
              i + 1
            } in blueprint '${key}' is missing a valid 'path' string. Please see the README for an example.`,
          );
          return null;
        }
        if (typeof file.content !== 'string') {
          vscode.window.showErrorMessage(
            `Blueprint Architect: File entry #${
              i + 1
            } in blueprint '${key}' is missing a valid 'content' string. Please see the README for an example.`,
          );
          return null;
        }
      }
    }
    // Type guard: ensure config is BlueprintConfig
    if (
      typeof config === 'object' &&
      config !== null &&
      !Array.isArray(config) &&
      Object.values(config).every(
        (bp) =>
          typeof bp === 'object' &&
          bp !== null &&
          !Array.isArray(bp) &&
          Array.isArray((bp as { files?: unknown }).files),
      )
    ) {
      return config as BlueprintConfig;
    }
    vscode.window.showErrorMessage(
      'Blueprint Architect: Config does not match the expected blueprint structure. Please see the README for an example.',
    );
    return null;
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err !== null &&
      ('code' in err || 'message' in err)
    ) {
      const code = (err as { code?: string }).code;
      const message = (err as { message?: string }).message || '';
      if (code === 'FileNotFound' || message.includes('ENOENT')) {
        vscode.window.showErrorMessage(
          'Blueprint Architect: .blueprint-architect.json not found in your workspace root. Use the "Blueprint Architect: Create Blueprint Config" command to scaffold a starter config.',
        );
      } else {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Unexpected error reading config: ${message}. Please check your .blueprint-architect.json file.`,
        );
      }
    } else {
      vscode.window.showErrorMessage(
        'Blueprint Architect: Unexpected error reading config. Please check your .blueprint-architect.json file.',
      );
    }
    return null;
  }
}

// --- Main Handler ---
// --- License Check ---
function checkLicense(): boolean {
  // TODO: Integrate with real license system or payment API
  // For MVP, always return false (no license)
  // Replace with actual license check logic for production
  return false;
}
async function generateFromTemplate(fileUri: vscode.Uri): Promise<void> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'Blueprint Architect: No workspace is open.',
    );
    return;
  }
  const blueprints = await getBlueprints(workspaceFolders[0].uri);
  if (!blueprints) return;
  const blueprintKeys = Object.keys(blueprints);
  const FREE_BLUEPRINT = 'reactComponent';
  const PAID_BLUEPRINTS = [
    'utilityFunction',
    'zustandSlice',
    'expressRoute',
    'apiHook',
  ];

  // Show locked status in QuickPick
  const quickPickItems = blueprintKeys.map((key) => {
    if (key === FREE_BLUEPRINT) {
      return { label: key, description: 'Free' };
    }
    if (PAID_BLUEPRINTS.includes(key)) {
      return { label: key, description: 'Paid (Unlock required)' };
    }
    return { label: key };
  });

  const selected = await vscode.window.showQuickPick(quickPickItems, {
    placeHolder: 'Select a blueprint to generate',
  });
  if (!selected) return;
  const selectedBlueprintKey = selected.label;

  // Gate paid blueprints
  if (PAID_BLUEPRINTS.includes(selectedBlueprintKey) && !checkLicense()) {
    vscode.window.showWarningMessage(
      `Blueprint '${selectedBlueprintKey}' is a paid feature. Please purchase a license to unlock this blueprint.`,
    );
    return;
  }

  const name = await vscode.window.showInputBox({
    prompt: 'Enter the base name for your component',
    validateInput: (value: string) =>
      value.trim() ? null : 'Name cannot be empty.',
  });
  if (!name) return;

  // Prompt for file extension if React blueprint
  let selectedExtension = 'tsx';
  const reactBlueprints = [
    'reactComponent',
    'reactArrowComponent',
    'reactNamedExportComponent',
    'reactClassComponent',
    'reactHook',
  ];
  if (reactBlueprints.includes(selectedBlueprintKey)) {
    const ext = await vscode.window.showQuickPick(
      [
        { label: '.tsx', description: 'TypeScript React (recommended)' },
        { label: '.jsx', description: 'JavaScript React' },
        { label: '.ts', description: 'TypeScript (no JSX)' },
        { label: '.js', description: 'JavaScript (no JSX)' },
      ],
      {
        placeHolder: 'Select file extension for generated React files',
      },
    );
    if (!ext) return;
    selectedExtension = ext.label.replace('.', '');
  }

  const caseVars = applyCaseTransforms(name);
  const blueprint = blueprints[selectedBlueprintKey];

  const INVALID_PATH_CHARS = /[<>:"|?*]/g;
  const RESERVED_NAMES = [
    'CON',
    'PRN',
    'AUX',
    'NUL',
    'COM1',
    'COM2',
    'COM3',
    'COM4',
    'COM5',
    'COM6',
    'COM7',
    'COM8',
    'COM9',
    'LPT1',
    'LPT2',
    'LPT3',
    'LPT4',
    'LPT5',
    'LPT6',
    'LPT7',
    'LPT8',
    'LPT9',
  ];
  for (const file of blueprint.files) {
    let renderedPath = renderTemplate(file.path, caseVars);
    // If React blueprint, replace .tsx/.jsx/.ts/.js extension in path with selectedExtension
    if (reactBlueprints.includes(selectedBlueprintKey)) {
      renderedPath = renderedPath.replace(
        /\.(tsx|jsx|ts|js)$/i,
        `.${selectedExtension}`,
      );
    }
    const renderedContent = renderTemplate(file.content, caseVars);
    const destPath = path.join(fileUri.fsPath, renderedPath);
    const destUri = vscode.Uri.file(destPath);
    const parentDir = path.dirname(destPath);

    // Check for invalid path characters (Windows, but also good practice)
    if (INVALID_PATH_CHARS.test(renderedPath)) {
      vscode.window.showWarningMessage(
        `Skipped file '${renderedPath}': The path contains invalid characters (e.g., < > : " | ? *). Please update your blueprint config.`,
      );
      continue;
    }
    // Check for reserved names (Windows)
    const pathParts = renderedPath.split(/[\\/]/);
    if (pathParts.some((part) => RESERVED_NAMES.includes(part.toUpperCase()))) {
      vscode.window.showWarningMessage(
        `Skipped file '${renderedPath}': The path contains a reserved name (e.g., CON, PRN, AUX, NUL, COM1, LPT1, etc.). Please update your blueprint config.`,
      );
      continue;
    }
    // Prevent writing outside workspace
    if (!destPath.startsWith(fileUri.fsPath)) {
      vscode.window.showWarningMessage(
        `Skipped file '${renderedPath}': The path resolves outside the target folder. Please check your blueprint config for unintended '../' or absolute paths.`,
      );
      continue;
    }

    try {
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
    } catch (err: unknown) {
      let msg = '';
      if (typeof err === 'object' && err !== null && 'message' in err) {
        msg = String((err as { message?: string }).message);
      } else {
        msg = String(err);
      }
      vscode.window.showWarningMessage(
        `Blueprint Architect: Failed to create folder for '${file.path}': ${msg}. Please check your permissions and try again.`,
      );
      continue;
    }

    let shouldWrite = true;
    try {
      await vscode.workspace.fs.stat(destUri);
      // File exists, prompt user
      const answer = await vscode.window.showWarningMessage(
        `File '${renderedPath}' already exists. Do you want to overwrite it? (Choosing 'Skip' will leave the existing file unchanged.)`,
        { modal: true },
        'Overwrite',
        'Skip',
      );
      if (answer !== 'Overwrite') {
        shouldWrite = false;
      }
    } catch {
      // File does not exist, proceed
    }
    if (shouldWrite) {
      try {
        await vscode.workspace.fs.writeFile(
          destUri,
          Buffer.from(renderedContent, 'utf8'),
        );
      } catch (err: unknown) {
        if (
          typeof err === 'object' &&
          err !== null &&
          ('code' in err || 'message' in err)
        ) {
          const code = (err as { code?: string }).code;
          const message = (err as { message?: string }).message || '';
          if (code === 'EACCES' || code === 'EPERM') {
            vscode.window.showWarningMessage(
              `Permission denied: could not write '${renderedPath}'.`,
            );
          } else {
            vscode.window.showWarningMessage(
              `Failed to write file '${renderedPath}': ${message}`,
            );
          }
        } else {
          vscode.window.showWarningMessage(
            `Failed to write file '${renderedPath}': ${String(err)}`,
          );
        }
      }
    }
  }

  vscode.window.showInformationMessage(
    `Blueprint Architect: '${name}' generated successfully! You can now start editing your new component files.`,
  );
}

export function activate(context: vscode.ExtensionContext): void {
  vscode.window.showInformationMessage(
    'Blueprint Architect: Extension activated.',
  );
  const disposableGenerate = vscode.commands.registerCommand(
    'blueprintArchitect.generate',
    async (fileUri: vscode.Uri) => {
      vscode.window.showInformationMessage(
        'Blueprint Architect: generateFromTemplate command triggered.',
      );
      await generateFromTemplate(fileUri);
    },
  );
  const disposableScaffold = vscode.commands.registerCommand(
    'blueprintArchitect.scaffoldConfig',
    async (targetUri: vscode.Uri) => {
      vscode.window.showInformationMessage(
        'Blueprint Architect: scaffoldBlueprintConfig command triggered.',
      );
      await scaffoldBlueprintConfig(targetUri);
    },
  );
  context.subscriptions.push(disposableGenerate, disposableScaffold);
}
