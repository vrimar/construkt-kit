import preview from "@construkt-kit/story-kit/preview";
import { fn } from "storybook/test";

import { FormFileUpload } from ".";
import { Field } from "../Form";
import { Box } from "../Layout";

const report = new File(["Region,Revenue\nEMEA,1204\n"], "q3-revenue-by-region.csv", {
  type: "text/csv",
  lastModified: 0,
});

const meta = preview.meta({
  title: "Components/FileUpload/FormFileUpload",
  component: FormFileUpload,
  tags: ["autodocs"],
  args: {
    onFileChange: fn(),
  },
  decorators: [
    (Story) => (
      <Box maxW="320px">
        <Field label="Report">
          <Story />
        </Field>
      </Box>
    ),
  ],
});

export const Default = meta.story();

export const WithFile = meta.story({
  render: (args) => (
    <FormFileUpload
      {...args}
      defaultAcceptedFiles={[report]}
    />
  ),
});

export const Disabled = meta.story({
  args: { disabled: true },
});
