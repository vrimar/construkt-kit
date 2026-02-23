import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    title: "Alert title",
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = {
  args: { status: "info", title: "Informational message" },
};

export const Success: Story = {
  args: { status: "success", title: "Changes saved successfully" },
};

export const Warning: Story = {
  args: { status: "warning", title: "This action cannot be undone" },
};

export const Error: Story = {
  args: { status: "error", title: "Something went wrong" },
};

export const WithDescription: Story = {
  args: {
    status: "info",
    title: "New version available",
    children: "Refresh the page to get the latest updates.",
  },
};

export const Closable: Story = {
  args: {
    status: "success",
    title: "Upload complete",
    closable: true,
  },
};
