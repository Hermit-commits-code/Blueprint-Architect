# Blueprint Architect ![VSCode Extension](https://img.shields.io/badge/VSCode-Extension-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue.svg) ![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Blueprint File Format](#blueprint-file-format)
- [Case Transformations](#case-transformations)
- [Commands](#commands)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**Blueprint Architect** is a Visual Studio Code extension that enables you to quickly generate multi-file component structures from customizable blueprints. It reads a `.blueprint-architect.json` configuration file, prompts for a component name, applies case transformations, and creates the desired file structure in your project.

---

## Features

- Context menu command for folder targets
- Reads blueprint configuration from workspace root
- Prompts for blueprint type and component name
- Supports PascalCase, kebab-case, and snake_case transformations
- Renders file paths and contents using template variables
- Generates multiple files and directories per blueprint
- Error handling for missing config and invalid JSON

---

## Installation

1. Clone or download this repository.
2. Run `npm install` to install dependencies.
3. Run `npm run compile` to build the extension.
4. Open the folder in VS Code and press `F5` to launch the extension in a new Extension Development Host.

---

## Usage

1. Add a `.blueprint-architect.json` file to your workspace root (see [Blueprint File Format](#blueprint-file-format)).
2. Right-click any folder in the Explorer and select **Blueprint Architect: Generate Component**.
3. Choose a blueprint type and enter your component's base name.
4. The extension will generate the files and directories as specified in your blueprint.

---

## Configuration

Place a `.blueprint-architect.json` file in your workspace root. This file defines available blueprints and their file structures.

---

## Blueprint File Format

```json
{
  "react-component": {
    "files": [
      {
        "path": "{{Name_pascalCase}}/index.tsx",
        "content": "import React from 'react';\n\nexport const {{Name_pascalCase}} = () => <div>{{Name_pascalCase}}</div>;"
      },
      {
        "path": "{{Name_pascalCase}}/{{Name_kebabCase}}.module.css",
        "content": ".root { }"
      }
    ]
  }
}
```

- **path**: Destination path, supports template variables.
- **content**: File content, supports template variables.

---

## Case Transformations

When you enter a component name, the following variables are available for templates:

- `{{Name_pascalCase}}` — PascalCase (e.g., `MyComponent`)
- `{{Name_kebabCase}}` — kebab-case (e.g., `my-component`)
- `{{Name_snakeCase}}` — snake_case (e.g., `my_component`)

---

## Commands

- **Blueprint Architect: Generate Component**
  - Appears in the folder context menu
  - Command ID: `blueprintArchitect.generate`

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

## License

This project is licensed under the [MIT License](LICENSE).
