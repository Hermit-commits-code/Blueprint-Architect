"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = exports.getBlueprints = void 0;
// --- Scaffold Blueprint Config ---
async function scaffoldBlueprintConfig(targetUri) {
    vscode.window.showInformationMessage('Blueprint Architect: Ready to scaffold a new blueprint config! If you already have a config, you can skip this step.');
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Blueprint Architect: No workspace is open. Please open a folder in VS Code and try again.');
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
    const configPath = vscode.Uri.file(path.join(workspaceRoot.fsPath, '.blueprint-architect.json'));
    try {
        // Check if file already exists
        await vscode.workspace.fs.stat(configPath);
        vscode.window.showWarningMessage('A .blueprint-architect.json config already exists in your workspace root. You can edit it directly or delete it to scaffold a new one.');
        return;
    }
    catch {
        // File does not exist, proceed to create
    }
    const starterConfig = {
        reactArrowComponent: {
            files: [
                {
                    path: '{{Name_pascalCase}}/index.tsx',
                    content: "import React from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nconst {{Name_pascalCase}} = () => {\n  return <div className={styles.root}>{{Name_pascalCase}}</div>;\n};\n\nexport default {{Name_pascalCase}};",
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
                    content: "import React from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nexport const {{Name_pascalCase}} = () => <div className={styles.root}>{{Name_pascalCase}}</div>;",
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
                    content: "import React, { Component } from 'react';\nimport styles from './{{Name_kebabCase}}.module.css';\n\nexport class {{Name_pascalCase}} extends Component {\n  render() {\n    return <div className={styles.root}>{{Name_pascalCase}}</div>;\n  }\n}",
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
                    content: "import { useState } from 'react';\n\nexport function use{{Name_pascalCase}}() {\n  const [state, setState] = useState(null);\n  // logic here\n  return state;\n}",
                },
            ],
        },
    };
    await vscode.workspace.fs.writeFile(configPath, buffer_1.Buffer.from(JSON.stringify(starterConfig, null, 2), 'utf8'));
    vscode.window.showInformationMessage('Blueprint Architect: Successfully created .blueprint-architect.json in your workspace root! Edit this file to customize your blueprints.');
}
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const buffer_1 = require("buffer");
const case_1 = require("./utils/case");
// --- Case Transformation Utilities ---
// --- Case Transform Aggregator ---
function applyCaseTransforms(name) {
    return {
        Name_pascalCase: (0, case_1.toPascalCase)(name),
        Name_kebabCase: (0, case_1.toKebabCase)(name),
        Name_snakeCase: (0, case_1.toSnakeCase)(name),
    };
}
// --- Simple Template Renderer ---
function renderTemplate(template, variables) {
    return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => variables[key] || '');
}
// --- Read Blueprints Config ---
async function getBlueprints(workspaceRoot) {
    try {
        const configPath = vscode.Uri.file(path.join(workspaceRoot.fsPath, '.blueprint-architect.json'));
        const data = await vscode.workspace.fs.readFile(configPath);
        const text = buffer_1.Buffer.from(data).toString('utf8');
        let config;
        try {
            config = JSON.parse(text);
        }
        catch (jsonErr) {
            vscode.window.showErrorMessage('Blueprint Architect: Your config file contains invalid JSON. Please fix any syntax errors in .blueprint-architect.json (use an online JSON validator if needed).');
            return null;
        }
        // Validate config structure
        if (typeof config !== 'object' ||
            config === null ||
            Array.isArray(config)) {
            vscode.window.showErrorMessage('Blueprint Architect: Config must be a top-level JSON object (not an array). Please see the README for an example config structure.');
            return null;
        }
        const blueprintNames = new Set();
        for (const [key, blueprintObj] of Object.entries(config)) {
            // Check for duplicate blueprint names
            if (blueprintNames.has(key)) {
                vscode.window.showErrorMessage(`Blueprint Architect: Duplicate blueprint name '${key}' found. Each blueprint key must be unique. Please check your .blueprint-architect.json.`);
                return null;
            }
            blueprintNames.add(key);
            const blueprint = blueprintObj;
            if (!blueprint ||
                typeof blueprint !== 'object' ||
                Array.isArray(blueprint)) {
                vscode.window.showErrorMessage(`Blueprint Architect: The blueprint '${key}' must be an object with a 'files' array. Please see the README for an example.`);
                return null;
            }
            if (!Array.isArray(blueprint.files)) {
                vscode.window.showErrorMessage(`Blueprint Architect: The blueprint '${key}' is missing a 'files' array. Please see the README for an example.`);
                return null;
            }
            if (blueprint.files.length === 0) {
                vscode.window.showErrorMessage(`Blueprint Architect: The blueprint '${key}' has an empty 'files' array. Please add at least one file entry.`);
                return null;
            }
            for (let i = 0; i < blueprint.files.length; i++) {
                const file = blueprint.files[i];
                if (!file || typeof file !== 'object' || Array.isArray(file)) {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' must be an object with 'path' and 'content' strings. Please check your config.`);
                    return null;
                }
                if (typeof file.path !== 'string' || !file.path.trim()) {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' is missing a valid 'path' string. Please see the README for an example.`);
                    return null;
                }
                if (typeof file.content !== 'string') {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' is missing a valid 'content' string. Please see the README for an example.`);
                    return null;
                }
            }
        }
        // Type guard: ensure config is BlueprintConfig
        if (typeof config === 'object' &&
            config !== null &&
            !Array.isArray(config) &&
            Object.values(config).every((bp) => typeof bp === 'object' &&
                bp !== null &&
                !Array.isArray(bp) &&
                Array.isArray(bp.files))) {
            return config;
        }
        vscode.window.showErrorMessage('Blueprint Architect: Config does not match the expected blueprint structure. Please see the README for an example.');
        return null;
    }
    catch (err) {
        if (typeof err === 'object' &&
            err !== null &&
            ('code' in err || 'message' in err)) {
            const code = err.code;
            const message = err.message || '';
            if (code === 'FileNotFound' || message.includes('ENOENT')) {
                vscode.window.showErrorMessage('Blueprint Architect: .blueprint-architect.json not found in your workspace root. Use the "Blueprint Architect: Create Blueprint Config" command to scaffold a starter config.');
            }
            else {
                vscode.window.showErrorMessage(`Blueprint Architect: Unexpected error reading config: ${message}. Please check your .blueprint-architect.json file.`);
            }
        }
        else {
            vscode.window.showErrorMessage('Blueprint Architect: Unexpected error reading config. Please check your .blueprint-architect.json file.');
        }
        return null;
    }
}
exports.getBlueprints = getBlueprints;
// --- Main Handler ---
// --- License Check ---
function checkLicense() {
    // TODO: Integrate with real license system or payment API
    // For MVP, always return false (no license)
    // Replace with actual license check logic for production
    return false;
}
async function generateFromTemplate(fileUri) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Blueprint Architect: No workspace is open.');
        return;
    }
    const blueprints = await getBlueprints(workspaceFolders[0].uri);
    if (!blueprints)
        return;
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
    if (!selected)
        return;
    const selectedBlueprintKey = selected.label;
    // Gate paid blueprints
    if (PAID_BLUEPRINTS.includes(selectedBlueprintKey) && !checkLicense()) {
        vscode.window.showWarningMessage(`Blueprint '${selectedBlueprintKey}' is a paid feature. Please purchase a license to unlock this blueprint.`);
        return;
    }
    const name = await vscode.window.showInputBox({
        prompt: 'Enter the base name for your component',
        validateInput: (value) => value.trim() ? null : 'Name cannot be empty.',
    });
    if (!name)
        return;
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
        const ext = await vscode.window.showQuickPick([
            { label: '.tsx', description: 'TypeScript React (recommended)' },
            { label: '.jsx', description: 'JavaScript React' },
            { label: '.ts', description: 'TypeScript (no JSX)' },
            { label: '.js', description: 'JavaScript (no JSX)' },
        ], {
            placeHolder: 'Select file extension for generated React files',
        });
        if (!ext)
            return;
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
            renderedPath = renderedPath.replace(/\.(tsx|jsx|ts|js)$/i, `.${selectedExtension}`);
        }
        const renderedContent = renderTemplate(file.content, caseVars);
        const destPath = path.join(fileUri.fsPath, renderedPath);
        const destUri = vscode.Uri.file(destPath);
        const parentDir = path.dirname(destPath);
        // Check for invalid path characters (Windows, but also good practice)
        if (INVALID_PATH_CHARS.test(renderedPath)) {
            vscode.window.showWarningMessage(`Skipped file '${renderedPath}': The path contains invalid characters (e.g., < > : " | ? *). Please update your blueprint config.`);
            continue;
        }
        // Check for reserved names (Windows)
        const pathParts = renderedPath.split(/[\\/]/);
        if (pathParts.some((part) => RESERVED_NAMES.includes(part.toUpperCase()))) {
            vscode.window.showWarningMessage(`Skipped file '${renderedPath}': The path contains a reserved name (e.g., CON, PRN, AUX, NUL, COM1, LPT1, etc.). Please update your blueprint config.`);
            continue;
        }
        // Prevent writing outside workspace
        if (!destPath.startsWith(fileUri.fsPath)) {
            vscode.window.showWarningMessage(`Skipped file '${renderedPath}': The path resolves outside the target folder. Please check your blueprint config for unintended '../' or absolute paths.`);
            continue;
        }
        try {
            await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
        }
        catch (err) {
            let msg = '';
            if (typeof err === 'object' && err !== null && 'message' in err) {
                msg = String(err.message);
            }
            else {
                msg = String(err);
            }
            vscode.window.showWarningMessage(`Blueprint Architect: Failed to create folder for '${file.path}': ${msg}. Please check your permissions and try again.`);
            continue;
        }
        let shouldWrite = true;
        try {
            await vscode.workspace.fs.stat(destUri);
            // File exists, prompt user
            const answer = await vscode.window.showWarningMessage(`File '${renderedPath}' already exists. Do you want to overwrite it? (Choosing 'Skip' will leave the existing file unchanged.)`, { modal: true }, 'Overwrite', 'Skip');
            if (answer !== 'Overwrite') {
                shouldWrite = false;
            }
        }
        catch {
            // File does not exist, proceed
        }
        if (shouldWrite) {
            try {
                await vscode.workspace.fs.writeFile(destUri, buffer_1.Buffer.from(renderedContent, 'utf8'));
            }
            catch (err) {
                if (typeof err === 'object' &&
                    err !== null &&
                    ('code' in err || 'message' in err)) {
                    const code = err.code;
                    const message = err.message || '';
                    if (code === 'EACCES' || code === 'EPERM') {
                        vscode.window.showWarningMessage(`Permission denied: could not write '${renderedPath}'.`);
                    }
                    else {
                        vscode.window.showWarningMessage(`Failed to write file '${renderedPath}': ${message}`);
                    }
                }
                else {
                    vscode.window.showWarningMessage(`Failed to write file '${renderedPath}': ${String(err)}`);
                }
            }
        }
    }
    vscode.window.showInformationMessage(`Blueprint Architect: '${name}' generated successfully! You can now start editing your new component files.`);
}
function activate(context) {
    vscode.window.showInformationMessage('Blueprint Architect: Extension activated.');
    const disposableGenerate = vscode.commands.registerCommand('blueprintArchitect.generate', async (fileUri) => {
        vscode.window.showInformationMessage('Blueprint Architect: generateFromTemplate command triggered.');
        await generateFromTemplate(fileUri);
    });
    const disposableScaffold = vscode.commands.registerCommand('blueprintArchitect.scaffoldConfig', async (targetUri) => {
        vscode.window.showInformationMessage('Blueprint Architect: scaffoldBlueprintConfig command triggered.');
        await scaffoldBlueprintConfig(targetUri);
    });
    context.subscriptions.push(disposableGenerate, disposableScaffold);
}
exports.activate = activate;
