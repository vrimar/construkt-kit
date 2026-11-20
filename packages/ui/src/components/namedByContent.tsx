import type { ComponentProps, ElementType, ReactElement } from "react";

import { renderable } from "../primitives/render";

function OwnLabel({
  ownLabel,
  ...props
}: ComponentProps<typeof renderable.button> & { ownLabel?: string }) {
  return (
    <renderable.button
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

  return function ContentNamedPart({ "aria-label": ownLabel, render, children, ...props }) {
    return (
      <PartElement
        {...props}
        render={
          <OwnLabel
            ownLabel={ownLabel}
            render={render}
          />
        }
      >
        {children}
      </PartElement>
    );
  };
}
