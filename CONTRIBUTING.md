# Contributing to PokeNav

Thanks for helping improve PokeNav. This project is a game-first Pokemon encyclopedia, so contributions should favor correctness, extensibility, and clarity over quick one-off patches.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Project Philosophy](#project-philosophy)
- [Code Conventions](#code-conventions)
- [Commit Convention](#commit-convention)
- [License](#license)

## Development Setup

```bash
npm install
npm run generate:trainers
npm run generate:encyclopedia
npm run dev:local
```

## Project Structure

- `src/components/encyclopedia/` — Shared article, shell, and browse UI
- `src/pages/encyclopedia/` — Route-level pages
- `src/lib/` — Schema, linking, and transformation logic
- `src/hooks/` — Data loading and route data access
- `src/data/` — Curated data and seed records
- `scripts/` — Import and export tooling

## How to Contribute

### Bug Reports

- Use the [Bug Report](https://github.com/TeamStarWolf/PokeNav/issues/new?template=bug_report.md) template
- Include your browser, OS, and steps to reproduce

### Feature Requests

- Use the [Feature Request](https://github.com/TeamStarWolf/PokeNav/issues/new?template=feature_request.md) template
- Describe the use case, not just the solution

### Pull Requests

1. Create a branch from `main`
2. Keep changes focused — one feature or fix per PR
3. Run tests and build before opening:
   ```bash
   npm test
   npm run build
   ```
4. If you change the trainer import or encyclopedia generation pipeline, regenerate the relevant JSON outputs too

### Good Contribution Targets

- Better game-aware browse flows
- Improved trainer taxonomy and filtering
- Stronger location and item data
- Clearer section completeness handling
- Performance improvements in data loading

## Project Philosophy

### Development Principles

- Keep the app schema-first
- Prefer reusable components over route-specific hacks
- Preserve game-specific data where possible
- Treat missing data honestly
- Keep browse flows fast and understandable

### Data Expectations

- Keep entity relationships normalized
- Do not flatten game-specific differences unless unavoidable
- Prefer explicit status labels like `partial` over silent omissions
- Avoid adding sections that imply full coverage if the data is still thin

### UI Expectations

The app should feel like an encyclopedia, not a card dump:

- Browse pages should be scannable
- Dense data should favor tables or compact structured lists
- Article pages should link outward to related entities
- Mobile layouts should reduce vertical clutter where possible

### Please Avoid

- Hardcoding page-specific logic that belongs in the schema or shared helpers
- Adding polished-looking sections with placeholder data and no status note
- Making navigation heavier when it can be simplified

## Code Conventions

- Follow existing patterns in the codebase
- Use TypeScript strict mode — no `any` unless unavoidable
- Prefer named exports over default exports
- Keep components focused — one responsibility per file

## Commit Convention

Use type-prefixed commit messages:

| Prefix | Purpose |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `refactor:` | Code restructuring (no behavior change) |
| `style:` | Formatting, CSS changes |
| `docs:` | Documentation only |
| `test:` | Adding or updating tests |
| `chore:` | Build, CI, dependency updates |
| `perf:` | Performance improvement |

Example: `feat: add game-scoped location browse page`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
