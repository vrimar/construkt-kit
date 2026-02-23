import { Text, type TextProps } from "@chakra-ui/react";

export const TextLabel = (props: TextProps) => {
  return (
    <Text
      fontWeight="medium"
      {...props}
    />
  );
};
