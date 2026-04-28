import {
  Carousel as ArkCarousel,
  CarouselContext,
  useCarouselContext,
} from "@ark-ui/react/carousel";
import { createStyleContext } from "@construkt-kit/styled-system/jsx";
import { carousel } from "@construkt-kit/styled-system/recipes";
import type { ComponentProps } from "react";

import type { WithRef } from "../../types";

const { withProvider, withContext } = createStyleContext(carousel);

const Root = withProvider(ArkCarousel.Root, "root", {
  forwardProps: ["page"],
  defaultProps: { spacing: "4" },
});
const RootProvider = withProvider(ArkCarousel.RootProvider, "root");
const AutoplayTrigger = withContext(ArkCarousel.AutoplayTrigger, "autoplayTrigger");
const Control = withContext(ArkCarousel.Control, "control");
const Indicator = withContext(ArkCarousel.Indicator, "indicator");
const Item = withContext(ArkCarousel.Item, "item");
const ItemGroup = withContext(ArkCarousel.ItemGroup, "itemGroup");
const NextTrigger = withContext(ArkCarousel.NextTrigger, "nextTrigger");
const PrevTrigger = withContext(ArkCarousel.PrevTrigger, "prevTrigger");

const StyledIndicatorGroup = withContext(ArkCarousel.IndicatorGroup, "indicatorGroup");
function IndicatorGroup({ ref, ...props }: WithRef<ComponentProps<typeof StyledIndicatorGroup>>) {
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

export type CarouselRootProps = ComponentProps<typeof Root>;

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
