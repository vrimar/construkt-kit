import { screen } from "@testing-library/react";

import type { SelectionValue } from "./types";
import { encodeSelectionValue } from "./useSelectionController";

export const produce = [
  { id: 1, name: "Apple", kind: "Fruit" },
  { id: 2, name: "Carrot", kind: "Vegetable" },
  { id: 3, name: "Banana", kind: "Fruit" },
];

export const groupLabels = () =>
  screen
    .getAllByRole("group")
    .map((group) => group.querySelector("[data-part='item-group-label']")?.textContent ?? null);

export const optionValues = () =>
  screen.getAllByRole("option").map((option) => option.getAttribute("data-value"));

export const encodedValues = (...values: SelectionValue[]) => values.map(encodeSelectionValue);
