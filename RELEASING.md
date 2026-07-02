# Releasing

Releases are cut **locally** with [Changesets](https://github.com/changesets/changesets).
Nothing publishes from CI — CI only lint/typecheck/test/build/exports-gates pull
requests (`.github/workflows/ci.yml`).

## Flow

1. While working, add a changeset describing the change and commit the generated
   `.changeset/*.md` file:
   ```bash
   pnpm changeset
   ```
2. When ready to publish, on an up-to-date `main`:
   ```bash
   pnpm run version-packages   # apply version bumps + changelogs + lockfile
   git commit -am "Release"
   pnpm run release            # build + validate exports + changeset publish
   git push --follow-tags
   ```

`pnpm run release` runs `pnpm build`, validates every published package's exports
(`publint` + `arethetypeswrong`), then `scripts/publish-packages.mjs` — which packs
each changed package with `pnpm pack` (resolving `workspace:*`), uploads it with
`npm publish`, and creates a git tag per package. It is idempotent: anything already
on npm is skipped.

> Why not `changeset publish`? Under pnpm 11, `pnpm publish` (which `changeset
> publish` invokes) does not send the `~/.npmrc` auth token and fails with a
> misleading E404. Plain `npm publish` authenticates correctly, so the script uses
> `pnpm pack` + `npm publish`.

## One-time setup

- **npm auth in `~/.npmrc`** — a classic **Automation** token (npmjs → Access
  Tokens → Classic Token → Automation):
  ```bash
  npm config set //registry.npmjs.org/:_authToken "npm_…"
  ```
  It bypasses 2FA; a "Publish" token fails with `E403 … bypass 2fa … required`.
  The committed `.npmrc` stays empty (pnpm 11 ignores env-var tokens there).
- `git config tag.gpgsign false` — `changeset publish` uses lightweight tags.

## Notes

- Use `pnpm run version-packages` / `pnpm run release` — bare `pnpm version` and
  `pnpm publish` invoke pnpm's built-in commands, not these scripts.
- Publishing locally means npm **provenance** attestations are not generated (npm
  only produces those from a supported CI environment). If provenance becomes a
  requirement, move `version-packages` + `release` into a CI workflow with npm
  OIDC trusted publishing.
