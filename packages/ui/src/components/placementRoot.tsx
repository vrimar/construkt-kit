import type { ElementType, ReactElement } from "react";

/** Lifts Ark's `positioning.placement` to a top-level `placement` prop on a floating root. */
export function createPlacementRoot<P extends { placement?: unknown }>(
  Root: ElementType,
): (props: P) => ReactElement {
  return function PlacementRoot({ placement, ...rest }: P) {
    return (
      <Root
        positioning={{ placement }}
        {...rest}
      />
    );
  };
}
