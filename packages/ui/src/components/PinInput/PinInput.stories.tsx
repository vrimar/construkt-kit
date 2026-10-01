import type { Meta, StoryObj } from "@storybook/react-vite";

import { pinInput } from "#styled-system/recipes";

import { PinInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/PinInput",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
      <PinInput.Root>
        <PinInput.Label>OTP Code</PinInput.Label>
        <PinInput.Control>
          {[0, 1, 2, 3].map((id) => (
            <PinInput.Input
              key={id}
              index={id}
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
    </Box>
  ),
};

export const SixDigits: Story = {
  render: () => (
    <Box maxW="320px">
      <PinInput.Root>
        <PinInput.Label>Verification Code</PinInput.Label>
        <PinInput.Control>
          {[0, 1, 2, 3, 4, 5].map((id) => (
            <PinInput.Input
              key={id}
              index={id}
            />
          ))}
        </PinInput.Control>
        <PinInput.HiddenInput />
      </PinInput.Root>
    </Box>
  ),
};

export const Masked: Story = {
  render: () => {
    return (
      <Box maxW="320px">
        <PinInput.Root mask>
          <PinInput.Label>Secret PIN</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((id) => (
              <PinInput.Input
                key={id}
                index={id}
              />
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      </Box>
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={pinInput.variantMap.size}
      renderPreview={(size) => (
        <PinInput.Root size={size}>
          <PinInput.Label>Pin</PinInput.Label>
          <PinInput.Control>
            {[0, 1, 2, 3].map((id) => (
              <PinInput.Input
                key={id}
                index={id}
              />
            ))}
          </PinInput.Control>
          <PinInput.HiddenInput />
        </PinInput.Root>
      )}
    />
  ),
};
