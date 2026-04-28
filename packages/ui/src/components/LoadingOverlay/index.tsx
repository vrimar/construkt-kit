import { Flex, type FlexProps, Stack } from "@construkt-kit/styled-system/jsx";

import { Spinner, type SpinnerProps } from "../Spinner";
import { Text } from "../Text";

export interface LoadingOverlayProps extends Omit<FlexProps, "fill"> {
  isActive: boolean;
  fill?: boolean;
  tip?: string;
  relative?: boolean;
  size?: SpinnerProps["size"];
}

export const LoadingOverlay = ({
  isActive,
  fill = true,
  tip = "Loading...",
  relative,
  size = "xl",
  ...props
}: LoadingOverlayProps) => {
  return (
    <Flex
      position={relative ? "relative" : "absolute"}
      left="0"
      zIndex="overlay"
      minHeight={relative ? "400px" : undefined}
      height="100%"
      width="100%"
      alignItems="center"
      background={fill ? "bg/75" : undefined}
      justifyContent="center"
      opacity={isActive ? "1" : "0"}
      visibility={isActive ? "visible" : "hidden"}
      pointerEvents={isActive ? "auto" : "none"}
      style={{
        transition: isActive
          ? "opacity .3s ease-in-out, background .3s ease-in-out"
          : "opacity .3s ease-in-out, visibility 0s ease-in-out .3s, background .3s ease-in-out",
      }}
      {...props}
    >
      <Stack
        gap="6"
        alignItems="center"
        userSelect="none"
      >
        <Spinner
          color="brand.fg"
          size={size}
        />
        {tip && <Text color="brand.fg">{tip}</Text>}
      </Stack>
    </Flex>
  );
};
