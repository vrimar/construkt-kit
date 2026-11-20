import preview from "@construkt-kit/story-kit/preview";
import { ColumnsIcon, SlidersHorizontalIcon, SparklesIcon, TableIcon } from "lucide-react";

import { List } from ".";
import { Badge } from "../Badge";
import { Box, Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/List",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="320px">
      <List.Root>
        <List.Item>First item</List.Item>
        <List.Item>Second item</List.Item>
        <List.Item>Third item</List.Item>
      </List.Root>
    </Box>
  ),
});

export const Actions = meta.story({
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
});

export const WithDescription = meta.story({
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
});

export const AsLink = meta.story({
  render: () => (
    <Box maxW="320px">
      <List.Action
        render={<a href="#tables" />}
        icon={<TableIcon />}
        value="3"
      >
        Open tables
      </List.Action>
    </Box>
  ),
});

export const DisabledAndBadges = meta.story({
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
});
