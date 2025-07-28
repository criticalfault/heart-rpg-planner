# Project Structure

## Current State
This is an early-stage project with minimal structure established.

## Root Level
- `README.md` - Project documentation
- `.gitignore` - Node.js focused ignore patterns
- `.kiro/` - Kiro AI assistant configuration and steering rules

## Expected Structure (to be established)
Based on the project type and .gitignore patterns, the following structure is anticipated:

```
heart-rpg-planner/
├── src/                 # Source code
├── public/              # Static assets (if web app)
├── tests/               # Test files
├── docs/                # Documentation
├── package.json         # Node.js dependencies and scripts
├── node_modules/        # Dependencies (gitignored)
└── dist/                # Build output (gitignored)
```

## Organization Principles
- Keep source code in `src/` directory
- Separate concerns with clear module boundaries
- Use descriptive file and folder names
- Group related functionality together
- Maintain clean separation between business logic and presentation

## File Naming
- Use kebab-case for file names
- Use descriptive names that indicate purpose
- Group related files in appropriate subdirectories
- Follow consistent naming patterns throughout the project