# Blueprint Architect Roadmap

## Vision

Deliver a gold-standard VS Code extension for rapid, customizable component scaffolding, with best-in-class documentation, flexibility, and developer experience.

---

## Planned Enhancements

### Documentation & UX

- Add animated GIFs/screenshots to README for onboarding
- Include troubleshooting and FAQ sections
- Provide example `.blueprint-architect.json` files for popular frameworks

### Error Handling & Validation

- Validate blueprint config structure and show detailed error messages
- Handle file overwrite scenarios (prompt user if file exists)
- Support workspace multi-root scenarios

### Configuration & Flexibility

- Allow users to specify config file location via settings
- Support custom template variables and user-defined case transforms

### Testing & Quality

- Add unit and integration tests (e.g., Mocha/Chai)
- Set up CI (GitHub Actions) for linting, building, and testing
- Use TypeScript strict mode and enable all recommended linter rules

### Extension Packaging

- Add an icon and publisher details in `package.json`
- Provide a changelog (`CHANGELOG.md`)
- Use VS Code’s extension guidelines for metadata and keywords

### Internationalization

- Support localization for messages and prompts

### Performance & Security

- Optimize file operations for large blueprints
- Audit dependencies for vulnerabilities

### Community & Support

- Add issue templates and contribution guidelines
- Respond to user feedback and update regularly

---

## Completed Features

- Context menu command for folder targets
- Reads blueprint configuration from workspace root
- Prompts for blueprint type and component name
- Supports PascalCase, kebab-case, and snake_case transformations
- Renders file paths and contents using template variables
- Generates multiple files and directories per blueprint
- Error handling for missing config and invalid JSON

---

## Feedback & Suggestions

Open an issue or discussion to suggest new features or improvements!
