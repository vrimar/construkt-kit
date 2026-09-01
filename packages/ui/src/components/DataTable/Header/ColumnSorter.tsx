import { Box } from "@construkt-kit/styled-system/jsx";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { match } from "ts-pattern";

import type { DataTableHeader } from "../types";
import { dataTableClasses } from "../types";

const iconSize = 18;
const iconGap = 4;

export const columnSorterGutter = iconSize + iconGap;

interface ColumnSorterProps<TData extends object> {
  header: DataTableHeader<TData>;
  onSort: () => unknown;
}

export const ColumnSorter = <TData extends object>({
  header,
  onSort,
}: ColumnSorterProps<TData>) => {
  const column = header.column;
  const sort = column.getIsSorted();

  if (!column.getCanSort()) return null;

  return (
    <Box
      className={dataTableClasses.columnSorter}
      data-sorted={sort || undefined}
      onClick={onSort}
      cursor="pointer"
      position="absolute"
      left="100%"
      top="0"
      bottom="0"
      display="flex"
      alignItems="center"
      style={{ marginLeft: `${iconGap}px` }}
      css={{
        visibility: "hidden",
        color: "fg.subtle",
        "&[data-sorted]": {
          visibility: "visible",
          color: "colorPalette.fg",
        },
        _hover: { color: "colorPalette.fg" },
      }}
    >
      {match(sort)
        .with("asc", () => <ArrowUpIcon size={iconSize} />)
        .with("desc", () => <ArrowDownIcon size={iconSize} />)
        .otherwise(() => (
          <ArrowUpDownIcon size={iconSize} />
        ))}
    </Box>
  );
};
