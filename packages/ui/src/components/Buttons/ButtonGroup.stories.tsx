import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button, ButtonGroup } from ".";
import { VStack } from "../Layout";

const meta: Meta<typeof ButtonGroup> = {
  title: "Components/Buttons/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">Left</Button>
      <Button variant="outline">Center</Button>
      <Button variant="outline">Right</Button>
    </ButtonGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="3">
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ButtonGroup
          key={size}
          size={size}
        >
          <Button variant="outline">Left</Button>
          <Button variant="outline">Center</Button>
          <Button variant="outline">Right</Button>
        </ButtonGroup>
      ))}
    </VStack>
  ),
};
