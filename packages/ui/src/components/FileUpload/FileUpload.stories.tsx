import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUpload } from ".";
import { Button } from "../Buttons";
import { Box, Center, VStack } from "../Layout";

const meta: Meta = {
  title: "Components/FileUpload",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="400px">
      <FileUpload.Root maxFiles={5}>
        <FileUpload.HiddenInput />
        <FileUpload.Trigger asChild>
          <Button variant="outline">Choose File</Button>
        </FileUpload.Trigger>
        <FileUpload.ItemGroup>
          <FileUpload.Items />
        </FileUpload.ItemGroup>
      </FileUpload.Root>
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="4"
      maxW="400px"
    >
      {(["md"] as const).map((size) => (
        <FileUpload.Root
          key={size}
          maxFiles={3}
          size={size}
        >
          <FileUpload.HiddenInput />
          <FileUpload.Dropzone>
            <Center p="10">Drop files here ({size})</Center>
          </FileUpload.Dropzone>
          <FileUpload.ItemGroup>
            <FileUpload.Items />
          </FileUpload.ItemGroup>
        </FileUpload.Root>
      ))}
    </VStack>
  ),
};

export const Dropzone: Story = {
  render: () => (
    <Box maxW="400px">
      <FileUpload.Root maxFiles={3}>
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone>
          <Center p="10">Drag and drop files here, or click to select</Center>
        </FileUpload.Dropzone>
        <FileUpload.ItemGroup>
          <FileUpload.Items />
        </FileUpload.ItemGroup>
      </FileUpload.Root>
    </Box>
  ),
};
