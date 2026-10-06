import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import { CloseButton } from "./Buttons";

export type CloseTriggerComponent<C extends ElementType> = (
  props: ComponentProps<C> & { children?: ReactNode },
) => ReactElement;

export function createCloseTrigger<C extends ElementType>(
  CloseTrigger: C,
): CloseTriggerComponent<C> {
  const TriggerElement: ElementType = CloseTrigger;

  return function CloseTriggerWithDefault({ children, ...props }) {
    if (children) return <TriggerElement {...props}>{children}</TriggerElement>;

    return (
      <TriggerElement
        {...props}
        asChild
      >
        <CloseButton size="sm" />
      </TriggerElement>
    );
  };
}
