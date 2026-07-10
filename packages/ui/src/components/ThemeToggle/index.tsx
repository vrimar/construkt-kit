import { MoonIcon, SunIcon } from "lucide-react";

import { useColorMode } from "../../color-mode";
import type { WithRef } from "../../types";
import { IconButton, type IconButtonProps } from "../Buttons";

export type ThemeToggleProps = Omit<IconButtonProps, "icon">;

/** Icon button that toggles light/dark. Requires a `ColorModeProvider` ancestor. */
export const ThemeToggle = ({
  ref,
  variant = "plain",
  onClick,
  ...props
}: WithRef<ThemeToggleProps, HTMLButtonElement>) => {
  const { resolvedMode, toggle } = useColorMode();
  const isDark = resolvedMode === "dark";

  return (
    <IconButton
      ref={ref}
      variant={variant}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      {...props}
      onClick={(event) => {
        toggle();
        onClick?.(event);
      }}
    />
  );
};
