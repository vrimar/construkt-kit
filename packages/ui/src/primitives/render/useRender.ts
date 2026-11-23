import {
  Children,
  type HTMLAttributes,
  type JSX,
  type ReactElement,
  type Ref,
  type RefCallback,
  cloneElement,
  createElement,
  isValidElement,
} from "react";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import { mergeProps } from "./mergeProps";

export type RenderProps = HTMLAttributes<HTMLElement> & {
  ref?: RefCallback<HTMLElement> | null | undefined;
};

/**
 * Replaces the element a component renders: an element to clone with the component's props merged
 * in, or a function that receives those props and the component's state and returns the element.
 */
export type RenderProp<State = Record<string, never>> =
  | ReactElement
  | ((props: RenderProps, state: State) => ReactElement);

export type StateAttributes<State> = {
  [Key in keyof State]?: (value: State[Key]) => Record<string, string> | null;
};

export interface UseRenderParameters<State> {
  render?: RenderProp<State> | undefined;
  defaultTagName?: keyof JSX.IntrinsicElements | undefined;
  props?: Record<string, unknown> | undefined;
  ref?: Ref<Element> | undefined;
  state?: State | undefined;
  stateAttributes?: StateAttributes<State> | false | undefined;
}

const EMPTY_STATE = {};
const REACT_LAZY_TYPE = Symbol.for("react.lazy");

export function useRender<State extends Record<string, unknown>>({
  render,
  defaultTagName = "div",
  props,
  ref,
  state = EMPTY_STATE as State,
  stateAttributes,
}: UseRenderParameters<State>): ReactElement {
  const renderProp = unwrapLazy(render);
  const outProps: Record<string, unknown> = {
    ...(stateAttributes !== false && getStateAttributes(state, stateAttributes)),
    ...props,
  };
  outProps.ref = useComposedRefs(
    outProps.ref as Ref<Element> | undefined,
    isValidElement<{ ref?: Ref<Element> }>(renderProp) ? renderProp.props.ref : undefined,
    ref,
  );

  if (typeof renderProp === "function") return renderProp(outProps, state);
  if (renderProp) {
    const merged = mergeProps(outProps, renderProp.props as Record<string, unknown>);
    merged.ref = outProps.ref;
    return cloneElement(renderProp, merged);
  }
  return createElement(defaultTagName, outProps);
}

function getStateAttributes<State extends Record<string, unknown>>(
  state: State,
  mapping: StateAttributes<State> | undefined,
) {
  const attributes: Record<string, string> = {};
  for (const key in state) {
    const value = state[key];
    const custom = mapping?.[key];
    if (custom) {
      Object.assign(attributes, custom(value));
    } else if (value === true) {
      attributes[`data-${key.toLowerCase()}`] = "";
    } else if (value) {
      attributes[`data-${key.toLowerCase()}`] = String(value);
    }
  }
  return attributes;
}

// A render element created in a Server Component arrives as a lazy wrapper with no props (react#32392).
function unwrapLazy<R>(render: R): R {
  if ((render as { $$typeof?: symbol } | undefined)?.$$typeof !== REACT_LAZY_TYPE) return render;
  const unwrapped = Children.toArray(render as never)[0];
  return isValidElement(unwrapped) ? (unwrapped as R) : render;
}
