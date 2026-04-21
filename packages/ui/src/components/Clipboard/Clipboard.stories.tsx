import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clipboard } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/Clipboard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
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
    </Box>
  ),
};

export const CopyText: Story = {
  render: () => (
    <Box maxW="320px">
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
    </Box>
  ),
};
