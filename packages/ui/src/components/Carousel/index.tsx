import {
  type ComponentProps,
  type ComponentPropsWithRef,
  type CSSProperties,
  type MouseEvent,
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { carousel } from "#styled-system/recipes";
import { token } from "#styled-system/tokens";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { getTabbables } from "../../primitives/focus";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import {
  type RenderProp,
  type StateAttributes,
  useRender,
} from "../../primitives/render/useRender";
import { type CarouselRoot, type CarouselRootOptions, useCarouselRoot } from "./carouselRoot";

export type {
  CarouselOrientation,
  CarouselTranslations,
  CarouselValueChangeDetails,
  CarouselValueChangeReason,
} from "./carouselRoot";

const { withProvider, withContext } = createSlotRecipeContext(carousel);

const StyledRoot = withProvider(renderable.div, "root");
const StyledControl = withContext(renderable.div, "control");
const StyledItemGroup = withContext(renderable.div, "itemGroup");
const StyledItem = withContext(renderable.div, "item");
const StyledPrevTrigger = withContext(renderable.button, "prevTrigger");
const StyledNextTrigger = withContext(renderable.button, "nextTrigger");
const StyledIndicatorGroup = withContext(renderable.div, "indicatorGroup");
const StyledIndicator = withContext(renderable.button, "indicator");

export type CarouselAutoplayTriggerState = {
  /** Whether the slides advance on their own. */
  playing: boolean;
};

const NO_STATE_ATTRIBUTES: StateAttributes<CarouselAutoplayTriggerState> = {
  playing: () => null,
};

interface AutoplayTriggerElementProps extends ComponentPropsWithRef<"button"> {
  render?: RenderProp<CarouselAutoplayTriggerState> | undefined;
  renderState: CarouselAutoplayTriggerState;
}

function AutoplayTriggerElement({ render, renderState, ...props }: AutoplayTriggerElementProps) {
  return useRender({
    defaultTagName: "button",
    render,
    props,
    state: renderState,
    stateAttributes: NO_STATE_ATTRIBUTES,
  });
}

const StyledAutoplayTrigger = withContext(AutoplayTriggerElement, "autoplayTrigger");

const SLIDE_SPACING = token.var("spacing.4");

const CarouselContext = createContext<CarouselRoot | null>(null);

function useCarousel(part: string): CarouselRoot {
  const context = useContext(CarouselContext);
  if (!context) throw new Error(`Carousel.${part} must be placed inside <Carousel.Root>.`);
  return context;
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface CarouselRootProps
  extends Omit<StyledRootProps, keyof CarouselRootOptions>, CarouselRootOptions {}

function Root({
  slideCount,
  value,
  defaultValue,
  onValueChange,
  orientation = "horizontal",
  slidesPerPage,
  slidesPerMove,
  spacing = SLIDE_SPACING,
  peek,
  loop,
  autoplay,
  allowMouseDrag,
  autoSize = false,
  inViewThreshold,
  translations,
  ...props
}: CarouselRootProps) {
  const root = useCarouselRoot({
    slideCount,
    value,
    defaultValue,
    onValueChange,
    orientation,
    slidesPerPage,
    slidesPerMove,
    spacing,
    peek,
    loop,
    autoplay,
    allowMouseDrag,
    autoSize,
    inViewThreshold,
    translations,
  });

  return (
    <CarouselContext value={root}>
      <StyledRoot
        autoSize={autoSize}
        {...mergeProps<StyledRootProps>(
          {
            role: "region",
            "aria-roledescription": "carousel",
            "data-orientation": orientation,
            dir: root.dir,
            ...root.rootProps,
          } as StyledRootProps,
          props,
        )}
      />
    </CarouselContext>
  );
}

export type CarouselControlProps = ComponentProps<typeof StyledControl>;

function Control(props: CarouselControlProps) {
  const root = useCarousel("Control");
  return (
    <StyledControl
      data-orientation={root.orientation}
      {...props}
    />
  );
}

export type CarouselItemGroupProps = ComponentProps<typeof StyledItemGroup>;

function ItemGroup({ ref, ...props }: CarouselItemGroupProps) {
  const root = useCarousel("ItemGroup");
  const elementRef = useRef<HTMLDivElement>(null);
  const ownRef = useComposedRefs<HTMLDivElement>(elementRef, root.setItemGroup);
  const composedRef = useComposedRefs<HTMLDivElement>(ownRef, ref);
  const ownTabIndex = props.tabIndex !== undefined;

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element || ownTabIndex) return;
    const syncTabIndex = () =>
      element.setAttribute("tabindex", getTabbables(element).length > 0 ? "-1" : "0");
    syncTabIndex();
    const observer = new MutationObserver(syncTabIndex);
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ownTabIndex]);

  return (
    <StyledItemGroup
      {...mergeProps<CarouselItemGroupProps>(
        {
          id: root.itemGroupId,
          "aria-live": root.running ? "off" : "polite",
          "data-orientation": root.orientation,
          "data-dragging": dataAttr(root.dragging),
          "data-no-drag": "",
          style: {
            "--carousel-slides-per-page": String(root.slidesPerPage),
            "--carousel-spacing": root.spacing,
            "--carousel-peek": root.peek,
          } as CSSProperties,
          ...root.itemGroupProps,
        } as CarouselItemGroupProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

type StyledItemProps = ComponentProps<typeof StyledItem>;

export interface CarouselItemProps extends StyledItemProps {
  /** The slide's position among the carousel's slides, from 0. */
  index: number;
  /** Which edge of the slide lines up with the carousel when a page starts at it. @default "start" */
  snapAlign?: "start" | "center" | "end" | undefined;
}

function Item({ ref, index, snapAlign = "start", ...props }: CarouselItemProps) {
  const root = useCarousel("Item");
  const composedRef = useComposedRefs<HTMLDivElement>(root.registerItem, ref);
  const inView = root.inView.includes(index);

  return (
    <StyledItem
      {...mergeProps<StyledItemProps>(
        {
          role: "group",
          "aria-roledescription": "slide",
          "aria-label": root.translations.item(index, root.slideCount),
          "aria-hidden": inView ? undefined : true,
          "data-index": index,
          "data-inview": dataAttr(inView),
          "data-orientation": root.orientation,
          style: {
            "--carousel-snap-align": root.snapsAt(index) ? snapAlign : "none",
          } as CSSProperties,
        } as StyledItemProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

export type CarouselPrevTriggerProps = ComponentProps<typeof StyledPrevTrigger>;

function PrevTrigger(props: CarouselPrevTriggerProps) {
  const root = useCarousel("PrevTrigger");
  return (
    <StyledPrevTrigger
      {...mergeProps<CarouselPrevTriggerProps>(
        {
          type: "button",
          disabled: !root.canScrollPrev,
          "aria-label": root.translations.prevTrigger,
          "aria-controls": root.itemGroupId,
          "data-orientation": root.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (!event.defaultPrevented) root.prev(event.nativeEvent);
          },
        } as CarouselPrevTriggerProps,
        props,
      )}
    />
  );
}

export type CarouselNextTriggerProps = ComponentProps<typeof StyledNextTrigger>;

function NextTrigger(props: CarouselNextTriggerProps) {
  const root = useCarousel("NextTrigger");
  return (
    <StyledNextTrigger
      {...mergeProps<CarouselNextTriggerProps>(
        {
          type: "button",
          disabled: !root.canScrollNext,
          "aria-label": root.translations.nextTrigger,
          "aria-controls": root.itemGroupId,
          "data-orientation": root.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (!event.defaultPrevented) root.next(event.nativeEvent);
          },
        } as CarouselNextTriggerProps,
        props,
      )}
    />
  );
}

type StyledIndicatorProps = ComponentProps<typeof StyledIndicator>;

export interface CarouselIndicatorProps extends StyledIndicatorProps {
  /** The page the indicator shows and moves to, from 0. */
  index: number;
  /** Shows the page without moving to it when pressed. @default false */
  readOnly?: boolean | undefined;
}

function Indicator({ ref, index, readOnly = false, ...props }: CarouselIndicatorProps) {
  const root = useCarousel("Indicator");
  const { indicators } = root;
  const register = useCallback(
    (element: HTMLButtonElement | null) => {
      if (!element) return;
      indicators.set(index, element);
      return () => {
        if (indicators.get(index) === element) indicators.delete(index);
      };
    },
    [indicators, index],
  );
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);

  return (
    <StyledIndicator
      {...mergeProps<StyledIndicatorProps>(
        {
          type: "button",
          "aria-label": root.translations.indicator(index),
          "data-index": index,
          "data-current": dataAttr(index === root.page),
          "data-read-only": dataAttr(readOnly),
          "data-orientation": root.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (event.defaultPrevented || readOnly) return;
            root.goToIndicator(index, "indicator-press", event.nativeEvent);
          },
        } as StyledIndicatorProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

export type CarouselIndicatorGroupProps = Omit<
  ComponentProps<typeof StyledIndicatorGroup>,
  "children"
>;

/** Renders an indicator for each page. */
function IndicatorGroup(props: CarouselIndicatorGroupProps) {
  const root = useCarousel("IndicatorGroup");
  return (
    <StyledIndicatorGroup
      {...mergeProps<CarouselIndicatorGroupProps>(
        {
          "data-orientation": root.orientation,
          onKeyDown: root.indicatorKeyDown,
        } as CarouselIndicatorGroupProps,
        props,
      )}
    >
      {Array.from({ length: root.pageCount }, (_, index) => (
        <Indicator
          key={index}
          index={index}
        />
      ))}
    </StyledIndicatorGroup>
  );
}

type StyledAutoplayTriggerProps = ComponentProps<typeof StyledAutoplayTrigger>;

export interface CarouselAutoplayTriggerProps extends Omit<
  StyledAutoplayTriggerProps,
  "renderState"
> {
  /** Replaces the button; a function also gets whether the slides are `playing`. */
  render?: RenderProp<CarouselAutoplayTriggerState> | undefined;
}

/** Starts and stops `autoplay`; `data-pressed` while the slides advance on their own. */
function AutoplayTrigger({ ref, ...props }: CarouselAutoplayTriggerProps) {
  const root = useCarousel("AutoplayTrigger");
  const { autoplayTriggers } = root;
  const register = useCallback(
    (element: HTMLButtonElement | null) => {
      if (!element) return;
      autoplayTriggers.add(element);
      return () => {
        autoplayTriggers.delete(element);
      };
    },
    [autoplayTriggers],
  );
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);

  return (
    <StyledAutoplayTrigger
      renderState={{ playing: root.playing }}
      {...mergeProps<CarouselAutoplayTriggerProps>(
        {
          type: "button",
          "aria-label": root.playing
            ? root.translations.autoplayStop
            : root.translations.autoplayStart,
          "data-pressed": dataAttr(root.playing),
          "data-orientation": root.orientation,
          onClick(event: MouseEvent<HTMLButtonElement>) {
            if (!event.defaultPrevented) root.togglePlaying();
          },
        } as CarouselAutoplayTriggerProps,
        props,
      )}
      ref={composedRef}
    />
  );
}

export const Carousel = {
  Root,
  Control,
  ItemGroup,
  Item,
  PrevTrigger,
  NextTrigger,
  IndicatorGroup,
  Indicator,
  AutoplayTrigger,
};
