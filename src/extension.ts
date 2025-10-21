// --- Scaffold Blueprint Config ---
async function scaffoldBlueprintConfig(targetUri: vscode.Uri) {
  vscode.window.showInformationMessage(
    'Blueprint Architect: scaffoldBlueprintConfig command triggered.',
  );
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'Blueprint Architect: No workspace is open.',
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
      '.blueprint-architect.json already exists in workspace root.',
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
            "import React from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nconst {{Name_pascalCase}} = () => {\n  return <div className={styles.root}>{{Name_pascalCase}}</div>;\n};\n\nexport default {{Name_pascalCase}};",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_kebabCase}}.module.css',
          content: '.root { }',
        },
      ],
    },
    reactNamedExportComponent: {
      files: [
        {
          path: '{{Name_pascalCase}}/index.tsx',
          content:
            "import React from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nexport const {{Name_pascalCase}} = () => <div className={styles.root}>{{Name_pascalCase}}</div>;",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_kebabCase}}.module.css',
          content: '.root { }',
        },
      ],
    },
    reactClassComponent: {
      files: [
        {
          path: '{{Name_pascalCase}}/index.tsx',
          content:
            "import React, { Component } from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nexport class {{Name_pascalCase}} extends Component {\n  render() {\n    return <div className={styles.root}>{{Name_pascalCase}}</div>;\n  }\n}",
        },
        {
          path: '{{Name_pascalCase}}/{{Name_kebabCase}}.module.css',
          content: '.root { }',
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
    'Blueprint Architect: .blueprint-architect.json created in workspace root.',
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
export function toPascalCase(str: string): string {

export function toKebabCase(str: string): string {

export function toSnakeCase(str: string): string {

// --- Case Transform Aggregator ---
function applyCaseTransforms(name: string) {
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
async function getBlueprints(
  workspaceRoot: vscode.Uri,
): Promise<BlueprintConfig | null> {
  try {
    const configPath = vscode.Uri.file(
      path.join(workspaceRoot.fsPath, '.blueprint-architect.json'),
    );
    const data = await vscode.workspace.fs.readFile(configPath);
    const text = Buffer.from(data).toString('utf8');
    let config: any;
    try {
      config = JSON.parse(text);
    } catch (jsonErr) {
      vscode.window.showErrorMessage(
        'Blueprint Architect: Config file is not valid JSON. Please fix syntax errors in .blueprint-architect.json.',
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
        'Blueprint Architect: Config must be a top-level JSON object (not array). See README for example.',
      );
      return null;
    }

    const blueprintNames = new Set<string>();
    for (const [key, blueprintObj] of Object.entries(config)) {
      // Check for duplicate blueprint names
      if (blueprintNames.has(key)) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Duplicate blueprint name '${key}' found. Each blueprint key must be unique.`,
        );
        return null;
      }
      blueprintNames.add(key);

      const blueprint = blueprintObj as { files?: any[] };
      if (
        !blueprint ||
        typeof blueprint !== 'object' ||
        Array.isArray(blueprint)
      ) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Blueprint '${key}' must be an object with a 'files' array. See README for example.`,
        );
        return null;
      }
      if (!Array.isArray(blueprint.files)) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Blueprint '${key}' is missing a 'files' array. See README for example.`,
        );
        return null;
      }
      if (blueprint.files.length === 0) {
        vscode.window.showErrorMessage(
          `Blueprint Architect: Blueprint '${key}' has an empty 'files' array. At least one file entry is required.`,
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
            } in blueprint '${key}' must be an object with 'path' and 'content' strings.`,
          );
          return null;
        }
        if (typeof file.path !== 'string' || !file.path.trim()) {
          vscode.window.showErrorMessage(
            `Blueprint Architect: File entry #${
              i + 1
            } in blueprint '${key}' is missing a valid 'path' string. See README for example.`,
          );
          return null;
        }
        if (typeof file.content !== 'string') {
          vscode.window.showErrorMessage(
            `Blueprint Architect: File entry #${
              i + 1
            } in blueprint '${key}' is missing a valid 'content' string. See README for example.`,
          );
          return null;
        }
      }
    }
    return config;
  } catch (err: any) {
    if (err.code === 'FileNotFound' || err.message.includes('ENOENT')) {
      vscode.window.showErrorMessage(
        'Blueprint Architect: .blueprint-architect.json not found in workspace root. Use "Blueprint Architect: Create Blueprint Config" to scaffold a starter config.',
      );
    } else {
      vscode.window.showErrorMessage(
        `Blueprint Architect: Unexpected error reading config: ${
          err?.message || err
        }`,
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
async function generateFromTemplate(fileUri: vscode.Uri) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage(
      'Blueprint Architect: No workspace is open.',
    );
    return;
  }
  // Multi-root support: find the workspace folder containing the target fileUri
  let workspaceRoot = workspaceFolders[0].uri;
  for (const folder of workspaceFolders) {
    if (fileUri.fsPath.startsWith(folder.uri.fsPath)) {
      workspaceRoot = folder.uri;
      break;
    }
  }
  const blueprints = await getBlueprints(workspaceRoot);
  if (!blueprints) return;

  const blueprintKeys = Object.keys(blueprints);
  if (blueprintKeys.length === 0) {
    vscode.window.showErrorMessage(
      'Blueprint Architect: No blueprints found in config.',
    );
    return;
  }

  // Define free and paid blueprints
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
        `Skipped file '${renderedPath}': path contains invalid characters.`,
      );
      continue;
    }
    // Check for reserved names (Windows)
    const pathParts = renderedPath.split(/[\\\/]/);
    if (pathParts.some((part) => RESERVED_NAMES.includes(part.toUpperCase()))) {
      vscode.window.showWarningMessage(
        `Skipped file '${renderedPath}': path contains reserved name.`,
      );
      continue;
    }
    // Prevent writing outside workspace
    if (!destPath.startsWith(fileUri.fsPath)) {
      vscode.window.showWarningMessage(
        `Skipped file '${renderedPath}': path resolves outside target folder.`,
      );
      continue;
    }

    try {
      await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
    } catch (err: any) {
      vscode.window.showWarningMessage(
        `Blueprint Architect: Failed to create ${file.path}: ${
          err && typeof err === 'object' && 'message' in err
            ? (err as any).message
            : String(err)
        }`,
      );
      continue;
    }

    let shouldWrite = true;
    try {
      await vscode.workspace.fs.stat(destUri);
      // File exists, prompt user
      const answer = await vscode.window.showWarningMessage(
        `File '${renderedPath}' already exists. Overwrite?`,
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
      } catch (err: any) {
        if (err?.code === 'EACCES' || err?.code === 'EPERM') {
          vscode.window.showWarningMessage(
            `Permission denied: could not write '${renderedPath}'.`,
          );
        } else {
          vscode.window.showWarningMessage(
            `Failed to write file '${renderedPath}': ${err?.message || err}`,
          );
        }
      }
    }
  }

  vscode.window.showInformationMessage(
    `Blueprint Architect: Component '${name}' generated successfully.`,
  );
}

export function activate(context: vscode.ExtensionContext) {
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
