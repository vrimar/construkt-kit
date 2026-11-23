import type { NumberFilterOperator, NumberFilterValue } from "@construkt-kit/utils";

import { joinRange } from "../../foundations/rangeText";

export const operatorSymbols: Record<NumberFilterOperator, string> = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
  between: "↔",
};

export const operatorLabels: Record<NumberFilterOperator, string> = {
  eq: "Equals",
  gt: "Greater than",
  gte: "Greater or equal",
  lt: "Less than",
  lte: "Less or equal",
  between: "Between",
};

/** A number filter as short text: its operator symbol and operand, or a range for `between`. */
export const formatNumberFilter = (filter: NumberFilterValue): string =>
  filter.operator === "between"
    ? joinRange(String(filter.value), String(filter.to))
    : `${operatorSymbols[filter.operator]} ${filter.value}`;
