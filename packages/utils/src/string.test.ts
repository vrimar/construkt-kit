import { describe, expect, it } from "vitest";

import { toCamelCase } from "./string";

describe("toCamelCase", () => {
  it.each([
    ["hello world", "helloWorld"],
    ["Hello World", "helloWorld"],
    ["first_name", "firstName"],
    ["first-name", "firstName"],
    ["  _first__name- ", "firstName"],
    ["HELLO WORLD", "helloWorld"],
    ["SCREAMING_SNAKE_CASE", "screamingSnakeCase"],
    ["fooBar", "fooBar"],
    ["FooBar", "fooBar"],
    ["HTMLParser", "htmlParser"],
    ["v2 api", "v2Api"],
    ["", ""],
  ])("%j → %j", (input, expected) => {
    expect(toCamelCase(input)).toBe(expected);
  });
});
