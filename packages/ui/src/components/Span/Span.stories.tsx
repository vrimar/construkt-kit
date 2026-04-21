import type { Meta, StoryObj } from "@storybook/react-vite";

import { Span } from ".";

const meta: Meta<typeof Span> = {
  title: "Components/Span",
  component: Span,
  tags: ["autodocs"],
  args: {
    children: "Inline text",
  },
};

export default meta;
type Story = StoryObj<typeof Span>;

export const Default: Story = {};

export const Styled: Story = {
  render: () => (
    <p>
      This is a paragraph with a{" "}
      <Span
        color="brand.fg"
        fontWeight="bold"
      >
        highlighted span
      </Span>{" "}
      inside.
    </p>
  ),
};
