import {
  Carousel as ArkCarousel,
  CarouselContext,
  useCarouselContext,
} from "@ark-ui/react/carousel";
import type { ComponentProps } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { carousel } from "#styled-system/recipes";
import { token } from "#styled-system/tokens";

const { withProvider, withContext } = createSlotRecipeContext(carousel);

const Root = withProvider(ArkCarousel.Root, "root", {
  forwardProps: ["page", "padding"],
  defaultProps: { spacing: token.var("spacing.4") },
});

export type CarouselRootProps = ComponentProps<typeof Root>;

const RootProvider = withProvider(ArkCarousel.RootProvider, "root");
const AutoplayTrigger = withContext(ArkCarousel.AutoplayTrigger, "autoplayTrigger");
const Control = withContext(ArkCarousel.Control, "control");
const Indicator = withContext(ArkCarousel.Indicator, "indicator");
const Item = withContext(ArkCarousel.Item, "item");
const ItemGroup = withContext(ArkCarousel.ItemGroup, "itemGroup", {
  defaultProps: { "data-no-drag": "" },
});
const NextTrigger = withContext(ArkCarousel.NextTrigger, "nextTrigger");
const PrevTrigger = withContext(ArkCarousel.PrevTrigger, "prevTrigger");

const StyledIndicatorGroup = withContext(ArkCarousel.IndicatorGroup, "indicatorGroup");
function IndicatorGroup({ ref, ...props }: ComponentProps<typeof StyledIndicatorGroup>) {
  const carouselCtx = useCarouselContext();

  return (
    <StyledIndicatorGroup
      {...props}
      ref={ref}
    >
      {carouselCtx.pageSnapPoints.map((_, index) => (
        <Indicator
          key={index}
          index={index}
        />
      ))}
    </StyledIndicatorGroup>
  );
}

export const Carousel = {
  Root,
  RootProvider,
  AutoplayTrigger,
  Control,
  Indicator,
  IndicatorGroup,
  Item,
  ItemGroup,
  NextTrigger,
  PrevTrigger,
  Context: CarouselContext,
};
