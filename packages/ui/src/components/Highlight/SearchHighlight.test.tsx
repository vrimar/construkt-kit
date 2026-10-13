import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SearchHighlight } from "./SearchHighlight";

describe("SearchHighlight", () => {
  it("highlights the longest word when one query word prefixes another", () => {
    const { container } = render(
      <SearchHighlight
        text="database"
        query="data database"
      />,
    );

    const marks = Array.from(container.querySelectorAll("mark"), (mark) => mark.textContent);
    expect(marks).toEqual(["database"]);
  });
});
