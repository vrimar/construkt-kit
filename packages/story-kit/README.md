# @construkt-kit/story-kit

Private workspace package. It holds the Storybook preview every story imports, the typed story-id list, and the
Playwright harness that tests every story at a desktop and a phone viewport.

## What a run checks

`pnpm test:stories` opens each story alone on the story gallery (`apps/storybook/gallery`), a small Vite page that
renders one story per URL through the same preview Storybook uses. For every story it:

- runs axe on the page, with Storybook's defaults (`region` off) plus any rule the story disables
- compares the accessibility tree with `apps/storybook/__baselines__/<project>/<story id>.aria.yml`; while a modal
  `<dialog>` is open, the tree is the topmost one's, since `showModal()` leaves the rest of the page inert
- compares a full-page screenshot with `apps/storybook/__baselines__/<project>/<story id>.png`

It also runs every behaviour spec (`packages/*/src/**/*.spec.ts`).

| Project        | Viewport       | Input | Checks                                          |
| -------------- | -------------- | ----- | ----------------------------------------------- |
| `desktop`      | 1280×900       | mouse | everything; skips stories tagged `phone-only`   |
| `phone`        | 390×844, touch | touch | everything; skips stories tagged `desktop-only` |
| `desktop-dark` | 1280×900, dark | mouse | axe only, on every story                        |

Every page renders at 11 March 2026 09:00 UTC, in `en-US`, at a device pixel ratio of 1, with Inter loaded. A
fingerprint check fails the test if any of that is not true.

## Pixels need the pinned browser

Screenshots are compared only in the Chromium of `mcr.microsoft.com/playwright`, pinned by digest in
`browser-image.json` and always run as `linux/amd64`. `pnpm test:stories` starts that container through Docker,
reuses it on later runs (one per checkout), builds the gallery with the published design-system CSS, and connects to
it. Without Docker the run is functional only: specs, axe and accessibility trees, but no pixels, and the report says
so. CI sets `STORIES_PIXELS=required`, which fails the run instead.

`pnpm stories:browser start|stop|status` manages the container by hand. A Playwright upgrade must move
`browser-image.json` to the matching image tag and digest, and every baseline is then re-accepted.

## Commands

| Command                                        | Does                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `pnpm test:stories`                            | Every story and spec                                                  |
| `pnpm test:stories:changed`                    | Stories and specs a change since `origin/main` can affect             |
| `pnpm test:stories --project phone -g X`       | Playwright filters pass through                                       |
| `pnpm stories:aria <story id>…`                | Rewrites accessibility snapshots after an intended change             |
| `pnpm stories:accept <story id>… --reason "…"` | On the owner's say-so: replaces screenshot baselines and commits them |
| `pnpm stories:ids`                             | Regenerates `src/story-ids.gen.ts` after adding or renaming stories   |
| `pnpm check:stories`                           | Every export has a story; every sheet overlay is covered              |

`test:stories:changed` follows each story's imports. A change to the preset, the preview, the gallery, this package
or a manifest runs everything; a change to `packages/ui/src` reruns every pages and data-grid story, because those
import ui as a package.

## Failures

Each run writes `apps/storybook/.stories-report/report.md` and `report.json`. A failure names the story file and
export, the project, its kind, and the command to rerun it. A visual failure also has an image under
`.stories-report/images/<project>/<story id>.png`: reference, actual and diff side by side, cropped to the changed
region and enlarged.

`report.html` beside them is for reviewing in a browser, from disk: one failed story at a time, desktop and phone side
by side at actual size. `j`/`k` move, `a` accepts and `x` marks for fixing, each moving on, and `c` copies the `stories:accept`
command for every story accepted, split by device where only one can be. Decisions survive a reload of the same run.
`?` lists every key.

| Kind               | Meaning and fix                                                                 |
| ------------------ | ------------------------------------------------------------------------------- |
| `visual`           | Pixels changed. Fix the code, or hand the story id and intent to the owner      |
| `dimension`        | The page changed size                                                           |
| `missing-baseline` | A new story has no screenshot yet; the owner accepts its first one              |
| `unstable`         | Two captures in a row differed; make the story deterministic, never accept it   |
| `a11y`             | axe violations                                                                  |
| `aria`             | The accessibility tree changed; fix it, or `pnpm stories:aria <id>` if intended |
| `spec`             | A behaviour spec failed                                                         |

## Baselines are the owner's

Snapshot update flags are refused. Only `pnpm stories:accept` replaces a screenshot baseline, run once the owner says
to accept: it accepts only a story whose last run failed with nothing but a visual, size or missing-baseline
difference, recaptures it twice, and commits the PNGs alone with a `Visual-change:` trailer. `--from-ci <run id>`
accepts the actual images a CI run uploaded, for changes made where Docker is unavailable.

CI fails any commit that changes a baseline PNG unless it changes only baselines.

## Writing stories

- Cross-package demos live in `apps/storybook/stories/`; Storybook, Panda, and the test gallery include them.
- Stories hold states. No `play` functions: interaction belongs in a behaviour spec
- A story that sets `globals.viewport` to a phone is tagged `phone-only`; one that only works at desktop width is
  tagged `desktop-only`
- An overlay has a story tagged `open-state` that renders it open on load
- The only accessibility opt-out is a named rule for a confirmed false positive:
  `parameters: { a11y: { config: { rules: [{ id: "color-contrast", enabled: false }] } } }`
- No `Date.now`, `new Date()` without arguments, `Math.random`, network images or timers on load

Lint enforces the first, second and fourth rule; `check:stories` the third.

## Writing behaviour specs

A spec sits next to the code it guards as `*.spec.ts` and names, in its test title, the behaviour it checks. Add one
when you change focus, keyboard, dismissal or open/close logic the kit owns, and be able to name the wrong change it
catches that nothing else does.

```ts
import { expect, selectStories, storyTags, test } from "@construkt-kit/story-kit/test";

for (const id of selectStories(["components-numberfilter--default"])) {
  test(
    `${id} switching to between keeps focus on the operator`,
    { tag: storyTags(id) },
    async ({ gallery, page }) => {
      await gallery.open(id);
      await gallery.press(page.getByRole("button", { name: "Equals" }));
      await gallery.press(page.getByRole("menuitemradio", { name: /Between/ }));
      await expect(page.getByRole("button", { name: "Between" })).toBeFocused();
    },
  );
}
```

- `gallery.press` taps on the phone project and clicks on desktop
- `gallery.swipe(target, dx, dy)` drags a real touch from the middle of `target` and holds it still before lifting,
  so the release goes by where it let go; it needs touch, so tag the test `@phone-only`. Pass `whileHeld` to act
  before the finger lifts
- Query overlay content through `page`; it renders outside the story root
- A phone sheet hides the page from the accessibility tree: locate a trigger by its id before opening
- `gallery.calls("onChange")` returns the calls recorded on a `fn()` story arg
- `gallery.resizeTo(locator, width)` resizes an element for layout that follows its own width
- `gallery.expectScreenshot(name)` is the only way to compare a screenshot from a spec
- Tag a test `@phone-only` or `@desktop-only` when it only applies to one device

Lint requires every spec test to act on the page and then assert.

Shared behaviour is registered once and runs against every component that shares it:
`packages/ui/src/components/sheetFrame.cases.ts` lists each overlay that opens as a phone sheet, and
`sheetFrame.spec.ts` checks Escape right after opening, focus returning on close, and tapping outside the sheet for
all of them. `check:stories` fails when a component starts importing `overlayPresentation` or `pickerPopup`
without a case there.
