import type { ReactNode } from "react";

import { Box } from "../components/Layout";

export const fieldWidthDecorator = (Story: () => ReactNode) => (
  <Box
    w="full"
    maxW="320px"
  >
    <Story />
  </Box>
);
