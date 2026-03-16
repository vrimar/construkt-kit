import type { Meta, StoryObj } from "@storybook/react-vite";
import { PinInput } from ".";

const meta: Meta = {
  title: "Components/PinInput",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
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
  ),
};

export const SixDigits: Story = {
  render: () => (
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
  ),
};

export const Masked: Story = {
  render: () => (
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
  ),
};
