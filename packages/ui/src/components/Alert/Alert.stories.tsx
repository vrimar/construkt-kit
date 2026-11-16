import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { alert } from "#styled-system/recipes";

import { Alert } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Grid } from "../Layout";

const meta = preview.meta({
  title: "Components/Alert",
  component: Alert,
  tags: ["autodocs"],
  args: {
    title: "Alert title",
  },
});

export const Variants = meta.story({
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
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={alert.variantMap.size}
      label="Alert sizes"
      renderPreview={(size) => (
        <Alert
          size={size}
          status="info"
          title={`Alert ${size}`}
        >
          Size preview for the {size} alert variant.
        </Alert>
      )}
    />
  ),
});

export const WithDescription = meta.story({
  args: {
    status: "info",
    title: "New version available",
    children: "Refresh the page to get the latest updates.",
  },
});

export const Closable = meta.story({
  args: {
    status: "success",
    title: "Upload complete",
    onClose: fn(),
  },
});
