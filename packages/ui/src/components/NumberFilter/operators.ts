import type { NumberFilterOperator } from "@construkt-kit/utils";

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
