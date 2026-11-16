import { renderToString } from "react-dom/server";
import { expect, test } from "vitest";

import { createFixture } from "../../test/fixture";
import { DataGrid } from "./DataGrid";

test("renders on the server without touching the DOM", () => {
  expect(() =>
    renderToString(
      <DataGrid
        {...createFixture(100, 10)}
        aria-label="Grid"
      />,
    ),
  ).not.toThrow();
});
