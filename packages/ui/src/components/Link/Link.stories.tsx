import type { Meta, StoryObj } from "@storybook/react-vite";

import { Link } from ".";
import { HStack } from "../Layout";

const meta: Meta<typeof Link> = {
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Click me",
    href: "#",
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <HStack gap="4">
      <Link
        href="#"
        variant="underline"
      >
        Underline
      </Link>
      <Link
        href="#"
        variant="plain"
      >
        Plain
      </Link>
    </HStack>
  ),
};
