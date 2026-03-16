import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from ".";

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
    <div style={{ width: 200, height: 200, border: "1px solid #ccc" }}>
      <Image
        src="https://via.placeholder.com/400x300"
        alt="Fitted image"
        fit="contain"
        width="100%"
        height="100%"
      />
    </div>
  ),
};
