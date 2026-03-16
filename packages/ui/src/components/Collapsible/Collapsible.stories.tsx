import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible } from ".";
import { Button } from "../Buttons";

const meta: Meta = {
  title: "Components/Collapsible",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Collapsible.Root>
      <Collapsible.Trigger asChild>
        <Button variant="outline">Toggle content</Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div style={{ padding: "16px" }}>
          This content can be expanded and collapsed. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit.
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  ),
};

export const DefaultOpen: Story = {
  render: () => (
    <Collapsible.Root defaultOpen>
      <Collapsible.Trigger asChild>
        <Button variant="outline">Toggle</Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div style={{ padding: "16px" }}>This section is open by default.</div>
      </Collapsible.Content>
    </Collapsible.Root>
  ),
};
