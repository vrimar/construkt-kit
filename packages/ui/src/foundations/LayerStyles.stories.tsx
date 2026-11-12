import type { Meta, StoryObj } from "@storybook/react-vite";

import { Box, HStack, Stack } from "../components/Layout";
import { Table } from "../components/Table";

const meta: Meta = {
  title: "Foundations/Layer styles",
  parameters: {
    docs: {
      description: {
        component:
          '`layerStyle="hatched"` draws neutral diagonal stripes for values that can\'t be counted ' +
          "and for the hidden remainder of a stacked bar.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Hatched: Story = {
  render: () => (
    <Stack
      gap="8"
      maxW="md"
    >
      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header>Channel</Table.Header>
            <Table.Header textAlign="end">Q1</Table.Header>
            <Table.Header textAlign="end">Q2</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>In store</Table.Cell>
            <Table.Cell textAlign="end">412</Table.Cell>
            <Table.Cell textAlign="end">398</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>Online</Table.Cell>
            <Table.Cell
              textAlign="end"
              layerStyle="hatched"
            >
              n/a
            </Table.Cell>
            <Table.Cell textAlign="end">57</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <HStack
        gap="0"
        h="6"
        borderRadius="md"
        overflow="hidden"
        textStyle="xs"
        fontWeight="semibold"
      >
        <Box
          w="45%"
          h="full"
          ps="1.5"
          display="flex"
          alignItems="center"
          bg="colorPalette.solid.bg"
          color="colorPalette.solid.fg"
        >
          45%
        </Box>
        <Box
          w="30%"
          h="full"
          ps="1.5"
          display="flex"
          alignItems="center"
          bg="colorPalette.subtle.bg"
          color="colorPalette.subtle.fg"
        >
          30%
        </Box>
        <Box
          flex="1"
          h="full"
          ps="1.5"
          display="flex"
          alignItems="center"
          fontWeight="medium"
          layerStyle="hatched"
        >
          8 more
        </Box>
      </HStack>
    </Stack>
  ),
};
