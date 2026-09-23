import type { ComponentProps, ElementType, ReactElement, ReactNode } from "react";

import { CloseButton } from "./Buttons";

export function createCloseTrigger<C extends ElementType>(
  CloseTrigger: C,
): (props: ComponentProps<C> & { children?: ReactNode }) => ReactElement {
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
