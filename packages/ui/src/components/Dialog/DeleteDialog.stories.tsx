import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { DeleteDialog } from ".";

const meta = preview.meta({
  title: "Components/Dialog/DeleteDialog",
  component: DeleteDialog,
  tags: ["autodocs", "open-state"],
  args: {
    title: "project",
    name: "Q3 planning",
    onClose: fn(),
    onSubmit: fn(),
  },
});

export const Default = meta.story();

export const Loading = meta.story({
  args: { loading: true },
});
