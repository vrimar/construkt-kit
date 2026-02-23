import type { TextProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";

export const TruncatedText = ({ children, ...otherProps }: Partial<TextProps>) => {
  return (
    <Box
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      {...otherProps}
    >
      {children}
    </Box>
  );
};
