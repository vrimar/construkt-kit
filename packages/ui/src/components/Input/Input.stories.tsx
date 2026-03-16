import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./Input";
import { InputGroup } from "./InputGroup";
import { MultiLineInput } from "./MultiLineInput";
import { PasswordInput } from "./PasswordInput";
import { SearchInput } from "./SearchInput";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    placeholder: "Enter text...",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 400 }}>
      <Input
        size="xs"
        placeholder="Extra small"
      />
      <Input
        size="sm"
        placeholder="Small"
      />
      <Input
        size="md"
        placeholder="Medium"
      />
      <Input
        size="lg"
        placeholder="Large"
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 400 }}>
      <Input
        variant="outline"
        placeholder="Outline"
      />
      <Input
        variant="subtle"
        placeholder="Subtle"
      />
    </div>
  ),
};

export const InputGroupStory: Story = {
  name: "InputGroup",
  render: () => (
    <InputGroup
      startElement="$"
      endElement=".00"
      maxW="300px"
    >
      <Input placeholder="Amount" />
    </InputGroup>
  ),
};

export const PasswordInputStory: Story = {
  name: "PasswordInput",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <PasswordInput placeholder="Enter password" />
    </div>
  ),
};

export const SearchInputStory: Story = {
  name: "SearchInput",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <SearchInput placeholder="Search..." />
    </div>
  ),
};

export const TextareaStory: Story = {
  name: "Textarea",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <Textarea placeholder="Enter long text..." />
    </div>
  ),
};

export const MultiLineInputStory: Story = {
  name: "MultiLineInput",
  render: () => (
    <div style={{ maxWidth: 400 }}>
      <MultiLineInput placeholder="Enter text (Enter is prevented)..." />
    </div>
  ),
};
