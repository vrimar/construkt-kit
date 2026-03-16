import type { Header } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { Box } from "styled-system/jsx";
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
      visibility={sort ? "visible" : "hidden"}
      color={sort ? "brand.fg" : "fg.subtle"}
      _hover={{ color: "brand.fg" }}
      onClick={onSort}
      cursor="pointer"
      css={{
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
