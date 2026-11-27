import { MoonIcon, SunIcon } from "lucide-react";

import { useColorMode } from "../../color-mode";
import { TooltipIconButton, type TooltipIconButtonProps } from "../Buttons";

export type ThemeToggleProps = Omit<TooltipIconButtonProps, "icon" | "label">;

/** Icon button that toggles light/dark, with a tooltip naming the switch. Requires a `ColorModeProvider` ancestor. */
export const ThemeToggle = ({ ref, variant = "plain", onClick, ...props }: ThemeToggleProps) => {
  const { resolvedMode, toggle } = useColorMode();
  const isDark = resolvedMode === "dark";

  return (
    <TooltipIconButton
      ref={ref}
      variant={variant}
      label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      icon={isDark ? <SunIcon /> : <MoonIcon />}
      {...props}
      onClick={(event) => {
        toggle();
        onClick?.(event);
      }}
    />
  );
};
