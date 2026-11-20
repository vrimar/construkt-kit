import type { HTMLStyledProps } from "#styled-system/jsx";

import type { RenderProp } from "../primitives/render";

/**
 * Styled `div` props for a root whose own props are `Base`, without the keys `Base` defines, so a
 * DOM `onSelect` or `defaultValue` can't stand in for the root's own.
 */
export type StyledRootProps<Base> = Omit<HTMLStyledProps<"div">, keyof Base> & {
  asChild?: never;
  render?: RenderProp | undefined;
};

export type WithRender<P> = P & { asChild?: never; render?: RenderProp | undefined };
