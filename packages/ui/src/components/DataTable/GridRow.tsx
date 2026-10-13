import { Box, type BoxProps } from "#styled-system/jsx";

import { gridRowStyle } from "./columnTemplate";

export const DataTableGridRow = ({ style, ...props }: BoxProps) => (
  <Box
    role="row"
    display="grid"
    paddingX="2"
    borderBottomWidth="1px"
    borderColor="border"
    {...props}
    style={{ ...style, ...gridRowStyle }}
  />
);
