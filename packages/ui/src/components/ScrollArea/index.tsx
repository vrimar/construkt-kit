import type { BoxProps } from "@chakra-ui/react";
import { Box } from "@chakra-ui/react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

interface Props extends BoxProps {
  scrollHideDelay?: number;
  horizontalEnabled?: boolean;
  verticalEnabled?: boolean;
}

export function ScrollArea({
  ref,
  children,
  scrollHideDelay,
  verticalEnabled = true,
  horizontalEnabled = true,
  ...props
}: Props & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <Box
      asChild
      position="relative"
      overflow="hidden"
      {...props}
    >
      <ScrollAreaPrimitive.Root scrollHideDelay={scrollHideDelay}>
        <Box
          asChild
          width="100%"
          height="100%"
          rounded="inherit"
          css={{
            "& > div": {
              display: "block !important",
              width: "100% !important",
              minWidth: "100% !important",
            },
          }}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ScrollAreaPrimitive.Viewport ref={ref as any}>{children}</ScrollAreaPrimitive.Viewport>
        </Box>
        {verticalEnabled && (
          <Box
            key="vertical"
            asChild
            display="flex"
            userSelect="none"
            bg="bg.subtle"
            transition="background 160ms ease-out"
            width="2"
          >
            <ScrollAreaPrimitive.Scrollbar orientation="vertical">
              <Box
                asChild
                flex="1"
                position="relative"
                bg="border"
                borderRadius="4px"
              >
                <ScrollAreaPrimitive.Thumb />
              </Box>
            </ScrollAreaPrimitive.Scrollbar>
          </Box>
        )}
        {horizontalEnabled && (
          <Box
            asChild
            key="horizontal"
            display="flex"
            userSelect="none"
            bg="bg.muted"
            transition="background 160ms ease-out"
            height="2"
            flexDirection="column"
          >
            <ScrollAreaPrimitive.Scrollbar orientation="horizontal">
              <Box
                asChild
                flex="1"
                position="relative"
                bg="border"
                borderRadius="4px"
              >
                <ScrollAreaPrimitive.Thumb />
              </Box>
            </ScrollAreaPrimitive.Scrollbar>
          </Box>
        )}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </Box>
  );
}
