import preview from "@construkt-kit/story-kit/preview";

import { DragPreview } from ".";

const meta = preview.meta({
  title: "Components/Sortable/DragPreview",
  component: DragPreview,
  tags: ["autodocs"],
  args: {
    label: "Draft the Q3 roadmap",
  },
});

export const Single = meta.story();

export const Multiple = meta.story({
  args: { count: 4 },
});

export const Truncated = meta.story({
  args: {
    label: "Collect input from design, sales and support before the planning review",
    count: 2,
  },
});
