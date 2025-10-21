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
exports.deactivate = exports.activate = void 0;
// --- Scaffold Blueprint Config ---
async function scaffoldBlueprintConfig(targetUri) {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('Blueprint Architect: No workspace is open.');
        return;
    }
    const workspaceRoot = workspaceFolders[0].uri;
    const configPath = vscode.Uri.file(path.join(workspaceRoot.fsPath, '.blueprint-architect.json'));
    try {
        // Check if file already exists
        await vscode.workspace.fs.stat(configPath);
        vscode.window.showWarningMessage('.blueprint-architect.json already exists in workspace root.');
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
                    content: "import React from 'react';\n\nconst {{Name_pascalCase}} = () => {\n  return <div>{{Name_pascalCase}}</div>;\n};\n\nexport default {{Name_pascalCase}};",
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
                    content: "import React from 'react';\n\nexport const {{Name_pascalCase}} = () => <div>{{Name_pascalCase}}</div>;",
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
                    content: "import React, { Component } from 'react';\n\nexport class {{Name_pascalCase}} extends Component {\n  render() {\n    return <div>{{Name_pascalCase}}</div>;\n  }\n}",
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
    vscode.window.showInformationMessage('Blueprint Architect: .blueprint-architect.json created in workspace root.');
}
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const buffer_1 = require("buffer");
// --- Case Transformation Utilities ---
function toPascalCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[^a-zA-Z0-9]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
}
function toKebabCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-+|-+$/g, '')
        .replace(/--+/g, '-');
}
function toSnakeCase(str) {
    return str
        .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/([A-Z])/g, '_$1')
        .toLowerCase()
        .replace(/^_+|_+$/g, '')
        .replace(/__+/g, '_');
}
// --- Case Transform Aggregator ---
function applyCaseTransforms(name) {
    return {
        Name_pascalCase: toPascalCase(name),
        Name_kebabCase: toKebabCase(name),
        Name_snakeCase: toSnakeCase(name),
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
        const config = JSON.parse(text);
        // Validate config structure
        if (typeof config !== 'object' || config === null) {
            vscode.window.showErrorMessage('Blueprint Architect: Config must be a JSON object.');
            return null;
        }
        for (const [key, blueprintObj] of Object.entries(config)) {
            const blueprint = blueprintObj;
            if (!blueprint || typeof blueprint !== 'object') {
                vscode.window.showErrorMessage(`Blueprint Architect: Blueprint '${key}' must be an object.`);
                return null;
            }
            if (!Array.isArray(blueprint.files)) {
                vscode.window.showErrorMessage(`Blueprint Architect: Blueprint '${key}' is missing a 'files' array.`);
                return null;
            }
            for (let i = 0; i < blueprint.files.length; i++) {
                const file = blueprint.files[i];
                if (!file || typeof file !== 'object') {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' must be an object.`);
                    return null;
                }
                if (typeof file.path !== 'string' || !file.path.trim()) {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' is missing a valid 'path' string.`);
                    return null;
                }
                if (typeof file.content !== 'string') {
                    vscode.window.showErrorMessage(`Blueprint Architect: File entry #${i + 1} in blueprint '${key}' is missing a valid 'content' string.`);
                    return null;
                }
            }
        }
        return config;
    }
    catch (err) {
        if (err.code === 'FileNotFound' || err.message.includes('ENOENT')) {
            vscode.window.showErrorMessage('Blueprint Architect: .blueprint-architect.json not found in workspace root.');
        }
        else {
            vscode.window.showErrorMessage('Blueprint Architect: Error parsing .blueprint-architect.json.');
        }
        return null;
    }
}
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
    const workspaceRoot = workspaceFolders[0].uri;
    const blueprints = await getBlueprints(workspaceRoot);
    if (!blueprints)
        return;
    const blueprintKeys = Object.keys(blueprints);
    if (blueprintKeys.length === 0) {
        vscode.window.showErrorMessage('Blueprint Architect: No blueprints found in config.');
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
    const caseVars = applyCaseTransforms(name);
    const blueprint = blueprints[selectedBlueprintKey];
    for (const file of blueprint.files) {
        const renderedPath = renderTemplate(file.path, caseVars);
        const renderedContent = renderTemplate(file.content, caseVars);
        const destPath = path.join(fileUri.fsPath, renderedPath);
        const destUri = vscode.Uri.file(destPath);
        const parentDir = path.dirname(destPath);
        await vscode.workspace.fs.createDirectory(vscode.Uri.file(parentDir));
        let shouldWrite = true;
        try {
            await vscode.workspace.fs.stat(destUri);
            // File exists, prompt user
            const answer = await vscode.window.showWarningMessage(`File '${renderedPath}' already exists. Overwrite?`, { modal: true }, 'Overwrite', 'Skip');
            if (answer !== 'Overwrite') {
                shouldWrite = false;
            }
        }
        catch {
            // File does not exist, proceed
        }
        if (shouldWrite) {
            await vscode.workspace.fs.writeFile(destUri, buffer_1.Buffer.from(renderedContent, 'utf8'));
        }
    }
    vscode.window.showInformationMessage(`Blueprint Architect: Component '${name}' generated successfully.`);
}
// --- Extension Activation ---
function activate(context) {
    const disposableGenerate = vscode.commands.registerCommand('blueprintArchitect.generate', generateFromTemplate);
    const disposableScaffold = vscode.commands.registerCommand('blueprintArchitect.scaffoldConfig', scaffoldBlueprintConfig);
    context.subscriptions.push(disposableGenerate, disposableScaffold);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
