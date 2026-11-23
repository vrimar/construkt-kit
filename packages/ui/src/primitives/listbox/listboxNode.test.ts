import { expect, it } from "vitest";

import { ListboxNode, type ListboxNodeProps } from "./listboxNode";

const suggestionsOf = (...values: string[]): ListboxNodeProps => ({
  entries: values.map((value) => ({ value, label: value, disabled: false })),
  disabled: false,
  loopFocus: false,
  typeahead: false,
  alwaysShowHighlight: true,
  autoHighlight: true,
  scrollToIndex: undefined,
  onPick: () => {},
  onNavigate: undefined,
  onSelectAll: undefined,
  onHighlightChange: undefined,
  highlightControlled: false,
});

it("highlights the first option as typing changes the options, and keeps one the pointer moved to", () => {
  const node = new ListboxNode("list", null);
  node.update(suggestionsOf("apple", "banana"));
  expect(node.highlighted).toBe("apple");

  node.hover("banana");
  node.update(suggestionsOf("avocado", "banana"));
  expect(node.highlighted).toBe("banana");

  node.setSuggesting(true);
  node.update(suggestionsOf("blueberry", "banana"));
  expect(node.highlighted).toBe("blueberry");
});
