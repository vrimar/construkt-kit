import { progress } from "@construkt-kit/styled-system/recipes";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Progress } from ".";
import { Table } from "../Table";
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
    <Table.Root maxWidth="420px">
      <Table.Head>
        <Table.Row>
          <Table.Header>Size</Table.Header>
          <Table.Header>Preview</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {progress.variantMap.size.map((size) => (
          <Table.Row key={size}>
            <Table.Cell>{size}</Table.Cell>
            <Table.Cell>
              <Progress.Root
                key={size}
                value={65}
                size={size}
              >
                <Progress.Label>Progress</Progress.Label>
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
};
