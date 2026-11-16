import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { SubmitDialog } from ".";
import { Button } from "../Buttons";
import { Field } from "../Form";
import { Input, Textarea } from "../Input";
import { Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/Dialog/SubmitDialog",
  component: SubmitDialog,
  tags: ["autodocs", "open-state"],
  args: {
    title: "Rename board",
    submitLabel: "Rename",
    onSubmit: fn(),
    onClose: fn(),
    children: (
      <Stack gap="4">
        <Field label="Name">
          <Input defaultValue="Q3 planning" />
        </Field>
        <Field label="Description">
          <Textarea defaultValue="Roadmap, hiring and budget for July to September." />
        </Field>
      </Stack>
    ),
  },
});

export const Default = meta.story();

export const Loading = meta.story({
  args: { loading: true },
});

export const CustomFooter = meta.story({
  args: {
    footer: ({ cancelButton, submitButton }) => (
      <>
        <Button
          variant="plain"
          me="auto"
        >
          Save as template
        </Button>
        {cancelButton}
        {submitButton}
      </>
    ),
  },
});
