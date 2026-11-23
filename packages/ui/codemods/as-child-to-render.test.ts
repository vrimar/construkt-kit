import { expect, it } from "vitest";

import asChildToRender from "./as-child-to-render";
import { runCodemod } from "./run-codemod";

const KIT = 'import { Button, Menu, Popover, Tooltip } from "@construkt-kit/ui";';
const run = (source: string, imports = KIT) => runCodemod(asChildToRender, source, imports).output;

it("rewrites nested asChild parts from the inside out", () => {
  expect(
    run(
      "<Tooltip.Trigger asChild><Menu.Trigger asChild><Button>Open</Button></Menu.Trigger></Tooltip.Trigger>",
    ),
  ).toBe("<Tooltip.Trigger render={<Menu.Trigger render={<Button />} />}>Open</Tooltip.Trigger>");
});

it("rewrites a kit element under any local name or namespace, and leaves another library's asChild", () => {
  expect(
    run(
      '<><Tip.Trigger asChild><a href="/">Home</a></Tip.Trigger><Kit.Dialog.Trigger asChild><b>Open</b></Kit.Dialog.Trigger><Dialog.Trigger asChild><button>Open</button></Dialog.Trigger></>',
      [
        'import { Tooltip as Tip } from "@construkt-kit/ui";',
        'import * as Kit from "@construkt-kit/ui";',
        'import { Dialog } from "@radix-ui/react-dialog";',
      ].join("\n"),
    ),
  ).toBe(
    '<><Tip.Trigger render={<a href="/" />}>Home</Tip.Trigger><Kit.Dialog.Trigger render={<b />}>Open</Kit.Dialog.Trigger><Dialog.Trigger asChild><button>Open</button></Dialog.Trigger></>',
  );
});

it("leaves a dynamic asChild alone", () => {
  const source = "<Popover.Trigger asChild={linked}><a href={href}>Open</a></Popover.Trigger>";
  expect(run(source)).toBe(source);
});

it("moves an expression child, such as children or a ternary of two elements, to render", () => {
  expect(
    run(
      '<><Tooltip.Trigger asChild>{children}</Tooltip.Trigger><Menu.Trigger asChild>{linked ? <a href="/x">Open</a> : <button type="button">Open</button>}</Menu.Trigger></>',
    ),
  ).toBe(
    '<><Tooltip.Trigger render={children} /><Menu.Trigger render={linked ? <a href="/x">Open</a> : <button type="button">Open</button>} /></>',
  );
});
