import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toaster, toaster } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Toast",
  tags: ["autodocs"],
  decorators: [
    (Story) => (
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
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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
    </div>
  ),
};
