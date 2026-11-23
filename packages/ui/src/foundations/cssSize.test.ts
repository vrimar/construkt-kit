import { afterEach, expect, it } from "vitest";

import { cssLengthToPx } from "./cssSize";

afterEach(() => {
  document.documentElement.style.fontSize = "";
  document.body.replaceChildren();
});

it("reads rem by the root font size and em by the element's", () => {
  document.documentElement.style.fontSize = "10px";
  const element = document.createElement("div");
  element.style.fontSize = "20px";
  document.body.append(element);

  expect([cssLengthToPx("2rem", element), cssLengthToPx("2em", element)]).toEqual([20, 40]);
});
