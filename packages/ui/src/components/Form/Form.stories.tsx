import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Field, SubmitForm } from ".";
import { Input } from "../Input";

const meta: Meta = {
  title: "Components/Form",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const FieldStory: Story = {
  name: "Field",
  render: () => (
    <Field
      label="Email"
      helperText="We'll never share your email."
    >
      <Input placeholder="Enter your email" />
    </Field>
  ),
};

export const FieldWithErrorStory: Story = {
  name: "Field with Error",
  render: () => (
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
  ),
};

export const FieldOptionalStory: Story = {
  name: "Field Optional",
  render: () => (
    <Field
      label="Nickname"
      optionalText="(optional)"
    >
      <Input placeholder="Enter nickname" />
    </Field>
  ),
};

export const SubmitFormStory: Story = {
  name: "SubmitForm",
  render: () => (
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
  ),
};

export const SubmitFormLoadingStory: Story = {
  name: "SubmitForm Loading",
  render: () => (
    <SubmitForm
      onSubmit={fn()}
      onCancel={fn()}
      isSubmitLoading
    >
      <Field label="Name">
        <Input placeholder="Enter your name" />
      </Field>
    </SubmitForm>
  ),
};
