import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from ".";

const meta: Meta = {
  title: "Components/Progress",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Linear: Story = {
  render: () => (
    <Progress.Root
      value={65}
      maxW="400px"
    >
      <Progress.Label>Upload progress</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
      <Progress.ValueText />
    </Progress.Root>
  ),
};

export const Circular: Story = {
  render: () => (
    <Progress.Root
      value={75}
      maxW="200px"
    >
      <Progress.Circle>
        <Progress.CircleTrack />
        <Progress.CircleRange />
      </Progress.Circle>
      <Progress.ValueText />
    </Progress.Root>
  ),
};

export const Indeterminate: Story = {
  render: () => (
    <Progress.Root
      value={null}
      maxW="400px"
    >
      <Progress.Label>Loading...</Progress.Label>
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        maxWidth: "400px",
      }}
    >
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Progress.Root
          key={size}
          value={65}
          size={size}
        >
          <Progress.Label>{size}</Progress.Label>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      ))}
    </div>
  ),
};
