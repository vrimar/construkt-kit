import { afterEach, expect, it } from "vitest";

import { isEditableTarget } from "./dom";

afterEach(() => {
  document.body.replaceChildren();
});

it("reads contenteditable from the nearest attribute where isContentEditable is missing", () => {
  document.body.innerHTML = `
    <div contenteditable>
      <p id="inside">Draft</p>
      <span contenteditable="false" id="locked">Signature</span>
    </div>`;
  const byId = (id: string) => document.getElementById(id);

  expect([isEditableTarget(byId("inside")), isEditableTarget(byId("locked"))]).toEqual([
    true,
    false,
  ]);
});
