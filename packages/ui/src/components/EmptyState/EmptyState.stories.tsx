import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from ".";

const meta: Meta = {
  title: "Components/EmptyState",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Title>No results found</EmptyState.Title>
        <EmptyState.Description>
          Try adjusting your search criteria or creating a new item.
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  ),
};

export const WithIndicator: Story = {
  render: () => (
    <EmptyState.Root>
      <EmptyState.Content>
        <EmptyState.Indicator>📭</EmptyState.Indicator>
        <EmptyState.Title>Your inbox is empty</EmptyState.Title>
        <EmptyState.Description>
          New messages will appear here when you receive them.
        </EmptyState.Description>
      </EmptyState.Content>
    </EmptyState.Root>
  ),
};
