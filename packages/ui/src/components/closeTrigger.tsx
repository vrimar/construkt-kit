import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import type { RenderProp } from "../primitives/render";
import { CloseButton } from "./Buttons";
import { namedByContent } from "./namedByContent";

export type CloseTriggerComponent<C extends ElementType> = (
  props: ComponentProps<C> & { children?: ReactNode; render?: RenderProp | undefined },
) => ReactElement;

export function createCloseTrigger<C extends ElementType>(
  CloseTrigger: C,
): CloseTriggerComponent<C> {
  const TriggerElement: ElementType = namedByContent(CloseTrigger);

  return function CloseTriggerWithDefault({ children, ...props }) {
    if (children || props.render) {
      return (
        <TriggerElement
          data-no-autofocus=""
          {...props}
        >
          {children}
        </TriggerElement>
      );
    }

    // The trigger's label replaces the CloseButton's own, so the default name is set here.
    return (
      <TriggerElement
        aria-label="Close"
        data-no-autofocus=""
        {...props}
        render={<CloseButton size="sm" />}
      />
    );
  };
}
