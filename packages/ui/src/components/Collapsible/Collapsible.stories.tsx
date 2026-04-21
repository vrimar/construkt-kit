import type { Meta, StoryObj } from "@storybook/react-vite";

import { Collapsible } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta: Meta = {
  title: "Components/Collapsible",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="400px">
      <Collapsible.Root>
        <Collapsible.Trigger asChild>
          <Button variant="outline">Toggle content</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Box p="4">
            This content can be expanded and collapsed. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Box maxW="400px">
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger asChild>
          <Button variant="outline">Toggle</Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Box p="4">This section is open by default.</Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  ),
};
