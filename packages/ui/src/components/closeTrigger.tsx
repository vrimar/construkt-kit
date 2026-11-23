import type { ComponentProps, ElementType, MouseEvent, ReactElement, ReactNode } from "react";

import { NO_AUTOFOCUS_ATTRIBUTE } from "../primitives/focus";
import type { RenderProp } from "../primitives/render";
import { CloseButton } from "./Buttons";

export type CloseTriggerComponent<C extends ElementType> = (
  props: ComponentProps<C> & { children?: ReactNode; render?: RenderProp | undefined },
) => ReactElement;

type CloseHandler = (event: MouseEvent<HTMLElement>) => void;

const useNoClose = (): CloseHandler | undefined => undefined;

export function createCloseTrigger<C extends ElementType>(
  CloseTrigger: C,
  useClose: () => CloseHandler | undefined = useNoClose,
): CloseTriggerComponent<C> {
  const TriggerElement: ElementType = CloseTrigger;

  return function CloseTriggerWithDefault({ children, ...props }) {
    const close = useClose();
    const { onClick } = props as { onClick?: CloseHandler };
    const handleClick = (event: MouseEvent<HTMLElement>) => {
      onClick?.(event);
      if (!event.defaultPrevented) close?.(event);
    };

    if (children || props.render) {
      return (
        <TriggerElement
          type={props.render ? undefined : "button"}
          {...{ [NO_AUTOFOCUS_ATTRIBUTE]: "" }}
          {...props}
          onClick={handleClick}
        >
          {children}
        </TriggerElement>
      );
    }

    // The trigger's label replaces the CloseButton's own, so the default name is set here.
    return (
      <TriggerElement
        aria-label="Close"
        {...{ [NO_AUTOFOCUS_ATTRIBUTE]: "" }}
        {...props}
        onClick={handleClick}
        render={<CloseButton size="sm" />}
      />
    );
  };
}
