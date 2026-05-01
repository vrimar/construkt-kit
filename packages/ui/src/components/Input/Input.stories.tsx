import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input, InputGroup, PasswordInput, SearchInput, Textarea } from ".";
import { Box, VStack } from "../Layout";

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
    <VStack
      gap="2"
      maxW="400px"
    >
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
    </VStack>
  ),
};

export const Variants: Story = {
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      <Input
        variant="outline"
        placeholder="Outline"
      />
      <Input
        variant="subtle"
        placeholder="Subtle"
      />
    </VStack>
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

export const InputGroupSizes: Story = {
  name: "InputGroup Sizes",
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <InputGroup
          key={size}
          size={size}
          startElement="$"
          endElement=".00"
        >
          <Input
            size={size}
            placeholder={`Amount (${size})`}
          />
        </InputGroup>
      ))}
    </VStack>
  ),
};

export const PasswordInputStory: Story = {
  name: "PasswordInput",
  render: () => (
    <Box maxW="400px">
      <PasswordInput placeholder="Enter password" />
    </Box>
  ),
};

export const PasswordInputSizes: Story = {
  name: "PasswordInput Sizes",
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <PasswordInput
          key={size}
          size={size}
          placeholder={`Password (${size})`}
        />
      ))}
    </VStack>
  ),
};

export const SearchInputStory: Story = {
  name: "SearchInput",
  render: () => (
    <Box maxW="400px">
      <SearchInput placeholder="Search..." />
    </Box>
  ),
};

export const SearchInputSizes: Story = {
  name: "SearchInput Sizes",
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <SearchInput
          key={size}
          size={size}
          value={`Query ${size}`}
          onChange={() => {}}
          onClear={() => {}}
          placeholder={`Search (${size})`}
        />
      ))}
    </VStack>
  ),
};

export const TextareaStory: Story = {
  name: "Textarea",
  render: () => (
    <Box maxW="400px">
      <Textarea placeholder="Enter long text..." />
    </Box>
  ),
};

export const TextareaSizes: Story = {
  name: "Textarea Sizes",
  render: () => (
    <VStack
      gap="2"
      maxW="400px"
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Textarea
          key={size}
          size={size}
          placeholder={`Long-form text (${size})`}
        />
      ))}
    </VStack>
  ),
};
