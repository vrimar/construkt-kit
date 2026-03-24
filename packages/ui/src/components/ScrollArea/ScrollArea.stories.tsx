import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from ".";

const meta: Meta<typeof ScrollArea> = {
  title: "Components/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <ScrollArea
      height="200px"
      width="300px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <div style={{ padding: "16px" }}>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Scrollable content line {i + 1}</p>
        ))}
      </div>
    </ScrollArea>
  ),
};

export const HorizontalScroll: Story = {
  render: () => (
    <ScrollArea
      height="100px"
      width="300px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <div style={{ padding: "16px", whiteSpace: "nowrap", width: "800px" }}>
        This is a very long line of text that will cause horizontal scrolling to demonstrate the
        horizontal scroll area functionality.
      </div>
    </ScrollArea>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "24px", padding: "16px", alignItems: "flex-start" }}>
      {(["xs", "sm", "md", "lg"] as const).map((size) => (
        <ScrollArea
          key={size}
          height="150px"
          width="200px"
          border="1px solid"
          borderColor="border"
          borderRadius="md"
          size={size}
        >
          <div style={{ padding: "8px" }}>
            <p style={{ marginBottom: "4px", fontWeight: "bold" }}>{size}</p>
            {Array.from({ length: 10 }, (_, i) => (
              <p key={i}>Line {i + 1}</p>
            ))}
          </div>
        </ScrollArea>
      ))}
    </div>
  ),
};
