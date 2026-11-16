import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";

import { HStack, splitCssProps } from "#styled-system/jsx";

import { isAriaExpanded } from "../../foundations/dom";
import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { WithRef } from "../../types";
import { Text } from "../Text";
import { Button, type ButtonProps } from "./Button";
import { ClearButton } from "./ClearButton";
import { SplitButton } from "./SplitButton";
import { TruncatedLabel } from "./TruncatedLabel";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: ReactNode;
  hasValue: boolean;
  label: ReactNode;
  /** Shows the set look: a tinted background and border with colored text. It overrides `variant`. */
  active?: boolean;
  /** Shows a clear button beside the value. */
  onClear?: () => void;
  /** Accessible name for the clear button. */
  clearLabel?: string;
}

export const SelectButton = ({
  ref,
  sublabel,
  label,
  hasValue,
  active,
  onClear,
  clearLabel = "Clear selection",
  ...props
}: WithRef<SelectButtonProps, HTMLButtonElement>) => {
  const mainRef = useRef<HTMLButtonElement>(null);
  const composedRef = useComposedRefs(ref, mainRef);
  const palette = active ? "brand" : "neutral";

  const content = (
    <HStack
      as="span"
      width="100%"
    >
      {sublabel && (
        <Text
          as="span"
          color={active ? undefined : "fg.muted"}
          fontWeight={active ? "normal" : undefined}
        >
          {sublabel}
        </Text>
      )}
      <TruncatedLabel
        expanded={isAriaExpanded(props["aria-expanded"])}
        flex="1"
        textAlign="left"
        color={hasValue ? undefined : "fg.subtle"}
      >
        {label}
      </TruncatedLabel>
      {!onClear && <ChevronDownIcon />}
    </HStack>
  );

  // One tree whether or not `onClear` is set, so adding the clear button never remounts the focused one.
  const [
    { colorPalette = palette, ...wrapperProps },
    { variant: inactiveVariant = "surface", ...buttonProps },
  ] = splitCssProps(props);
  const variant = active ? "subtle" : inactiveVariant;

  return (
    <SplitButton.Root
      variant={active ? "surface" : variant}
      {...wrapperProps}
    >
      <Button
        ref={composedRef}
        variant={variant}
        colorPalette={colorPalette}
        borderWidth={active ? "1px" : undefined}
        borderColor={active ? "colorPalette.subtle.border" : undefined}
        justifyContent="space-between"
        flex="1 1 auto"
        minW="0"
        {...buttonProps}
      >
        {content}
      </Button>
      {onClear && (
        <ClearButton
          variant={variant}
          colorPalette={colorPalette}
          borderWidth={active ? "1px" : undefined}
          borderColor={active ? "colorPalette.subtle.border" : undefined}
          size={buttonProps.size}
          disabled={buttonProps.disabled}
          aria-label={clearLabel}
          field={() => mainRef.current}
          onClick={onClear}
        />
      )}
    </SplitButton.Root>
  );
};
