import type { HTMLStyledProps } from "#styled-system/jsx";

/**
 * Styled `div` props for an Ark root whose own props are `Base`, without the keys `Base` defines.
 * Ark's `RootComponent<P>` lets `P` win, so a DOM `onSelect` or `defaultValue` left in `P`
 * would replace the root's own.
 */
export type StyledRootProps<Base> = Omit<HTMLStyledProps<"div">, keyof Base>;
