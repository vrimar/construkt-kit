import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColumnsIcon, SlidersHorizontalIcon, SparklesIcon, TableIcon } from "lucide-react";

import { List } from ".";
import { Badge } from "../Badge";
import { Box, Stack } from "../Layout";

const meta: Meta = {
  title: "Components/List",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Box maxW="320px">
      <List.Root>
        <List.Item>First item</List.Item>
        <List.Item>Second item</List.Item>
        <List.Item>Third item</List.Item>
      </List.Root>
    </Box>
  ),
};

export const Actions: Story = {
  render: () => (
    <Box maxW="420px">
      <List.Root>
        <List.Item>
          <List.Action
            icon={<TableIcon />}
            value="12 of 40"
          >
            Tables
          </List.Action>
        </List.Item>
        <List.Item>
          <List.Action
            icon={<ColumnsIcon />}
            value="All"
          >
            Columns
          </List.Action>
        </List.Item>
        <List.Item>
          <List.Action
            icon={<SlidersHorizontalIcon />}
            value="1 decimal, %"
          >
            Format
          </List.Action>
        </List.Item>
      </List.Root>
    </Box>
  ),
};

export const WithDescription: Story = {
  render: () => (
    <Box maxW="480px">
      <List.Root>
        {[
          {
            title: "Revenue by sales channel",
            line: "Online 64% vs In store 41% · Q3",
            gap: "+23 pts",
          },
          { title: "Repeat orders by plan", line: "Pro 52% vs Free 37% · Oct", gap: "+15 pts" },
        ].map((row) => (
          <List.Item
            key={row.title}
            borderBottomWidth="1px"
            borderColor="border.muted"
          >
            <List.Action
              icon={<SparklesIcon />}
              description={row.line}
              value={row.gap}
              borderRadius="0"
            >
              {row.title}
            </List.Action>
          </List.Item>
        ))}
      </List.Root>
    </Box>
  ),
};

export const AsLink: Story = {
  render: () => (
    <Box maxW="320px">
      <List.Action
        asChild
        icon={<TableIcon />}
        value="3"
      >
        <a href="#tables">Open tables</a>
      </List.Action>
    </Box>
  ),
};

export const DisabledAndBadges: Story = {
  render: () => (
    <Stack
      gap="0.5"
      maxW="420px"
    >
      <List.Action
        icon={<Badge colorPalette="green">New</Badge>}
        value="#12"
        chevron={false}
      >
        Order confirmation email
      </List.Action>
      <List.Action
        icon={<Badge colorPalette="red">Dropped</Badge>}
        value="#7"
        chevron={false}
        disabled
      >
        Legacy invoice export
      </List.Action>
    </Stack>
  ),
};
