import preview from "@construkt-kit/story-kit/preview";

import { Splitter } from ".";

const meta = preview.meta({
  title: "Components/Splitter",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const Vertical = meta.story({
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
});

export const Gutter = meta.story({
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
        Pane
      </Splitter.Panel>
      <Splitter.Separator />
      <Splitter.Panel
        defaultSize="70%"
        minSize="30%"
        p="4"
        bg="bg"
        borderRadius="md"
      >
        Canvas — drag the gutter, double-click it to reset, or focus it and use the arrow keys
      </Splitter.Panel>
    </Splitter.Group>
  ),
});
