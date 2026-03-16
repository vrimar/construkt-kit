import type { Meta, StoryObj } from "@storybook/react-vite";
import { Clipboard } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Clipboard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Clipboard.Root value="https://example.com">
      <Clipboard.Label>Share URL</Clipboard.Label>
      <Clipboard.Control>
        <Clipboard.Input />
        <Clipboard.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            <Clipboard.Indicator />
          </Button>
        </Clipboard.Trigger>
      </Clipboard.Control>
    </Clipboard.Root>
  ),
};

export const CopyText: Story = {
  render: () => (
    <Clipboard.Root value="Copy me!">
      <Clipboard.Control>
        <Clipboard.Input />
        <Clipboard.Trigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            <Clipboard.CopyText />
          </Button>
        </Clipboard.Trigger>
      </Clipboard.Control>
    </Clipboard.Root>
  ),
};
