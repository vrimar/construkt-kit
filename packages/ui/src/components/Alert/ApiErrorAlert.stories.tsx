import preview from "@construkt-kit/story-kit/preview";

import { ApiErrorAlert } from ".";

const meta = preview.meta({
  title: "Components/Alert/ApiErrorAlert",
  component: ApiErrorAlert,
  tags: ["autodocs"],
});

export const WithMessage = meta.story({
  args: {
    error: new Error("You don't have permission to edit this project."),
  },
});

export const Fallback = meta.story({
  args: {
    error: { status: 500 },
  },
});
