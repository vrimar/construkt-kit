# @construkt-kit/pages

## 0.10.0 — 2026-11-23

### Breaking

- Build on the kit's render prop and popup placement (`5145ae5d`)

### Features

- Add a /testing subpath of Playwright helpers for the auth pages (`19ae0135`)

### Other

- Flag invalid fields on submit instead of disabling it (`8b09d29a`)

### Package

- Peer @construkt-kit/ui >=0.12.0 → >=0.15.0
- Add peer dependency @playwright/test ^1.62.1
- Peer react ^19.0.0 → ^19.3.0
- Peer react-dom ^19.0.0 → ^19.3.0
- Change `peerDependenciesMeta` in package.json
- Change `exports` in package.json

## 0.9.0 — 2026-11-18

### Features

- Show a failed submit inline on the auth pages (`3a7c6a5`)

### Fixes

- Say Sign in, not Login, on the auth pages (`9c34ade`)
- Flip password rules beside the field when they don't fit (`94fbe18`)

## 0.8.1 — 2026-11-18

### Package

- lucide-react ^1.67.0 → ^1.73.0
- Change `license` in package.json
