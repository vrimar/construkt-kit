import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from ".";
import { VStack } from "../Layout";

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
    <VStack gap="2">
      <Heading as="h6">Heading h6</Heading>
      <Heading as="h5">Heading h5</Heading>
      <Heading as="h4">Heading h4</Heading>
      <Heading as="h3">Heading h3</Heading>
      <Heading as="h2">Heading h2</Heading>
      <Heading as="h1">Heading h1</Heading>
    </VStack>
  ),
};

export const AsH1: Story = {
  args: {
    as: "h1",
    children: "H1 Heading",
  },
};
