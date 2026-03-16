import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from ".";

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
    <div style={{ display: "flex", gap: "16px" }}>
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
    </div>
  ),
};
