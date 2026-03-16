import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from ".";

const meta: Meta<typeof Heading> = {
  title: "Components/Heading",
  component: Heading,
  tags: ["autodocs"],
  args: {
    children: "Heading Text",
  },
};

export default meta;
type Story = StoryObj<typeof Heading>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Heading size="xs">Heading xs</Heading>
      <Heading size="sm">Heading sm</Heading>
      <Heading size="md">Heading md</Heading>
      <Heading size="lg">Heading lg</Heading>
      <Heading size="xl">Heading xl</Heading>
      <Heading size="2xl">Heading 2xl</Heading>
      <Heading size="3xl">Heading 3xl</Heading>
    </div>
  ),
};

export const AsH1: Story = {
  args: {
    as: "h1",
    size: "3xl",
    children: "H1 Heading",
  },
};
