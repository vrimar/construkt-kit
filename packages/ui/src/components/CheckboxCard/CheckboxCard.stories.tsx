import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckboxCard } from ".";

const meta: Meta<typeof CheckboxCard> = {
  title: "Components/CheckboxCard",
  component: CheckboxCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CheckboxCard>;

export const Default: Story = {
  args: {
    label: "Option A",
    description: "This is a description for option A.",
  },
};

export const Checked: Story = {
  args: {
    label: "Selected Option",
    description: "This option is pre-selected.",
    defaultChecked: true,
  },
};

export const WithAddon: Story = {
  args: {
    label: "Premium Plan",
    description: "Includes all features.",
    addon: "Recommended",
  },
};

export const Group: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "12px", flexDirection: "column", maxWidth: 400 }}>
      <CheckboxCard
        label="Option 1"
        description="First option"
      />
      <CheckboxCard
        label="Option 2"
        description="Second option"
        defaultChecked
      />
      <CheckboxCard
        label="Option 3"
        description="Third option"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        maxWidth: 400,
        padding: "16px",
      }}
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <CheckboxCard
          key={size}
          label={`Option (${size})`}
          description="Description text for this option."
          size={size}
        />
      ))}
    </div>
  ),
};
