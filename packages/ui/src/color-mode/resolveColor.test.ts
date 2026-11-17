import { afterEach, expect, test } from "vitest";

import { resolveColor } from "./resolveColor";

afterEach(() => {
  document.head.innerHTML = "";
  document.documentElement.className = "";
});

test("resolves a token in the asked scheme, not the page's", () => {
  const style = document.createElement("style");
  style.textContent = ":where(:root, .light) { --c: #112233; } .dark { --c: #445566; }";
  document.head.append(style);
  document.documentElement.className = "dark";

  expect(resolveColor("var(--c)", "light")).toBe("#112233");
  expect(resolveColor("var(--c)", "dark")).toBe("#445566");
});
