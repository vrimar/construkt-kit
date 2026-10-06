import { Portal } from "@ark-ui/react/portal";
import type { ComponentProps, ElementType, ReactElement } from "react";

import type { PortalledProps, WithRef } from "../types";

export type PortalledContentComponent<C extends ElementType> = (
  props: WithRef<ComponentProps<C> & PortalledProps>,
) => ReactElement;

/** Builds the `Portal → Positioner → Content` body every floating surface shares. */
export function createPortalledContent<C extends ElementType>(
  Positioner: ElementType,
  Content: C,
): PortalledContentComponent<C> {
  const ContentElement: ElementType = Content;

  return function PortalledContent({ ref, portalled = true, portalRef, ...rest }) {
    return (
      <Portal
        disabled={!portalled}
        container={portalRef}
      >
        <Positioner>
          <ContentElement
            animation="none"
            ref={ref}
            {...rest}
          />
        </Positioner>
      </Portal>
    );
  };
}
