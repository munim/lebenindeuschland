# AGENTS.md

## Build, Lint, and Dev Commands
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Start production server:** `npm run start`
- **Lint code:** `npm run lint`
- **Tests:** _No test script or test framework is currently set up._

## Code Style Guidelines
- **Imports:** Use ES6 import syntax. Group external, then internal modules. No relative imports that traverse up more than one directory.
- **Formatting:** Follow default ESLint and Prettier (if added) rules. Use 2 spaces for indentation. Keep lines ≤ 80-100 chars.
- **Types:** Use TypeScript for all code. Prefer explicit types for function arguments and return values. Use interfaces for objects.
- **Naming:** Use camelCase for variables/functions, PascalCase for components/types, and UPPER_CASE for constants.
- **Error Handling:** Use try/catch for async code. Prefer returning errors over throwing when possible in utilities.
- **Components:** Use functional React components. Prefer arrow functions. Use hooks for state/effects.
- **Files:** Use .tsx for React components, .ts for logic/utilities. One component per file.
- **Other:** No Cursor or Copilot rules are present. Follow Next.js and TypeScript best practices.

_This file is for agentic coding agents. Update if project conventions change._
