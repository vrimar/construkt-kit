import { ScrollArea as ArkScrollArea } from "@ark-ui/react/scroll-area";
import type { ComponentProps } from "react";

import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import {
  type ScrollAreaVariant,
  type ScrollAreaVariantProps,
  scrollArea,
} from "#styled-system/recipes";

import type { CssProp } from "../../types";

const { withProvider, withContext } = createSlotRecipeContext(scrollArea);

const Root = withProvider(ArkScrollArea.Root, "root");
const StyledViewport = withContext(ArkScrollArea.Viewport, "viewport");
const StyledContent = withContext(ArkScrollArea.Content, "content");
const Scrollbar = withContext(ArkScrollArea.Scrollbar, "scrollbar", {
  defaultProps: { "data-no-drag": "" },
});
const Thumb = withContext(ArkScrollArea.Thumb, "thumb");
const Corner = withContext(ArkScrollArea.Corner, "corner");

// Clears zag's inline `overflow: auto` so the recipe's per-axis overflow applies.
const Viewport = ({ style, ...props }: ComponentProps<typeof StyledViewport>) => (
  <StyledViewport
    {...props}
    style={{ overflow: undefined, ...style }}
  />
);

// Clears zag's inline `min-width: fit-content` so the recipe's width applies and `css` can override it.
const Content = ({ style, ...props }: ComponentProps<typeof StyledContent>) => (
  <StyledContent
    {...props}
    style={{ minWidth: undefined, ...style }}
  />
);

export type ScrollAreaProps = Omit<HTMLStyledProps<"div">, "scrollbar"> &
  Omit<ScrollAreaVariantProps, "scrollbars"> & {
    /**
     * @default 'both'
     */
    scrollbars?: ScrollAreaVariant["scrollbars"];
    /** Styles for the scrolled content. */
    contentCss?: CssProp;
  };

const ScrollAreaSimple = ({ ref, children, contentCss, ...props }: ScrollAreaProps) => {
  const { scrollbars } = scrollArea.getVariantProps({ scrollbars: props.scrollbars });
  const showVertical = scrollbars === "vertical" || scrollbars === "both";
  const showHorizontal = scrollbars === "horizontal" || scrollbars === "both";

  return (
    <Root {...props}>
      <Viewport ref={ref}>
        <Content css={contentCss}>{children}</Content>
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
