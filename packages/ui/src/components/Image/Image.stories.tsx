import type { Meta, StoryObj } from "@storybook/react-vite";

import { Image } from ".";
import { Box } from "../Layout";

const meta: Meta<typeof Image> = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: "https://via.placeholder.com/300x200",
    alt: "Placeholder image",
    width: 300,
    height: 200,
  },
};

export const WithFit: Story = {
  render: () => (
    <Box
      w="200px"
      h="200px"
      borderWidth="1px"
      borderColor="border.default"
    >
      <Image
        src="https://via.placeholder.com/400x300"
        alt="Fitted image"
        objectFit="contain"
        width="100%"
        height="100%"
      />
    </Box>
  ),
};
