import { VisuallyHidden } from "#styled-system/jsx";

import { Span } from "../Span";

type DisplayPrimitive = string | number | bigint | boolean;

interface DisplayValueBaseProps<T> {
  /** The value to display */
  value?: T | null | undefined;
}

interface DisplayValueFormatProps<T> {
  /**
   * Formats the non-empty value for display; returning `null`, `undefined` or `""` shows the
   * empty placeholder. Required unless the value is a primitive or an array of primitives.
   */
  formatValue: (value: NonNullable<T>) => string | null | undefined;
}

export type DisplayValueProps<T> = DisplayValueBaseProps<T> &
  ([NonNullable<T>] extends [DisplayPrimitive | readonly DisplayPrimitive[]]
    ? Partial<DisplayValueFormatProps<T>>
    : DisplayValueFormatProps<T>);

export const DisplayValue = <T = never,>(props: DisplayValueProps<T>) => {
  const { value, formatValue } = props;

  const formattedValue = isNotEmpty(value) ? (formatValue ?? String)(value) : null;

  if (formattedValue) {
    return formattedValue;
  }

  return (
    <>
      <Span
        color="fg.subtle"
        aria-hidden
      >
        —
      </Span>
      <VisuallyHidden>No value available</VisuallyHidden>
    </>
  );
};

const isString = (value: unknown): value is string => typeof value === "string";

const isNotEmpty = <T,>(value: T | null | undefined): value is NonNullable<T> => {
  if (value == null) return false;
  if (isString(value) || Array.isArray(value)) return value.length > 0;
  return true;
};
