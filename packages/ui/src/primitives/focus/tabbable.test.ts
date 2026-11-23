import { afterEach, expect, it } from "vitest";

import { getTabbables } from "./tabbable";

const mount = (html: string) => {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.append(container);
  return container;
};

const labels = (elements: HTMLElement[]) => elements.map((element) => element.ariaLabel);

afterEach(() => {
  document.body.replaceChildren();
});

it("finds tabbables in a DOM without layout, leaving out hidden and disabled ones", () => {
  const container = mount(`
    <input aria-label="name" />
    <button aria-label="save">Save</button>
    <button aria-label="disabled" disabled>Off</button>
    <span aria-label="skipped" tabindex="-1"></span>
    <div style="display: none"><button aria-label="collapsed">Gone</button></div>
    <div style="visibility: hidden"><button aria-label="invisible">Gone</button></div>
  `);

  expect(labels(getTabbables(container))).toEqual(["name", "save"]);
});

it("leaves out a hidden element with a positive tabindex", () => {
  const container = mount(`
    <button aria-label="save">Save</button>
    <div hidden><button aria-label="hidden" tabindex="2">Gone</button></div>
  `);

  expect(labels(getTabbables(container))).toEqual(["save"]);
});

it("leaves out controls a disabled fieldset disables", () => {
  const container = mount(`
    <fieldset disabled>
      <input aria-label="name" />
      <button aria-label="save">Save</button>
    </fieldset>
    <button aria-label="cancel">Cancel</button>
  `);

  expect(labels(getTabbables(container))).toEqual(["cancel"]);
});
