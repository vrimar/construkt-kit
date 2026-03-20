import type { Meta, StoryObj } from "@storybook/react-vite";
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

export const Variants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "12px" }}>
      <Alert
        status="info"
        title="Informational message"
      />
      <Alert
        status="success"
        title="Changes saved successfully"
      />
      <Alert
        status="warning"
        title="This action cannot be undone"
      />
      <Alert
        status="error"
        title="Something went wrong"
      />
    </div>
  ),
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
