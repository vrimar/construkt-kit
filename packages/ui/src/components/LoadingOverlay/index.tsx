import { css } from "#styled-system/css";
import { Flex, type FlexProps, Stack } from "#styled-system/jsx";
import type { SpinnerVariant } from "#styled-system/recipes";

import { Spinner } from "../Spinner";
import { Text } from "../Text";

const RELATIVE_MIN_HEIGHT = { base: "240px", md: "400px" } as const;

type SpinnerSize = NonNullable<SpinnerVariant["size"]>;

const tipFontSizeClass: Record<SpinnerSize, string | undefined> = {
  inherit: undefined,
  xs: css({ fontSize: "xs" }),
  sm: css({ fontSize: "xs" }),
  md: css({ fontSize: "sm" }),
  lg: css({ fontSize: "sm" }),
  xl: css({ fontSize: "md" }),
  "2xl": css({ fontSize: "lg" }),
};

export interface LoadingOverlayProps extends FlexProps {
  loading: boolean;
  backdrop?: boolean;
  tip?: string;
  relative?: boolean;
  size?: SpinnerSize;
}

export const LoadingOverlay = ({
  loading,
  backdrop = true,
  tip = "Loading...",
  relative,
  size = "xl",
  ...props
}: LoadingOverlayProps) => {
  return (
    <Flex
      role="status"
      aria-busy={loading}
      aria-live="polite"
      position={relative ? "relative" : "absolute"}
      inset="0"
      zIndex="overlay"
      minHeight={relative ? RELATIVE_MIN_HEIGHT : undefined}
      height="100%"
      width="100%"
      alignItems="center"
      background={backdrop ? "bg/75" : undefined}
      justifyContent="center"
      opacity={loading ? "1" : "0"}
      visibility={loading ? "visible" : "hidden"}
      pointerEvents={loading ? "auto" : "none"}
      style={{
        transition: loading
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
        {tip && (
          <Text
            color="brand.fg"
            className={tipFontSizeClass[size]}
          >
            {tip}
          </Text>
        )}
      </Stack>
    </Flex>
  );
};
