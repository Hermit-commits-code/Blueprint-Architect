import * as vscode from 'vscode';
import * as path from 'path';
import { Buffer } from 'buffer';

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
function toPascalCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_+|_+$/g, '')
    .replace(/__+/g, '_');
}

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
    return JSON.parse(text);
  } catch (err: any) {
    if (err.code === 'FileNotFound' || err.message.includes('ENOENT')) {
      vscode.window.showErrorMessage(
        'Blueprint Architect: .blueprint-architect.json not found in workspace root.',
      );
    } else {
      vscode.window.showErrorMessage(
        'Blueprint Architect: Error parsing .blueprint-architect.json.',
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
  const workspaceRoot = workspaceFolders[0].uri;
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

  const caseVars = applyCaseTransforms(name);
  const blueprint = blueprints[selectedBlueprintKey];

  for (const file of blueprint.files) {
    const renderedPath = renderTemplate(file.path, caseVars);
    const renderedContent = renderTemplate(file.content, caseVars);
    const destPath = path.join(fileUri.fsPath, renderedPath);
    const destUri = vscode.Uri.file(destPath);
    const parentDir = path.dirname(destPath);
    await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
    await vscode.workspace.fs.writeFile(
      destUri,
      Buffer.from(renderedContent, 'utf8'),
    );
  }

  vscode.window.showInformationMessage(
    `Blueprint Architect: Component '${name}' generated successfully.`,
  );
}

// --- Extension Activation ---
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'blueprintArchitect.generate',
    generateFromTemplate,
  );
  context.subscriptions.push(disposable);
}

export function deactivate() {}
