import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { Toaster, toaster } from ".";
import { Button } from "../Buttons";
import { Wrap } from "../Layout";

const meta: Meta = {
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
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
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
};
