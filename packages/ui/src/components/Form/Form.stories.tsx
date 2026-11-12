import type { Meta, StoryObj } from "@storybook/react-vite";
import { RotateCcwIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { fn } from "storybook/test";

import { Field, SubmitForm } from ".";
import { IconButton } from "../Buttons";
import { Input } from "../Input";
import { Box, Stack } from "../Layout";

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

export const FieldHorizontalStory: Story = {
  name: "Field Horizontal",
  render: () => (
    <Stack
      gap="8"
      maxW="2xl"
    >
      <Stack gap="4">
        <Field
          label="Project name"
          orientation="horizontal"
          helperText="Shown to everyone on this project."
        >
          <Input defaultValue="Website redesign" />
        </Field>
        <Field
          label="Code"
          orientation="horizontal"
          invalid
          errorText="Code is already in use."
        >
          <Input defaultValue="WR-24" />
        </Field>
        <Field
          label="Session timeout"
          orientation="horizontal"
          labelAction={
            <IconButton
              aria-label="Reset session timeout"
              variant="plain"
              size="sm"
            >
              <RotateCcwIcon />
            </IconButton>
          }
        >
          <Input
            type="number"
            defaultValue={30}
          />
        </Field>
      </Stack>
      <Stack
        gap="4"
        style={{ "--field-label-width": "7rem" } as CSSProperties}
      >
        <Field
          label="Name"
          orientation="horizontal"
        >
          <Input defaultValue="Ada Lovelace" />
        </Field>
        <Field
          label="Email"
          orientation="horizontal"
        >
          <Input defaultValue="ada@example.com" />
        </Field>
      </Stack>
    </Stack>
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
        loading
      >
        <Field label="Name">
          <Input placeholder="Enter your name" />
        </Field>
      </SubmitForm>
    </Box>
  ),
};
