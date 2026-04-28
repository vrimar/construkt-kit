import { ScrollArea as ArkScrollArea } from "@ark-ui/react/scroll-area";
import { type HTMLStyledProps, createStyleContext } from "@construkt-kit/styled-system/jsx";
import { type ScrollAreaVariantProps, scrollArea } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(scrollArea);

const Root = withProvider(ArkScrollArea.Root, "root");
const Viewport = withContext(ArkScrollArea.Viewport, "viewport");
const Content = withContext(ArkScrollArea.Content, "content");
const Scrollbar = withContext(ArkScrollArea.Scrollbar, "scrollbar");
const Thumb = withContext(ArkScrollArea.Thumb, "thumb");
const Corner = withContext(ArkScrollArea.Corner, "corner");

export type ScrollAreaProps = Omit<HTMLStyledProps<"div">, "scrollbar"> &
  ScrollAreaVariantProps & {
    /**
     * @default 'both'
     */
    scrollbars?: "vertical" | "horizontal" | "both";
    contentProps?: ComponentProps<typeof Content>;
  };

const ScrollAreaSimple = ({
  ref,
  children,
  scrollbars = "both",
  contentProps,
  ...props
}: WithRef<ScrollAreaProps>) => {
  const showVertical = scrollbars === "vertical" || scrollbars === "both";
  const showHorizontal = scrollbars === "horizontal" || scrollbars === "both";

  return (
    <Root {...props}>
      <Viewport ref={ref}>
        <Content {...contentProps}>{children}</Content>
      </Viewport>
      {showVertical && (
        <Scrollbar orientation="vertical">
          <Thumb />
        </Scrollbar>
      )}
      {showHorizontal && (
        <Scrollbar orientation="horizontal">
          <Thumb />
        </Scrollbar>
      )}
      {showVertical && showHorizontal && <Corner />}
    </Root>
  );
};

export const ScrollArea = Object.assign(ScrollAreaSimple, {
  Root,
  Viewport,
  Content,
  Scrollbar,
  Thumb,
  Corner,
});
