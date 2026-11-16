import preview from "@construkt-kit/story-kit/preview";
import type { ReactElement } from "react";

import { Toaster, toaster } from ".";
import { Button } from "../Buttons";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story: () => ReactElement) => (
      <>
        <Toaster />
        <Story />
      </>
    ),
  ],
});

export const Default = meta.story({
  render: () => (
    <Wrap gap="2">
      <Button
        onClick={() =>
          toaster.create({
            title: "Info toast",
            description: "This is an info toast.",
            type: "info",
          })
        }
      >
        Info
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Success!",
            description: "Operation completed successfully.",
            type: "success",
          })
        }
      >
        Success
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Warning",
            description: "Please review your input.",
            type: "warning",
          })
        }
      >
        Warning
      </Button>
      <Button
        onClick={() =>
          toaster.create({
            title: "Error",
            description: "Something went wrong.",
            type: "error",
          })
        }
      >
        Error
      </Button>
    </Wrap>
  ),
});
