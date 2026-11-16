import preview from "@construkt-kit/story-kit/preview";
import { MoonIcon, SunIcon } from "lucide-react";

import { switchRecipe } from "#styled-system/recipes";

import { Switch } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta = preview.meta({
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
});

export const Default = meta.story({
  args: {
    children: "Enable notifications",
  },
});

export const Checked = meta.story({
  args: {
    children: "Active",
    defaultChecked: true,
  },
});

export const Disabled = meta.story({
  args: {
    children: "Unavailable",
    disabled: true,
  },
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={switchRecipe.variantMap.size}
      renderPreview={(size) => <Switch size={size}>{size}</Switch>}
    />
  ),
});

export const WithTrackLabel = meta.story({
  args: {
    children: "Theme",
    trackLabel: { on: <MoonIcon />, off: <SunIcon /> },
  },
});
