import type { Meta, StoryObj } from "@storybook/react-vite";

import { PinInput, type PinInputRootProps } from ".";
import { Box, VStack } from "../Layout";

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
    const maskedProps = { mask: true as never } as PinInputRootProps;

    return (
      <Box maxW="320px">
        <PinInput.Root {...maskedProps}>
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
    <VStack
      gap="4"
      p="4"
    >
      {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((size) => (
        <PinInput.Root
          key={size}
          size={size}
        >
          <PinInput.Label>{size}</PinInput.Label>
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
      ))}
    </VStack>
  ),
};
