import type { Meta, StoryObj } from "@storybook/react-vite";
import { Carousel } from ".";

const meta: Meta = {
  title: "Components/Carousel",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Carousel.Root>
      <Carousel.Control>
        <Carousel.PrevTrigger>◀</Carousel.PrevTrigger>
        <Carousel.NextTrigger>▶</Carousel.NextTrigger>
      </Carousel.Control>
      <Carousel.ItemGroup>
        {[1, 2, 3, 4, 5].map((i) => (
          <Carousel.Item
            key={i}
            index={i - 1}
          >
            <div
              style={{
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                borderRadius: 8,
                fontSize: 24,
                fontWeight: "bold",
              }}
            >
              Slide {i}
            </div>
          </Carousel.Item>
        ))}
      </Carousel.ItemGroup>
      <Carousel.IndicatorGroup />
    </Carousel.Root>
  ),
};
