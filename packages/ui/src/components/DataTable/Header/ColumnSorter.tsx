import { Box } from "@construkt-kit/styled-system/jsx";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import type { DataTableHeader } from "../types";

const iconSize = 18;
const iconGap = 4;

export const columnSorterGutter = iconSize + iconGap;

const sortIcons = { asc: ArrowUpIcon, desc: ArrowDownIcon };

interface ColumnSorterProps<TData extends object> {
  header: DataTableHeader<TData>;
}

export const ColumnSorter = <TData extends object>({ header }: ColumnSorterProps<TData>) => {
  const column = header.column;
  const sort = column.getIsSorted();

  if (!column.getCanSort()) return null;

  const SortIcon = sort ? sortIcons[sort] : ArrowUpDownIcon;

  const handleSort = () => {
    if (!sort) column.toggleSorting(false); // unsorted → asc
    else if (sort === "asc") column.toggleSorting(true); // asc → desc
    else column.clearSorting(); // desc → clear
  };

  return (
    <Box
      data-part="column-sorter"
      data-sorted={sort || undefined}
      onClick={handleSort}
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
      <SortIcon size={iconSize} />
    </Box>
  );
};
