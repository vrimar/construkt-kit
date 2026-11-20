import {
  type ComponentProps,
  type PointerEvent,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useSyncExternalStore,
} from "react";

import { type HTMLStyledProps, createSlotRecipeContext } from "#styled-system/jsx";
import {
  type ScrollAreaVariant,
  type ScrollAreaVariantProps,
  scrollArea,
} from "#styled-system/recipes";

import { splitInlineSizes } from "../../foundations/cssSize";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useLocale } from "../../primitives/locale";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { useStore } from "../../primitives/store";
import type { CssProp } from "../../types";
import {
  type ScrollAreaState,
  ScrollAreaNode,
  type ScrollEdges,
  type ScrollbarOrientation,
} from "./scrollAreaNode";

const { withProvider, withContext } = createSlotRecipeContext(scrollArea);

const StyledRoot = withProvider(renderable.div, "root");
const StyledViewport = withContext(renderable.div, "viewport");
const StyledContent = withContext(renderable.div, "content");
const StyledScrollbar = withContext(renderable.div, "scrollbar");
const StyledThumb = withContext(renderable.div, "thumb");
const StyledCorner = withContext(renderable.div, "corner");

const ScrollAreaContext = createContext<ScrollAreaNode | null>(null);
const ScrollbarContext = createContext<ScrollbarOrientation | null>(null);

function useScrollArea(part: string): ScrollAreaNode {
  const node = useContext(ScrollAreaContext);
  if (!node) throw new Error(`ScrollArea.${part} must be placed inside <ScrollArea.Root>.`);
  return node;
}

const selectEdges = (state: ScrollAreaState) => state.edges;
const selectHovering = (state: ScrollAreaState) => state.hovering;
const selectScrolling = (state: ScrollAreaState, orientation: ScrollbarOrientation) =>
  orientation === "vertical" ? state.scrollingY : state.scrollingX;
const selectDragging = (state: ScrollAreaState, orientation: ScrollbarOrientation) =>
  state.dragging === orientation;

const overflowAttributes = (edges: ScrollEdges) => ({
  "data-overflow-x": dataAttr(edges.overflowX),
  "data-overflow-y": dataAttr(edges.overflowY),
});

const edgeAttributes = (edges: ScrollEdges) => ({
  ...overflowAttributes(edges),
  "data-at-top": dataAttr(edges.atTop),
  "data-at-bottom": dataAttr(edges.atBottom),
  "data-at-left": dataAttr(edges.atLeft),
  "data-at-right": dataAttr(edges.atRight),
});

const pointerAttributes = (
  orientation: ScrollbarOrientation | undefined,
  hovering: boolean,
  dragging: boolean,
) => ({
  "data-orientation": orientation,
  "data-hover": dataAttr(hovering),
  "data-dragging": dataAttr(dragging),
});

const trackAttributes = (scrolling: boolean) => ({
  "data-scrolling": dataAttr(scrolling),
  "data-no-drag": "",
});

type RootProps = ComponentProps<typeof StyledRoot>;

function Root({ ref, ...props }: RootProps) {
  const [node] = useState(() => new ScrollAreaNode());
  const edges = useStore(node.store, selectEdges);
  const { dir } = useLocale();

  useLayoutEffect(() => {
    node.setDirection(dir);
    node.measure();
  }, [node, dir, edges.overflowX, edges.overflowY]);

  useLayoutEffect(() => node.checkHovering(), [node]);
  useEffect(() => () => node.clearTimers(), [node]);

  return (
    <ScrollAreaContext value={node}>
      <StyledRoot
        {...mergeProps<RootProps>(
          {
            role: "presentation",
            dir,
            ...edgeAttributes(edges),
            onPointerEnter: node.onRootPointer,
            onPointerMove: node.onRootPointer,
            onPointerDown: node.onRootPointer,
            onPointerLeave: node.onRootPointerLeave,
          },
          props,
        )}
        ref={useComposedRefs(ref, node.setRoot)}
      />
    </ScrollAreaContext>
  );
}

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

type ViewportProps = ComponentProps<typeof StyledViewport>;

function Viewport({ ref, ...props }: ViewportProps) {
  const node = useScrollArea("Viewport");
  const edges = useStore(node.store, selectEdges);
  const overflows = edges.overflowX || edges.overflowY;
  const [element, setElement] = useState<HTMLElement | null>(null);
  const hasTabbable = useHasTabbable(element, overflows && !props.render);
  const register = useCallback(
    (next: HTMLElement | null) => {
      setElement(next);
      return node.setViewport(next);
    },
    [node],
  );

  return (
    <StyledViewport
      {...mergeProps<ViewportProps>(
        {
          role: "presentation",
          // Chromium focuses a scroller with nothing focusable inside; a render element owns its focus.
          tabIndex: !props.render && overflows && !hasTabbable ? 0 : undefined,
          ...edgeAttributes(edges),
          onScroll: node.onViewportScroll,
          onWheel: node.onUserInteraction,
          onTouchMove: node.onUserInteraction,
          onPointerMove: node.onUserInteraction,
          onPointerEnter: node.onUserInteraction,
          onKeyDown: node.onUserInteraction,
        },
        props,
      )}
      ref={useComposedRefs(ref, register)}
    />
  );
}

type ContentProps = ComponentProps<typeof StyledContent>;

function Content({ ref, ...props }: ContentProps) {
  const node = useScrollArea("Content");
  const edges = useStore(node.store, selectEdges);

  return (
    <StyledContent
      {...mergeProps<ContentProps>({ role: "presentation", ...overflowAttributes(edges) }, props)}
      ref={useComposedRefs(ref, node.setContent)}
    />
  );
}

export type ScrollAreaScrollbarProps = ComponentProps<typeof StyledScrollbar> & {
  /** @default "vertical" */
  orientation?: ScrollbarOrientation | undefined;
};

function Scrollbar({ ref, orientation = "vertical", ...props }: ScrollAreaScrollbarProps) {
  const node = useScrollArea("Scrollbar");
  const edges = useStore(node.store, selectEdges);
  const hovering = useStore(node.store, selectHovering);
  const scrolling = useStore(node.store, selectScrolling, orientation);
  const dragging = useStore(node.store, selectDragging, orientation);
  const overflows = orientation === "vertical" ? edges.overflowY : edges.overflowX;

  return (
    <ScrollbarContext value={orientation}>
      <StyledScrollbar
        {...mergeProps<ComponentProps<typeof StyledScrollbar>>(
          {
            "aria-hidden": true,
            hidden: !overflows || undefined,
            ...pointerAttributes(orientation, hovering, dragging),
            ...overflowAttributes(edges),
            ...trackAttributes(scrolling),
            onPointerDown: (event: PointerEvent<HTMLElement>) =>
              node.onTrackPointerDown(event, orientation),
            onPointerUp: node.onPointerUp,
            onPointerCancel: node.onPointerUp,
            // A native scrollbar doesn't take focus from the page when pressed.
            onMouseDown: (event) => event.preventDefault(),
          },
          props,
        )}
        ref={useComposedRefs(ref, node.scrollbarRefs[orientation])}
      />
    </ScrollbarContext>
  );
}

type ThumbProps = ComponentProps<typeof StyledThumb>;

function Thumb({ ref, ...props }: ThumbProps) {
  const node = useScrollArea("Thumb");
  const orientation = useContext(ScrollbarContext);
  if (!orientation)
    throw new Error("ScrollArea.Thumb must be placed inside <ScrollArea.Scrollbar>.");
  const hovering = useStore(node.store, selectHovering);
  const dragging = useStore(node.store, selectDragging, orientation);

  return (
    <StyledThumb
      {...mergeProps<ThumbProps>(
        {
          ...pointerAttributes(orientation, hovering, dragging),
          onPointerDown: (event: PointerEvent<HTMLElement>) =>
            node.onThumbPointerDown(event, orientation),
          onPointerMove: node.onThumbPointerMove,
          onPointerUp: node.onPointerUp,
          onPointerCancel: node.onPointerUp,
        },
        props,
      )}
      ref={useComposedRefs(ref, node.thumbRefs[orientation])}
    />
  );
}

type CornerProps = ComponentProps<typeof StyledCorner>;

function Corner({ ref, ...props }: CornerProps) {
  const node = useScrollArea("Corner");
  const edges = useStore(node.store, selectEdges);
  const hovering = useStore(node.store, selectHovering);

  return (
    <StyledCorner
      {...mergeProps<CornerProps>(
        {
          "aria-hidden": true,
          hidden: !(edges.overflowX && edges.overflowY) || undefined,
          ...pointerAttributes(undefined, hovering, false),
          ...overflowAttributes(edges),
        },
        props,
      )}
      ref={useComposedRefs(ref, node.setCorner)}
    />
  );
}

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
