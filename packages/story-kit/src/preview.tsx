/// <reference types="vite/client" />
import "./storybook.css";
import addonA11y from "@storybook/addon-a11y";
import addonThemes, { withThemeByClassName } from "@storybook/addon-themes";
import { definePreview } from "@storybook/react-vite";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

const preview = definePreview({
  addons: [addonA11y(), addonThemes()],
  decorators: [
    // Toolbar toggle adds the `dark` class to the preview <html> (matches the preset's `.dark &` condition).
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    viewport: { options: INITIAL_VIEWPORTS },
  },
  initialGlobals: {
    // Fluid/responsive canvas by default; the toolbar lets you pick a device.
    viewport: { value: undefined, isRotated: false },
  },
});

export default preview;
