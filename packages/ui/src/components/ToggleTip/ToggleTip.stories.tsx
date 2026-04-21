import type { Meta, StoryObj } from "@storybook/react-vite";

import { InfoTip, ToggleTip } from ".";
import { Button } from "../Buttons";
import { HStack } from "../Layout";

const meta: Meta = {
  title: "Components/ToggleTip",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <ToggleTip content="This is a toggle tip with helpful information.">
      <Button variant="outline">Click for info</Button>
    </ToggleTip>
  ),
};

export const InfoTipStory: Story = {
  name: "InfoTip",
  render: () => (
    <HStack gap="2">
      <span>Some label</span>
      <InfoTip>This provides additional context about the label.</InfoTip>
    </HStack>
  ),
};

export const WithArrow: Story = {
  render: () => (
    <ToggleTip
      content="Arrow tip"
      showArrow
    >
      <Button variant="outline">With Arrow</Button>
    </ToggleTip>
  ),
};
