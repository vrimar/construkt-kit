import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fieldset } from ".";
import { Input } from "../Input";

const meta: Meta = {
  title: "Components/Fieldset",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Fieldset.Root>
      <Fieldset.Legend>Contact Information</Fieldset.Legend>
      <Fieldset.Content>
        <Fieldset.Control>
          <Input placeholder="Full name" />
        </Fieldset.Control>
        <Fieldset.HelperText>Enter your legal name.</Fieldset.HelperText>
      </Fieldset.Content>
    </Fieldset.Root>
  ),
};

export const WithError: Story = {
  render: () => (
    <Fieldset.Root invalid>
      <Fieldset.Legend>Email</Fieldset.Legend>
      <Fieldset.Content>
        <Fieldset.Control>
          <Input placeholder="Email" />
        </Fieldset.Control>
        <Fieldset.ErrorText>Email is required.</Fieldset.ErrorText>
      </Fieldset.Content>
    </Fieldset.Root>
  ),
};
