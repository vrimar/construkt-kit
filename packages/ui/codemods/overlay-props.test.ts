import jscodeshift from "jscodeshift";
import { expect, it, vi } from "vitest";

import overlayProps from "./overlay-props";

const j = jscodeshift.withParser("tsx");
const KIT =
  'import { ActionBar, Collapsible, Dialog, Menu, Popover, Tabs } from "@construkt-kit/ui";';
const run = (source: string, imports = KIT) => {
  const report = vi.fn();
  const output = overlayProps(
    { path: "app.tsx", source: `${imports}\n${source}` },
    { j, jscodeshift: j, stats: vi.fn(), report },
  )
    .slice(imports.length + 1)
    .replace(/\s+/g, " ");
  return { output, reported: report.mock.calls.length };
};

it("drops the removed overlay props and moves positioning to placement and anchor", () => {
  expect(
    run(
      '<><Popover.Root lazyMount unmountOnExit positioning={{ placement: "top" }}><Popover.Content portalled>Hi</Popover.Content></Popover.Root><Menu.Root positioning={{ placement, getAnchorRect: () => rect }} /><ActionBar.Content portalled={false} /></>',
    ),
  ).toEqual({
    output:
      '<><Popover.Root placement="top"><Popover.Content>Hi</Popover.Content></Popover.Root><Menu.Root placement={placement} anchor={{ getBoundingClientRect: () => rect }} /><ActionBar.Content portalled={false} /></>',
    reported: 0,
  });
});

it("puts placement where positioning was, so a spread before it still yields to it", () => {
  expect(
    run(
      '<P.Root lazyMount {...props} positioning={{ placement: "top" }} />',
      'import { Popover as P } from "@construkt-kit/ui";',
    ),
  ).toEqual({ output: '<P.Root {...props} placement="top" />', reported: 0 });
});

it("drops a disclosure root's mount props only where its panels already unmount", () => {
  expect(run("<><Tabs.Root lazyMount unmountOnExit /><Collapsible.Root lazyMount /></>")).toEqual({
    output: "<><Tabs.Root /><Collapsible.Root lazyMount /></>",
    reported: 1,
  });
});

it("leaves positioning with a key that has no replacement, and a dynamic lazyMount", () => {
  const source =
    '<><Popover.Root positioning={{ placement: "top", gutter: 4 }} /><Dialog.Root lazyMount={eager} /></>';
  expect(run(source)).toEqual({ output: source, reported: 2 });
});
