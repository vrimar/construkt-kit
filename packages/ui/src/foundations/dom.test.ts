import { afterEach, expect, it, vi } from "vitest";

import { isEditableTarget, submitImplicitly } from "./dom";

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

it("submits implicitly through the first submit button, and not while it is disabled", () => {
  const form = document.createElement("form");
  form.innerHTML = `
    <input name="code" />
    <button type="submit" disabled>Verify</button>
    <button type="submit">Later</button>`;
  document.body.append(form);
  const onSubmit = vi.fn((event: Event) => event.preventDefault());
  form.addEventListener("submit", onSubmit);

  submitImplicitly(form);
  expect(onSubmit).not.toHaveBeenCalled();

  form.querySelector("button")?.removeAttribute("disabled");
  submitImplicitly(form);
  expect(onSubmit).toHaveBeenCalledOnce();
});
