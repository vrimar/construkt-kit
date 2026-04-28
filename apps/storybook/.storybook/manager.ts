import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const construktKitTheme = create({
  base: "light",
  brandTitle: "Construkt Kit Design System",
  brandImage:
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40" width="120" height="40" fill="currentColor"><text x="0" y="32" font-family="system-ui, sans-serif" font-weight="700" font-size="38">ck</text></svg>',
    ),
});

addons.setConfig({
  theme: construktKitTheme,
});
