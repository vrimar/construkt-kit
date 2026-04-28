import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

const construktKitTheme = create({
  base: "light",
  brandTitle: "Construkt Kit Design System",
  brandImage: "./images/logo.svg",
});

addons.setConfig({
  theme: construktKitTheme,
});
