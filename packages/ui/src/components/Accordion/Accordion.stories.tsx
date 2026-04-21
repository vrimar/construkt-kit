import type { Meta, StoryObj } from "@storybook/react-vite";

import { Accordion } from ".";
import { Box, HStack } from "../Layout";

const meta: Meta = {
  title: "Components/Accordion",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="400px">
      <Accordion.Root
        defaultValue={["item-1"]}
        collapsible
      >
        {["Item 1", "Item 2", "Item 3"].map((item, i) => (
          <Accordion.Item
            key={i}
            value={`item-${i + 1}`}
          >
            <Accordion.ItemTrigger>
              {item}
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                Content for {item}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Box>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Box maxW="400px">
      <Accordion.Root
        defaultValue={["item-1", "item-2"]}
        multiple
      >
        {["First", "Second", "Third"].map((item, i) => (
          <Accordion.Item
            key={i}
            value={`item-${i + 1}`}
          >
            <Accordion.ItemTrigger>
              {item} section
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>
                This is the content for the {item.toLowerCase()} section.
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <HStack
      gap="6"
      p="4"
    >
      {(["sm", "md"] as const).map((size) => (
        <Accordion.Root
          key={size}
          defaultValue={["item-1"]}
          collapsible
          size={size}
          width="280px"
        >
          <Accordion.Item value="item-1">
            <Accordion.ItemTrigger>
              Item ({size})
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>Content for this accordion item.</Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
          <Accordion.Item value="item-2">
            <Accordion.ItemTrigger>
              Another item
              <Accordion.ItemIndicator />
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody>More content here.</Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      ))}
    </HStack>
  ),
};
