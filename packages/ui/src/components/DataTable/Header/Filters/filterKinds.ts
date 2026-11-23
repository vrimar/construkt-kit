import { parseDateRangeFilter, parseNumberFilter } from "@construkt-kit/utils";

import { joinRange } from "../../../../foundations/rangeText";
import { formatNumberFilter } from "../../../NumberFilter/operators";
import { selectItemLabel } from "../../columns";
import type { ColumnFilterType, ResolvedColumnMeta } from "../../types";

interface FilterKind<T> {
  parse: (raw: string) => T | undefined;
  describe: (values: string[], meta: ResolvedColumnMeta) => string;
}

const asText = (raw: string) => raw;

export const filterKinds = {
  input: {
    parse: asText,
    describe: ([first]) => first,
  },
  select: {
    parse: asText,
    describe: (values, meta) => values.map(selectItemLabel(meta)).join(", "),
  },
  date: {
    parse: parseDateRangeFilter,
    describe: ([first]) => {
      const range = parseDateRangeFilter(first);
      return range ? joinRange(...range) : first;
    },
  },
  number: {
    parse: parseNumberFilter,
    describe: ([first]) => {
      const filter = parseNumberFilter(first);
      return filter ? formatNumberFilter(filter) : first;
    },
  },
} satisfies { [Type in ColumnFilterType]: FilterKind<unknown> };
