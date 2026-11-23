# @construkt-kit/data-grid

## 0.3.0 — 2026-11-23

### Breaking

- Open a cell's tooltip on focus only when the focus is visible (`44c69565`)

### Features

- Add a /testing subpath of Playwright helpers for the grid (`3782be8f`)
- Let a grip drag drop across axes and report its moves (`d0d6fc58`)
- Add pointerSelection="add" to toggle headers and rows on a plain click (`d53c27e0`)

### Fixes

- Drop a column onto another group's column where canDropOnto allows (`0c2da0b5`)

### Other

- Depend on utils for sameItems and clampValue (`a7891691`)
- Reuse ui drag, focus and tooltip helpers (`92e4d35e`)

### Package

- Add dependency @construkt-kit/utils workspace:^
- Peer @construkt-kit/ui >=0.13.0 → >=0.15.0
- Add peer dependency @playwright/test ^1.62.1
- Peer react ^19.0.0 → ^19.3.0
- Peer react-dom ^19.0.0 → ^19.3.0
- Change `peerDependenciesMeta` in package.json
- Change `exports` in package.json

## 0.2.0 — 2026-11-18

### Features

- Mark selected rows and columns with a bar, not a frame (`6704641`)

### Other

- Render only the cells and headers whose inputs change (`ad66976`)

## 0.1.0 — 2026-11-18

First release.
