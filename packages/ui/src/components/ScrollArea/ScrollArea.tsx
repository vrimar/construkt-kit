import { ScrollArea as ArkScrollArea, useScrollAreaContext } from "@ark-ui/react/scroll-area";
import { type ComponentProps, useCallback, useState, useSyncExternalStore } from "react";

import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import {
  type ScrollAreaVariant,
  type ScrollAreaVariantProps,
  scrollArea,
} from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import { useComposedRefs } from "../../hooks/useComposedRefs";
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

const TABBABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

function useHasTabbable(node: HTMLElement | null, watch: boolean) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!node || !watch) return () => {};
      const observer = new MutationObserver(onChange);
      observer.observe(node, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["tabindex", "disabled", "href", "contenteditable"],
      });
      return () => observer.disconnect();
    },
    [node, watch],
  );

  return useSyncExternalStore(
    subscribe,
    () => !node || !watch || node.querySelector(TABBABLE) !== null,
    () => true,
  );
}

// Clears zag's inline `overflow: auto` so the recipe's per-axis overflow applies.
const Viewport = ({ ref, style, ...props }: ComponentProps<typeof StyledViewport>) => {
  const { hasOverflowX, hasOverflowY } = useScrollAreaContext();
  const overflows = hasOverflowX || hasOverflowY;
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const hasTabbable = useHasTabbable(node, overflows && !props.asChild);
  const composedRef = useComposedRefs(ref, setNode);

  // A scroller with nothing focusable inside takes focus itself, as Chromium does natively; null
  // drops zag's tabIndex, which it sets only when both axes overflow. An asChild element owns its focus.
  const focus: Record<string, unknown> = props.asChild
    ? {}
    : { tabIndex: overflows && !hasTabbable ? 0 : null };

  return (
    <StyledViewport
      ref={composedRef}
      {...focus}
      {...props}
      style={{ overflow: undefined, ...style }}
    />
  );
};

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

const ScrollAreaSimple = ({ ref, children, contentCss, style, ...props }: ScrollAreaProps) => {
  const [sizeStyle, rootProps] = splitInlineSizes(props, ["height", "maxHeight"]);
  const { scrollbars } = scrollArea.getVariantProps({ scrollbars: props.scrollbars });
  const showVertical = scrollbars === "vertical" || scrollbars === "both";
  const showHorizontal = scrollbars === "horizontal" || scrollbars === "both";

  return (
    <Root
      {...rootProps}
      style={{ ...sizeStyle, ...style }}
    >
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
