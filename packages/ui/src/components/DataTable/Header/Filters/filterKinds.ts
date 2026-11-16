import { parseDateRangeFilter, parseNumberFilter } from "@construkt-kit/utils";
import type { ComponentType } from "react";

import { formatNumberFilter } from "../../../NumberFilter";
import { selectItemLabel } from "../../columns";
import type { ColumnFilterProps, ColumnFilterType, ResolvedColumnMeta } from "../../types";
import { ColumnDateFilter } from "./ColumnDateFilter";
import { ColumnNumberFilter } from "./ColumnNumberFilter";
import { ColumnSearchInput } from "./ColumnSearchInput";
import { ColumnSelectFilter } from "./ColumnSelectFilter";

interface FilterKind<T> {
  Control: ComponentType<ColumnFilterProps>;
  parse: (raw: string) => T | undefined;
  describe: (values: string[], meta: ResolvedColumnMeta) => string;
}

const asText = (raw: string) => raw;

export const filterKinds = {
  input: {
    Control: ColumnSearchInput,
    parse: asText,
    describe: ([first]) => first,
  },
  select: {
    Control: ColumnSelectFilter,
    parse: asText,
    describe: (values, meta) => values.map(selectItemLabel(meta)).join(", "),
  },
  date: {
    Control: ColumnDateFilter,
    parse: parseDateRangeFilter,
    describe: ([first]) => parseDateRangeFilter(first)?.join(" – ") ?? first,
  },
  number: {
    Control: ColumnNumberFilter,
    parse: parseNumberFilter,
    describe: ([first]) => {
      const filter = parseNumberFilter(first);
      return filter ? formatNumberFilter(filter) : first;
    },
  },
} satisfies { [Type in ColumnFilterType]: FilterKind<unknown> };
