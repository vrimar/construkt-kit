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
        defaultSize={50}
        minSize={20}
        p="4"
      >
        Left Panel
      </Splitter.Panel>
      <Splitter.Separator
        width="4px"
        bg="border"
        cursor="col-resize"
        _hover={{ bg: "colorPalette.default" }}
      />
      <Splitter.Panel
        defaultSize={50}
        minSize={20}
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
        defaultSize={50}
        minSize={20}
        p="4"
      >
        Top Panel
      </Splitter.Panel>
      <Splitter.Separator
        height="4px"
        bg="border"
        cursor="row-resize"
        _hover={{ bg: "colorPalette.default" }}
      />
      <Splitter.Panel
        defaultSize={50}
        minSize={20}
        p="4"
      >
        Bottom Panel
      </Splitter.Panel>
    </Splitter.Group>
  ),
};
