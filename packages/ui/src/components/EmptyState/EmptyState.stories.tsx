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

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "32px", padding: "16px", flexWrap: "wrap" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <EmptyState.Root
          key={size}
          size={size}
        >
          <EmptyState.Content>
            <EmptyState.Indicator>📭</EmptyState.Indicator>
            <EmptyState.Title>No results ({size})</EmptyState.Title>
            <EmptyState.Description>Try adjusting your filters.</EmptyState.Description>
          </EmptyState.Content>
        </EmptyState.Root>
      ))}
    </div>
  ),
};
