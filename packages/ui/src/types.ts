import type { InputHTMLAttributes, Ref, RefObject } from "react";

import type {
  DataAttrs,
  DistributiveOmit,
  JsxStyleProps,
  SystemStyleObject,
} from "#styled-system/types";

/** Value of a `*Css` prop. Panda extracts it only when written as a JSX attribute literal. */
export type CssProp = SystemStyleObject | SystemStyleObject[];

/**
 * Props `P` without Panda style props or `*Css` props, plus `data-*` attributes, for objects of
 * props such as `triggerProps`. Panda never extracts styles nested in an object, so they would
 * render without CSS. `colorPalette` stays: the preset emits every palette statically.
 */
export type Unstyled<P, Keep extends PropertyKey = "colorPalette"> = DistributiveOmit<
  P,
  Exclude<keyof JsxStyleProps, Keep> | `${string}Css`
> &
  DataAttrs;

/** Props forwarded to a form control's hidden native `<input>`, such as `inputProps`. */
export type HiddenInputProps = Unstyled<InputHTMLAttributes<HTMLInputElement>>;

/** Convenience type for components that accept a forwarded ref.
 *  Defaults to HTMLDivElement when no element type is specified.
 */
export type WithRef<T, E extends Element = HTMLDivElement> = T & { ref?: Ref<E> };

/** Portal opt-out for overlay content. `HTMLElement | null` matches what `useRef` yields. */
export interface PortalledProps {
  portalled?: boolean;
  portalRef?: RefObject<HTMLElement | null>;
}
