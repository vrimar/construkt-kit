import type { Meta, StoryObj } from "@storybook/react-vite";

import { Splitter } from ".";

const meta: Meta = {
  title: "Components/Splitter",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Splitter.Group
      height="200px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <Splitter.Panel
        defaultSize="50%"
        minSize="20%"
        p="4"
      >
        Left Panel
      </Splitter.Panel>
      <Splitter.Separator
        bg="border"
        cursor="col-resize"
        _hover={{ bg: "colorPalette.solid.bg" }}
      />
      <Splitter.Panel
        defaultSize="50%"
        minSize="20%"
        p="4"
      >
        Right Panel
      </Splitter.Panel>
    </Splitter.Group>
  ),
};

export const Vertical: Story = {
  render: () => (
    <Splitter.Group
      orientation="vertical"
      height="300px"
      border="1px solid"
      borderColor="border"
      borderRadius="md"
    >
      <Splitter.Panel
        defaultSize="50%"
        minSize="20%"
        p="4"
      >
        Top Panel
      </Splitter.Panel>
      <Splitter.Separator
        bg="border"
        cursor="row-resize"
        _hover={{ bg: "colorPalette.solid.bg" }}
      />
      <Splitter.Panel
        defaultSize="50%"
        minSize="20%"
        p="4"
      >
        Bottom Panel
      </Splitter.Panel>
    </Splitter.Group>
  ),
};

export const Gutter: Story = {
  render: () => (
    <Splitter.Group
      variant="gutter"
      height="240px"
      p="2.5"
      bg="bg.muted"
      borderRadius="md"
    >
      <Splitter.Panel
        defaultSize="30%"
        minSize="15%"
        p="4"
        bg="bg"
        borderRadius="md"
      >
        Pane — drag the gutter, double-click it to reset, or focus it and use the arrow keys
      </Splitter.Panel>
      <Splitter.Separator />
      <Splitter.Panel
        defaultSize="70%"
        minSize="30%"
        p="4"
        bg="bg"
        borderRadius="md"
      >
        Canvas
      </Splitter.Panel>
    </Splitter.Group>
  ),
};
