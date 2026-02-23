import type { FlexProps, SpinnerProps } from "@chakra-ui/react";
import { Flex, Spinner, Stack, Text } from "@chakra-ui/react";

export interface LoadingOverlayProps extends Omit<FlexProps, "fill"> {
  isActive: boolean;
  fill?: boolean;
  tip?: string;
  align?: "center" | "flex-end" | "flex-start";
  offset?: number;
  relative?: boolean;
  size?: SpinnerProps["size"];
}

export const LoadingOverlay = ({
  align = "center",
  isActive,
  fill = true,
  offset = 0,
  tip = "Loading...",
  relative,
  size = "xl",
  ...props
}: LoadingOverlayProps) => {
  return (
    <Flex
      className={isActive ? "is-active" : undefined}
      position={relative ? "relative" : "absolute"}
      top={offset}
      left="0"
      zIndex="overlay"
      minHeight={relative ? "400px" : undefined}
      height="100%"
      width="100%"
      alignItems={align}
      background={fill ? "rgba(255, 255, 255, 0.75)" : undefined}
      transition="opacity .3s ease-in-out,
      visibility 0s ease-in-out .3s,
      background .3s ease-in-out"
      justifyContent="center"
      willChange="opacity"
      opacity="0"
      visibility="hidden"
      {...props}
    >
      <Stack
        gap="6"
        alignItems="center"
        userSelect="none"
      >
        <Spinner
          color="primary"
          size={size}
        />
        {tip && <Text color="primary">{tip}</Text>}
      </Stack>
    </Flex>
  );
};
