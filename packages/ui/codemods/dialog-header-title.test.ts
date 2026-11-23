import { expect, it } from "vitest";

import dialogHeaderTitle from "./dialog-header-title";
import { runCodemod } from "./run-codemod";

const KIT = 'import { Dialog, Sheet } from "@construkt-kit/ui";';
const run = (source: string, imports = KIT) => runCodemod(dialogHeaderTitle, source, imports);

it("moves a plain header's title and description to the root, and a sheet header's ends to its content", () => {
  expect(
    run(
      '<><Dialog.Root aria-label="Archive"><Dialog.Content><Dialog.Header><Dialog.Title>Archive project?</Dialog.Title><Dialog.Description>{note}</Dialog.Description></Dialog.Header><Dialog.Body>…</Dialog.Body></Dialog.Content></Dialog.Root><Sheet.Root><Sheet.Content><Sheet.Header endElement={<Done />}><Sheet.Title>Filters</Sheet.Title></Sheet.Header></Sheet.Content></Sheet.Root></>',
    ),
  ).toEqual({
    output:
      '<><Dialog.Root title="Archive project?" description={note}><Dialog.Content><Dialog.Body>…</Dialog.Body></Dialog.Content></Dialog.Root><Sheet.Root title="Filters"><Sheet.Content headerEnd={<Done />} /></Sheet.Root></>',
    reported: 0,
  });
});

it("keeps a title's backslashes and entities as written", () => {
  expect(
    run(
      String.raw`<><D.Root><D.Content><D.Header><D.Title>Save to C:\temp</D.Title><D.Description>Size&nbsp;&lt;&nbsp;1 MB</D.Description></D.Header></D.Content></D.Root><D.Root><D.Content><D.Header><D.Title>&nbsp;</D.Title></D.Header></D.Content></D.Root></>`,
      'import { Dialog as D } from "@construkt-kit/ui";',
    ),
  ).toEqual({
    output: String.raw`<><D.Root title={<>Save to C:\temp</>} description={<>Size&nbsp;&lt;&nbsp;1 MB</>}><D.Content /></D.Root><D.Root title={<>&nbsp;</>}><D.Content /></D.Root></>`,
    reported: 0,
  });
});

it("leaves a header laid out another way, and reports a plain one whose root is elsewhere", () => {
  const source =
    '<><Dialog.Root aria-label="Export"><Dialog.Content><Dialog.Header><Icon /><Dialog.Title>Export</Dialog.Title></Dialog.Header></Dialog.Content></Dialog.Root><Dialog.Content><Dialog.Header><Dialog.Title>Rename</Dialog.Title></Dialog.Header></Dialog.Content></>';
  expect(run(source)).toEqual({ output: source, reported: 1 });
});
