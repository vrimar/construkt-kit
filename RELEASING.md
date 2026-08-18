# Releasing

Releases are cut **locally**. Nothing publishes from CI — CI only
lint/typecheck/test/build/exports-gates pull requests (`.github/workflows/ci.yml`).

Versions are bumped by hand. `scripts/publish-packages.mjs` publishes whatever
version each `package.json` currently declares, so bumping a version is what
schedules a package for release.

## Flow

On an up-to-date `main`:

1. For each package you are releasing, bump `version` in its `package.json`.
2. Refresh the lockfile so the `workspace:*` links pick up the new versions:
   ```bash
   pnpm install --lockfile-only
   ```
3. Commit, then publish:
   ```bash
   git commit -am "Release"
   pnpm run release
   git push --follow-tags
   ```

`pnpm run release` runs `pnpm build`, validates every published package's exports
(`publint` + `arethetypeswrong`), then `scripts/publish-packages.mjs` — which packs
each package with `pnpm pack` (resolving `workspace:*`), uploads it with
`npm publish`, and creates a git tag per package. It is idempotent: anything already
on npm is skipped, so a package whose version you did not bump is a no-op.

> Why `pnpm pack` + `npm publish` rather than `pnpm publish`? Under pnpm 11,
> `pnpm publish` does not send the `~/.npmrc` auth token and fails with a
> misleading E404. Plain `npm publish` authenticates correctly.

## One-time setup

- **npm auth in `~/.npmrc`** — a classic **Automation** token (npmjs → Access
  Tokens → Classic Token → Automation):
  ```bash
  npm config set //registry.npmjs.org/:_authToken "npm_…"
  ```
  It bypasses 2FA; a "Publish" token fails with `E403 … bypass 2fa … required`.
  The committed `.npmrc` stays empty (pnpm 11 ignores env-var tokens there).

## Notes

- Use `pnpm run release` — bare `pnpm publish` invokes pnpm's built-in command, not
  this script.
- Publishing locally means npm **provenance** attestations are not generated (npm
  only produces those from a supported CI environment). If provenance becomes a
  requirement, move `release` into a CI workflow with npm OIDC trusted publishing.
