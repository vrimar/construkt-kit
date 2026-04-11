# B3 Frontend Shared — AI Instructions

See `.github/copilot-instructions.md` for all monorepo rules, conventions, workflows, and anti-patterns.
For per-package details, see `README.md` in each package under `packages/`.
Per-package AI instructions are in `.github/instructions/<package>.instructions.md`.

## Instruction File Map

| Working in                  | Load instruction file                                |
| --------------------------- | ---------------------------------------------------- |
| `packages/api/**`           | `.github/instructions/api.instructions.md`           |
| `packages/auth-adapters/**` | `.github/instructions/auth-adapters.instructions.md` |
| `packages/config/**`        | `.github/instructions/config.instructions.md`        |
| `packages/pages/**`         | `.github/instructions/pages.instructions.md`         |
| `packages/testing/**`       | `.github/instructions/testing.instructions.md`       |
| `packages/ui/**`            | `.github/instructions/ui.instructions.md`            |
| `packages/utils/**`         | `.github/instructions/utils.instructions.md`         |

Each instruction file has an `applyTo` frontmatter field matching its package glob, and references
the package's `README.md` for full exports and examples.
