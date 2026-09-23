import { Box, type BoxProps } from "@construkt-kit/styled-system/jsx";

import { gridRowStyle } from "./columnTemplate";

export const DataTableGridRow = (props: BoxProps) => (
  <Box
    role="row"
    display="grid"
    paddingX="2"
    borderBottomWidth="1px"
    borderColor="border"
    style={gridRowStyle}
    {...props}
  />
);
