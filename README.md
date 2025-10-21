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
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

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

---

## Troubleshooting

### Extension command not appearing in context menu

- Ensure you are right-clicking a folder in the Explorer pane.
- Check that `.blueprint-architect.json` exists in your workspace root.
- Reload VS Code or restart after installing the extension.

### Blueprint Architect fails to generate files

- Verify your blueprint config is valid JSON and matches the expected format.
- Check for file system permissions in your target directory.
- Review the VS Code Output panel for error messages.

### License or paid blueprint issues

- Only the `reactComponent` blueprint is free; others require a license.
- If you believe you have a license, ensure you are signed in and the extension is up to date.

### General troubleshooting

- Run `npm install` and `npm run compile` after pulling new changes.
- Make sure your VS Code version meets the minimum requirement (`>=1.70.0`).

---

## FAQ

**Q: Where do I put my blueprint config?**
A: Place `.blueprint-architect.json` in your workspace root.

**Q: Can I use my own template variables?**
A: Currently, only the built-in case transforms are supported. Custom variables are planned for future releases.

**Q: How do I unlock paid blueprints?**
A: Purchase a license through the extension’s marketplace page (feature coming soon).

**Q: Does this work with multi-root workspaces?**
A: Multi-root support is planned. For now, use a single workspace folder.

**Q: What happens if a file already exists?**
A: Overwrite protection is planned. Currently, files will be overwritten without prompt.

**Q: How do I report bugs or request features?**
A: Open an issue on GitHub or use the feedback link in the extension marketplace page.

---

## Example Blueprint Configs

Below are sample entries for `.blueprint-architect.json` supporting popular frameworks and use cases:

### React Component (Free)

```json
{
  "reactComponent": {
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

### Express Route (Paid)

```json
{
  "expressRoute": {
    "files": [
      {
        "path": "routes/{{Name_kebabCase}}.js",
        "content": "const express = require('express');\nconst router = express.Router();\n\nrouter.get('/', (req, res) => {\n  res.send('GET {{Name_kebabCase}} route');\n});\n\nmodule.exports = router;"
      }
    ]
  }
}
```

### Zustand Slice (Paid)

```json
{
  "zustandSlice": {
    "files": [
      {
        "path": "store/{{Name_kebabCase}}Slice.ts",
        "content": "import create from 'zustand';\n\nexport const use{{Name_pascalCase}}Store = create((set) => ({\n  // state and actions here\n}));"
      }
    ]
  }
}
```

### API Hook (Paid)

```json
{
  "apiHook": {
    "files": [
      {
        "path": "hooks/use{{Name_pascalCase}}Api.ts",
        "content": "import { useEffect, useState } from 'react';\n\nexport function use{{Name_pascalCase}}Api() {\n  const [data, setData] = useState(null);\n  useEffect(() => {\n    // fetch logic here\n  }, []);\n  return data;\n}"
      }
    ]
  }
}
```

### Utility Function (Paid)

```json
{
  "utilityFunction": {
    "files": [
      {
        "path": "utils/{{Name_kebabCase}}.ts",
        "content": "export function {{Name_camelCase}}() {\n  // implementation\n}"
      }
    ]
  }
}
```
