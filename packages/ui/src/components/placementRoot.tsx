import type { ElementType, ReactElement } from "react";

/** Lifts Ark's `positioning.placement` to a top-level `placement` prop on a floating root. */
export function createPlacementRoot<
  P extends { placement?: unknown; positioning?: { placement?: unknown } | undefined },
>(Root: ElementType): (props: P) => ReactElement {
  return function PlacementRoot({ placement, positioning, ...rest }: P) {
    return (
      <Root
        positioning={{ ...positioning, placement: placement ?? positioning?.placement }}
        {...rest}
      />
    );
  };
}
