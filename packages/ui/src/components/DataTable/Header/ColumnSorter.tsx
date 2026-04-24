import type { Header } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { Box } from "@b3/styled-system/jsx";
import { match } from "ts-pattern";

import { dataTableClasses } from "../types";

interface ColumnSorterProps<TData> {
  header: Header<TData, unknown>;
  onSort: () => unknown;
}

export const ColumnSorter = <TData,>({ header, onSort }: ColumnSorterProps<TData>) => {
  const column = header.column;
  const sort = column.getIsSorted();

  if (!column.getCanSort()) return null;

  return (
    <Box
      className={dataTableClasses.columnSorter}
      data-sorted={sort || undefined}
      onClick={onSort}
      cursor="pointer"
      css={{
        visibility: "hidden",
        color: "fg.subtle",
        "&[data-sorted]": {
          visibility: "visible",
          color: "colorPalette.fg",
        },
        _hover: { color: "colorPalette.fg" },
        "& svg": {
          width: "18px",
          height: "18px",
        },
      }}
    >
      {match(sort)
        .with("asc", () => <ArrowUpIcon />)
        .with("desc", () => <ArrowDownIcon />)
        .otherwise(() => (
          <ArrowUpDownIcon />
        ))}
    </Box>
  );
};
