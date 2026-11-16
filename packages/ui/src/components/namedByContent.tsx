import { ark } from "@ark-ui/react/factory";
import type { ComponentProps, ElementType, ReactElement } from "react";

function OwnLabel({
  ownLabel,
  ...props
}: ComponentProps<typeof ark.button> & { ownLabel?: string }) {
  return (
    <ark.button
      {...props}
      aria-label={ownLabel}
    />
  );
}

/** Wraps a part its machine labels over its content, so the content or own `aria-label` names it. */
export function namedByContent<C extends ElementType>(
  Part: C,
): (props: ComponentProps<C>) => ReactElement {
  const PartElement: ElementType = Part;

  return function ContentNamedPart({ "aria-label": ownLabel, asChild, children, ...props }) {
    return (
      <PartElement
        {...props}
        asChild
      >
        <OwnLabel
          ownLabel={ownLabel}
          asChild={asChild}
        >
          {children}
        </OwnLabel>
      </PartElement>
    );
  };
}
