import { type ReactElement, type ReactNode, cloneElement, isValidElement } from "react";

import type { RenderProp } from "../primitives/render";

type Wrap = (content: ReactNode) => ReactNode;

export function wrapRenderContent(
  render: RenderProp | undefined,
  children: ReactNode,
  wrap: Wrap,
): { render: RenderProp | undefined; children: ReactNode } {
  if (!rendersOwnContent(render)) return { render, children: wrap(children) };
  const own = render.props.children;
  return {
    render: cloneElement(render, {
      children:
        typeof own === "function"
          ? (...args: unknown[]) => wrap(own(...args))
          : wrap(own as ReactNode),
    }),
    children: undefined,
  };
}

export function rendersOwnContent(
  render: RenderProp | undefined,
): render is ReactElement<{ children?: unknown }> {
  return isValidElement<{ children?: unknown }>(render) && render.props.children !== undefined;
}

export function asRender(node: ReactNode): { render?: ReactElement; children?: ReactNode } {
  return isValidElement(node) ? { render: node } : { children: node };
}
