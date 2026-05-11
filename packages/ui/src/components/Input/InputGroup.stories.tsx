import { input } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Download } from "lucide-react";

import { Input, InputGroup } from ".";
import { HStack, IconButton } from "..";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta<typeof InputGroup> = {
  title: "Components/Input/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const Default: Story = {
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

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={input.variantMap.size}
      renderPreview={(size) => (
        <HStack>
          <InputGroup
            size={size}
            startElement="$"
            endElement=".00"
          >
            <Input
              size={size}
              placeholder={`Amount (${size})`}
            />
          </InputGroup>
          <IconButton
            size={size}
            variant="outline"
          >
            <Download />
          </IconButton>
        </HStack>
      )}
    />
  ),
};
