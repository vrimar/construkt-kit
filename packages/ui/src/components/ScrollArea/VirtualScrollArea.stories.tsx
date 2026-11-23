import preview from "@construkt-kit/story-kit/preview";

import { VirtualScrollArea, type VirtualScrollAreaProps } from ".";
import { Box } from "../Layout";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/VirtualScrollArea",
  component: VirtualScrollArea,
  tags: ["autodocs"],
});

const ITEMS = Array.from({ length: 1000 }, (_, i) => `Item ${i + 1}`);

const Frame = <T,>(props: VirtualScrollAreaProps<T>) => (
  <VirtualScrollArea
    height="320px"
    width="320px"
    border="1px solid"
    borderColor="border"
    borderRadius="md"
    {...props}
  />
);

const renderItem = (item: string) => (
  <Box
    px="3"
    height="40px"
    display="flex"
    alignItems="center"
    borderBottom="1px solid"
    borderColor="border"
  >
    <Text>{item}</Text>
  </Box>
);

export const Default = meta.story({
  render: () => (
    <Frame
      items={ITEMS}
      itemHeight={40}
    >
      {renderItem}
    </Frame>
  ),
});

export const WithHeader = meta.story({
  render: () => (
    <Frame
      items={ITEMS}
      itemHeight={40}
      header={
        <Box
          px="3"
          py="2"
          bg="bg.subtle"
          borderBottom="1px solid"
          borderColor="border"
          position="sticky"
          top="0"
          zIndex="1"
        >
          <Text fontWeight="semibold">1 000 items</Text>
        </Box>
      }
    >
      {renderItem}
    </Frame>
  ),
});

const VARIABLE_ITEMS = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  label: `Item ${i + 1}`,
  description: i % 3 === 0 ? "This item has extra detail text that makes it taller." : undefined,
}));

export const VariableHeight = meta.story({
  render: () => (
    <Frame
      items={VARIABLE_ITEMS}
      itemHeight={(index) => (index % 3 === 0 ? 64 : 40)}
      measure
      fadeEdges
    >
      {(item) => (
        <Box
          px="3"
          py="2"
          borderBottom="1px solid"
          borderColor="border"
          display="flex"
          flexDirection="column"
          gap="1"
        >
          <Text fontWeight="medium">{item.label}</Text>
          {item.description && (
            <Text
              fontSize="sm"
              color="fg.muted"
            >
              {item.description}
            </Text>
          )}
        </Box>
      )}
    </Frame>
  ),
});
