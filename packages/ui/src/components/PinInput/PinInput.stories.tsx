import type { Meta, StoryObj } from "@storybook/react-vite";
import { PinInput, type PinInputRootProps } from ".";

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
  render: () => {
    const maskedProps = { mask: true as never } as PinInputRootProps;

    return (
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
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px" }}>
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
    </div>
  ),
};
