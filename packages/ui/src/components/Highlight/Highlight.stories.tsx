import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchHighlight } from ".";

const meta: Meta<typeof SearchHighlight> = {
  title: "Components/Highlight",
  component: SearchHighlight,
  tags: ["autodocs"],
  args: {
    text: "The quick brown fox jumps over the lazy dog",
    query: "quick fox",
  },
};

export default meta;
type Story = StoryObj<typeof SearchHighlight>;

export const Default: Story = {};

export const NoMatch: Story = {
  args: {
    text: "Hello world",
    query: "xyz",
  },
};

export const MultipleMatches: Story = {
  args: {
    text: "React is a JavaScript library for building user interfaces. React makes it easy.",
    query: "React",
  },
};
