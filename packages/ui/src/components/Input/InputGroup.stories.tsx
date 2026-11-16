import preview from "@construkt-kit/story-kit/preview";
import { Download } from "lucide-react";

import { input } from "#styled-system/recipes";

import { Input, InputGroup } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { IconButton } from "../Buttons";
import { HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Input/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <InputGroup
      startElement="$"
      endElement=".00"
      maxW="300px"
    >
      <Input placeholder="Amount" />
    </InputGroup>
  ),
});

export const Sizes = meta.story({
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
            aria-label={`Download (${size})`}
          >
            <Download />
          </IconButton>
        </HStack>
      )}
    />
  ),
});
