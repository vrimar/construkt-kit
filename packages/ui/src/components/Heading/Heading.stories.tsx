import type { Meta, StoryObj } from "@storybook/react-vite";

import { Heading } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const headingLevels = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingLevel = (typeof headingLevels)[number];

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
    <SizePreviewTable<HeadingLevel>
      sizes={[...headingLevels]}
      renderPreview={(level) => <Heading as={level}>{level.toUpperCase()}</Heading>}
    />
  ),
};

export const AsH1: Story = {
  args: {
    as: "h1",
    children: "H1 Heading",
  },
};
