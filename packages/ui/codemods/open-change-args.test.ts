import jscodeshift from "jscodeshift";
import { expect, it, vi } from "vitest";

import openChangeArgs from "./open-change-args";

const j = jscodeshift.withParser("tsx");
const KIT =
  'import { Combobox, Dialog, FileUpload, Menu, Pagination, Popover, Switch, Tooltip, Wizard } from "@construkt-kit/ui";';
const run = (source: string, imports = KIT) =>
  openChangeArgs(
    { path: "app.tsx", source: `${imports}\n${source}` },
    { j, jscodeshift: j, stats: vi.fn(), report: vi.fn() },
  )
    .slice(imports.length + 1)
    .replace(/\s+/g, " ")
    .replace(/\( /g, "(")
    .replace(/ \)/g, ")")
    .replace(/\((\w+)\) =>/g, "$1 =>");

it("rewrites migrated components and leaves elements the kit does not migrate", () => {
  expect(
    run(
      "<><Popover.Root onOpenChange={({ open }) => setOpen(open)} /><Tooltip onOpenChange={(e) => track(e.open)} /><Menu.Root onSelect={({ value }) => run(value)} /><Wizard.Root onPageChange={({ page }) => go(page)} /></>",
    ),
  ).toBe(
    "<><Popover.Root onOpenChange={open => setOpen(open)} /><Tooltip onOpenChange={open => track(open)} /><Menu.Root onSelect={value => run(value)} /><Wizard.Root onPageChange={({ page }) => go(page)} /></>",
  );
});

it("moves the rest of the argument to details where the callback takes them", () => {
  expect(
    run(
      "<><Combobox.Root onInputValueChange={({ inputValue, reason }) => filter(reason, inputValue)} onOpenChange={(e) => log(e.open, e.reason)} /><Menu.Root onSelect={({ value, event }) => run(value, event)} /></>",
    ),
  ).toBe(
    "<><Combobox.Root onInputValueChange={(inputValue, { reason }) => filter(reason, inputValue)} onOpenChange={(open, e) => log(open, e.reason)} /><Menu.Root onSelect={({ value, event }) => run(value, event)} /></>",
  );
});

it("rewrites a kit element imported under another name or through a namespace", () => {
  expect(
    run(
      "<><P.Root onOpenChange={({ open }) => set(open)} /><Kit.Dialog.Root onOpenChange={({ open }) => set(open)} /></>",
      [
        'import { Popover as P } from "@construkt-kit/ui";',
        'import * as Kit from "@construkt-kit/ui";',
      ].join("\n"),
    ),
  ).toBe(
    "<><P.Root onOpenChange={open => set(open)} /><Kit.Dialog.Root onOpenChange={open => set(open)} /></>",
  );
});

it("leaves a control imported from Ark, whose callbacks still take an object", () => {
  expect(
    run(
      'import { Checkbox } from "@ark-ui/react/checkbox"; <><Checkbox.Root onCheckedChange={({ checked }) => set(checked)} /><Switch onCheckedChange={({ checked }) => set(checked)} /></>;',
    ),
  ).toBe(
    'import { Checkbox } from "@ark-ui/react/checkbox"; <><Checkbox.Root onCheckedChange={({ checked }) => set(checked)} /><Switch onCheckedChange={checked => set(checked)} /></>;',
  );
});

it("renames props and callbacks that changed their name, unless two would collide", () => {
  expect(
    run(
      "<><Pagination.Root page={page} onPageChange={({ page, pageSize }) => go(page, pageSize)} /><FileUpload.Root onFileChange={({ acceptedFiles }) => set(acceptedFiles)} onFileAccept={({ files }) => add(files)} /></>",
    ),
  ).toBe(
    "<><Pagination.Root value={page} onValueChange={(page, { pageSize }) => go(page, pageSize)} /><FileUpload.Root onFileChange={({ acceptedFiles }) => set(acceptedFiles)} onFileAccept={({ files }) => add(files)} /></>",
  );
});

it("names the value next where the key's name already means something in or around the handler", () => {
  expect(
    run(
      "const C = ({ open }) => <><Popover.Root onOpenChange={(e) => setOpen(e.open)} /><Dialog.Root onOpenChange={(e) => go(e.open, next)} /></>; const D = () => <Menu.Root onOpenChange={(e) => { if (open) log(); set(e.open); }} />;",
    ),
  ).toBe(
    "const C = ({ open }) => <><Popover.Root onOpenChange={next => setOpen(next)} /><Dialog.Root onOpenChange={nextOpen => go(nextOpen, next)} /></>; const D = () => <Menu.Root onOpenChange={next => { if (open) log(); set(next); }} />;",
  );
});
