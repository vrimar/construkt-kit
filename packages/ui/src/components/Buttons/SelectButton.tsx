import { ChevronDownIcon, XIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";

import { HStack, splitCssProps } from "#styled-system/jsx";
import { splitButton } from "#styled-system/recipes";

import { useComposedRefs } from "../../hooks/useComposedRefs";
import type { WithRef } from "../../types";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import { Button, type ButtonProps } from "./Button";
import { Group } from "./Group";
import { IconButton } from "./IconButton";

export interface SelectButtonProps extends ButtonProps {
  sublabel?: ReactNode;
  hasValue: boolean;
  label: ReactNode;
  /** Shows the set look: a tinted background and border with colored text. */
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
  const expanded = props["aria-expanded"] === true || props["aria-expanded"] === "true";
  const look = active ? "subtle" : "surface";
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
      <Tooltip
        label={label}
        showWhenTruncated
        disabled={expanded}
      >
        <Text
          as="span"
          truncate
          flex="1"
          textAlign="left"
          color={hasValue ? undefined : "fg.subtle"}
        >
          {label}
        </Text>
      </Tooltip>
      {!onClear && <ChevronDownIcon />}
    </HStack>
  );

  // One tree whether or not `onClear` is set, so adding the clear button never remounts the focused one.
  const [{ colorPalette = palette, ...wrapperProps }, buttonProps] = splitCssProps(props);
  const variant = buttonProps.variant ?? look;

  return (
    <Group
      attached
      className={splitButton({ variant: active ? "surface" : variant })}
      {...wrapperProps}
    >
      <Button
        ref={composedRef}
        variant={look}
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
        <IconButton
          variant={variant}
          colorPalette={colorPalette}
          borderWidth={active ? "1px" : undefined}
          borderColor={active ? "colorPalette.subtle.border" : undefined}
          size={buttonProps.size}
          disabled={buttonProps.disabled}
          aria-label={clearLabel}
          onClick={(event) => {
            const clearButton = event.currentTarget;
            onClear();
            requestAnimationFrame(() => {
              if (!clearButton.isConnected) mainRef.current?.focus();
            });
          }}
        >
          <XIcon />
        </IconButton>
      )}
    </Group>
  );
};
