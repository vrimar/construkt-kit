import { Box } from "@chakra-ui/react";

import { TruncatedText } from "../../Text";
import { type Cell, flexRender } from "@tanstack/react-table";

interface Props<TData> {
  cell: Cell<TData, any>;
}

export const BodyCell = <TData,>({ cell }: Props<TData>) => {
  const isVisible = cell.column.columnDef?.meta?.isVisible ?? true;
  const width = cell.column.columnDef?.meta?.width ?? cell.column.getSize();
  const widthPx = width ? `${width}px` : "auto";

  if (!isVisible) return null;

  const titleValue = cell.getValue();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      flex="1"
      p="2"
      fontSize="14px"
      style={{
        minWidth: widthPx,
        maxWidth: widthPx,
      }}
      overflow="hidden"
      title={typeof titleValue === "string" ? titleValue : undefined}
      position="relative"
    >
      <TruncatedText>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TruncatedText>
    </Box>
  );
};
