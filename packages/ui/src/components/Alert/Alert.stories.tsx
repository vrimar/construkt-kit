import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from ".";
import { Grid } from "../Layout";

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
    <Grid gap="3">
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
    </Grid>
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
