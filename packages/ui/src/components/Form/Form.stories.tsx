import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Field, SubmitForm } from ".";
import { Input } from "../Input";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/Form",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const FieldStory: Story = {
  name: "Field",
  render: () => (
    <Box maxW="400px">
      <Field
        label="Email"
        helperText="We'll never share your email."
      >
        <Input placeholder="Enter your email" />
      </Field>
    </Box>
  ),
};

export const FieldWithErrorStory: Story = {
  name: "Field with Error",
  render: () => (
    <Box maxW="400px">
      <Field
        label="Password"
        invalid
        errorText="Password is required."
      >
        <Input
          type="password"
          placeholder="Enter password"
        />
      </Field>
    </Box>
  ),
};

export const FieldOptionalStory: Story = {
  name: "Field Optional",
  render: () => (
    <Box maxW="400px">
      <Field
        label="Nickname"
        optionalText="(optional)"
      >
        <Input placeholder="Enter nickname" />
      </Field>
    </Box>
  ),
};

export const SubmitFormStory: Story = {
  name: "SubmitForm",
  render: () => (
    <Box maxW="400px">
      <SubmitForm
        onSubmit={fn()}
        onCancel={fn()}
      >
        <Field label="Name">
          <Input placeholder="Enter your name" />
        </Field>
        <Field label="Email">
          <Input placeholder="Enter your email" />
        </Field>
      </SubmitForm>
    </Box>
  ),
};

export const SubmitFormLoadingStory: Story = {
  name: "SubmitForm Loading",
  render: () => (
    <Box maxW="400px">
      <SubmitForm
        onSubmit={fn()}
        onCancel={fn()}
        isSubmitLoading
      >
        <Field label="Name">
          <Input placeholder="Enter your name" />
        </Field>
      </SubmitForm>
    </Box>
  ),
};
