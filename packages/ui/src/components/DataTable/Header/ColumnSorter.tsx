import { Box } from "@chakra-ui/react";
import type { Header } from "@tanstack/react-table";
import { TbArrowDown, TbArrowsSort, TbArrowUp } from "react-icons/tb";
import { match } from "ts-pattern";

import { dataTableClasses } from "../types";

interface Props<TData> {
  header: Header<TData, any>;
  onSort: () => unknown;
}

export const ColumnSorter = ({ header, onSort }: Props<any>) => {
  const column = header.column;
  const sort = column.getIsSorted();

  if (!column.getCanSort()) return null;

  return (
    <Box
      className={dataTableClasses.columnSorter}
      visibility={sort ? "visible" : "hidden"}
      color={sort ? "primary" : "fg.subtle"}
      _hover={{ color: "primary" }}
      onClick={onSort}
      cursor="pointer"
      _icon={{
        boxSize: "18px",
      }}
    >
      {match(sort)
        .with("asc", () => <TbArrowUp />)
        .with("desc", () => <TbArrowDown />)
        .otherwise(() => (
          <TbArrowsSort />
        ))}
    </Box>
  );
};
