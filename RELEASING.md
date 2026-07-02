# Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets)
via `.github/workflows/release.yml`.

## Normal flow (CI)

1. In your feature branch, add a changeset describing the change:
   ```bash
   pnpm changeset
   ```
   Commit the generated `.changeset/*.md` file with your PR.
2. When the PR merges to `main`, the Release workflow opens (or updates) a
   **"Version Packages"** PR that applies the version bumps + changelogs.
3. Merge the **Version Packages** PR. The workflow then runs `pnpm release`
   (`changeset publish`), which publishes the changed packages to npm and pushes
   git tags.

Nothing is published from a developer machine.

## One-time setup

- **`NPM_TOKEN` repo secret** — a classic **Automation** token (npmjs → Access
  Tokens → Classic Token → Automation). It bypasses 2FA; a "Publish" token fails
  with `E403 … bypass 2fa … required`.
- Enable **Settings → Actions → General → Allow GitHub Actions to create and
  approve pull requests** (so the workflow can open the Version Packages PR).

## Local publish (fallback only)

Prefer CI. If you must publish locally:

```bash
# token in user-level ~/.npmrc (see .npmrc); must be an Automation token
git config tag.gpgsign false   # changeset publish uses lightweight tags
pnpm changeset                 # if not already added
pnpm run version-packages
git commit -am "Release"
pnpm run release
git push --follow-tags
```

Note: use `pnpm run version-packages` / `pnpm run release` — bare `pnpm version`
and `pnpm publish` invoke pnpm's built-in commands, not these scripts.
