import { type ReactNode, cloneElement, isValidElement } from "react";

export function wrapAsChildContent(child: ReactNode, wrap: (content: ReactNode) => ReactNode) {
  if (!isValidElement<{ children?: unknown }>(child)) return child;
  const { children } = child.props;
  return cloneElement(child, {
    children:
      typeof children === "function"
        ? (...args: unknown[]) => wrap(children(...args))
        : wrap(children as ReactNode),
  });
}
