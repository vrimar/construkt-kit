import {
  type ComponentProps,
  type CSSProperties,
  type MouseEvent,
  useCallback,
  useState,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { carousel } from "#styled-system/recipes";

import { splitOptions } from "../../foundations/props";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import { useCompositeListItem } from "../../primitives/composite";
import { noDragProps } from "../../primitives/drag";
import { useHasTabbable } from "../../primitives/focus";
import { type RenderProp, dataAttr, mergeProps, renderable } from "../../primitives/render";
import { IconButton, type IconButtonProps } from "../Buttons";
import { createPartContext } from "../partContext";
import {
  CAROUSEL_ROOT_KEYS,
  type CarouselRoot,
  type CarouselRootOptions,
  useCarouselRoot,
} from "./carouselRoot";
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
const StyledPrevTrigger = withContext(IconButton, "prevTrigger");
const StyledNextTrigger = withContext(IconButton, "nextTrigger");
const StyledIndicatorGroup = withContext(renderable.div, "indicatorGroup");
const StyledIndicator = withContext(renderable.button, "indicator");

export type CarouselAutoplayTriggerState = {
  /** Whether the slides advance on their own. */
  playing: boolean;
};

interface AutoplayTriggerElementProps extends Omit<IconButtonProps, "render"> {
  render?: RenderProp<CarouselAutoplayTriggerState> | undefined;
  renderState: CarouselAutoplayTriggerState;
}

function AutoplayTriggerElement({ render, renderState, ...props }: AutoplayTriggerElementProps) {
  return (
    <IconButton
      {...props}
      render={
        typeof render === "function" ? (renderProps) => render(renderProps, renderState) : render
      }
    />
  );
}

const StyledAutoplayTrigger = withContext(AutoplayTriggerElement, "autoplayTrigger");

const [CarouselContext, useCarousel] = createPartContext<CarouselRoot>("<Carousel.Root>");

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface CarouselRootProps
  extends Omit<StyledRootProps, keyof CarouselRootOptions>, CarouselRootOptions {}

function Root(rootProps: CarouselRootProps) {
  const [options, props] = splitOptions(rootProps, CAROUSEL_ROOT_KEYS);
  const root = useCarouselRoot(options);

  return (
    <CarouselContext value={root}>
      <StyledRoot
        autoSize={options.autoSize ?? false}
        {...mergeProps<StyledRootProps>(
          {
            role: "region",
            "aria-roledescription": "carousel",
            "data-orientation": root.orientation,
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
  const root = useCarousel("Carousel.Control");
  return (
    <StyledControl
      data-orientation={root.orientation}
      {...props}
    />
  );
}

export type CarouselItemGroupProps = ComponentProps<typeof StyledItemGroup>;

function ItemGroup({ ref, ...props }: CarouselItemGroupProps) {
  const root = useCarousel("Carousel.ItemGroup");
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, setElement, root.setItemGroup);
  const hasTabbable = useHasTabbable(element, props.tabIndex === undefined);

  return (
    <StyledItemGroup
      {...mergeProps<CarouselItemGroupProps>(
        {
          id: root.itemGroupId,
          tabIndex: hasTabbable ? -1 : 0,
          "aria-live": root.running ? "off" : "polite",
          "data-orientation": root.orientation,
          "data-dragging": dataAttr(root.dragging),
          ...noDragProps,
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
  const root = useCarousel("Carousel.Item");
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
  const root = useCarousel("Carousel.PrevTrigger");
  return (
    <StyledPrevTrigger
      {...mergeProps<CarouselPrevTriggerProps>(
        {
          variant: "plain",
          size: "lg",
          disabled: !root.canScrollPrev,
          "aria-label": root.translations.prevTrigger,
          "aria-controls": root.mountedItemGroupId,
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
  const root = useCarousel("Carousel.NextTrigger");
  return (
    <StyledNextTrigger
      {...mergeProps<CarouselNextTriggerProps>(
        {
          variant: "plain",
          size: "lg",
          disabled: !root.canScrollNext,
          "aria-label": root.translations.nextTrigger,
          "aria-controls": root.mountedItemGroupId,
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
  const root = useCarousel("Carousel.Indicator");
  const register = useCompositeListItem(root.indicators, String(index));
  const composedRef = useComposedRefs<HTMLButtonElement>(register, ref);

  return (
    <StyledIndicator
      {...mergeProps<StyledIndicatorProps>(
        {
          type: props.render ? undefined : "button",
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
  const root = useCarousel("Carousel.IndicatorGroup");
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
  const root = useCarousel("Carousel.AutoplayTrigger");
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
          variant: "plain",
          size: "lg",
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
