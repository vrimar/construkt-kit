import { Box, type BoxProps } from "../components/Layout";

export const ResizableFrame = (props: BoxProps) => (
  <Box
    data-resizable-frame=""
    resize="horizontal"
    overflow="auto"
    maxW="full"
    minW="xs"
    borderWidth="1px"
    borderColor="border"
    borderRadius="md"
    {...props}
  />
);
