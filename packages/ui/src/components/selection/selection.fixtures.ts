import { screen } from "@testing-library/react";

import { encodeSelectionValue } from "./selectionValue";
import type { SelectionValue } from "./types";

export const produce = [
  { id: 1, name: "Apple", kind: "Fruit" },
  { id: 2, name: "Carrot", kind: "Vegetable" },
  { id: 3, name: "Banana", kind: "Fruit" },
];

export type Produce = (typeof produce)[number];

export const produceProps = {
  items: produce,
  getItemValue: (item: Produce) => item.id,
  getItemLabel: (item: Produce) => item.name,
};

export const groupLabels = () =>
  screen
    .getAllByRole("group")
    .map((group) => group.querySelector(".listbox__itemGroupLabel")?.textContent ?? null);

export const highlightedValue = () =>
  document.querySelector(".listbox__item[data-highlighted]")?.getAttribute("data-value");

export const optionValues = () =>
  screen.getAllByRole("option").map((option) => option.getAttribute("data-value"));

export const encodedValues = (...values: SelectionValue[]) => values.map(encodeSelectionValue);
