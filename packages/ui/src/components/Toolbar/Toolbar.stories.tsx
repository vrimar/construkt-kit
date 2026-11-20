import preview from "@construkt-kit/story-kit/preview";
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  ArrowUpDownIcon,
  Columns3Icon,
  DownloadIcon,
  FilterIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import { Toolbar } from ".";
import { Button, IconButton } from "../Buttons";
import { Input } from "../Input";
import { Box, HStack } from "../Layout";
import { Menu } from "../Menu";
import { Popover } from "../Popover";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/Toolbar",
  tags: ["autodocs"],
});

const TableActions = ({ collapseBelow }: { collapseBelow?: number }) => (
  <Toolbar.Root
    aria-label="Table actions"
    collapseBelow={collapseBelow}
    flex="1"
    justifyContent="flex-end"
  >
    <Toolbar.Button
      variant="outline"
      size="sm"
      icon={<FilterIcon />}
      label="Filter"
    />
    <Toolbar.Button
      variant="outline"
      size="sm"
      icon={<ArrowUpDownIcon />}
      label="Sort"
    />
    <Toolbar.Button
      variant="outline"
      size="sm"
      icon={<Columns3Icon />}
      label="Columns"
    />
    <Toolbar.Separator />
    <Popover.Root>
      <Popover.Trigger
        tooltip="Notes"
        render={
          <IconButton
            variant="outline"
            size="sm"
            aria-label="Notes"
            icon={<MessageSquareIcon />}
          />
        }
      />
      <Popover.Content>
        <Popover.Body gap="3">
          No notes on this table yet.
          <Input
            size="sm"
            aria-label="Note"
            placeholder="Add a note"
          />
        </Popover.Body>
        <Popover.Footer>
          <Button size="sm">Save note</Button>
        </Popover.Footer>
      </Popover.Content>
    </Popover.Root>
    <Menu.Root>
      <Menu.Trigger
        render={
          <Toolbar.Button
            variant="solid"
            size="sm"
            icon={<DownloadIcon />}
            label="Export"
          />
        }
      />
      <Menu.Content>
        <Menu.Item value="xlsx">Excel workbook</Menu.Item>
        <Menu.Item value="csv">CSV</Menu.Item>
        <Menu.Item value="pptx">PowerPoint</Menu.Item>
      </Menu.Content>
    </Menu.Root>
  </Toolbar.Root>
);

export const Default = meta.story({
  render: () => (
    <HStack gap="4">
      <Text fontWeight="semibold">Open invoices by customer</Text>
      <TableActions collapseBelow={480} />
    </HStack>
  ),
});

export const CollapsingLabels = meta.story({
  render: () => (
    <Box
      resize="horizontal"
      overflow="auto"
      w="3xl"
      maxW="full"
      minW="xs"
      p="3"
      borderWidth="1px"
      borderColor="border"
      borderRadius="md"
    >
      <HStack gap="4">
        <Text
          fontWeight="semibold"
          truncate
        >
          Open invoices by customer
        </Text>
        <TableActions collapseBelow={480} />
      </HStack>
    </Box>
  ),
});

export const Vertical = meta.story({
  render: () => (
    <Toolbar.Root
      aria-label="Alignment"
      orientation="vertical"
      w="fit-content"
    >
      <IconButton
        variant="plain"
        aria-label="Align left"
        icon={<AlignLeftIcon />}
      />
      <IconButton
        variant="plain"
        aria-label="Align center"
        icon={<AlignCenterIcon />}
      />
      <IconButton
        variant="plain"
        aria-label="Align right"
        icon={<AlignRightIcon />}
      />
      <Toolbar.Separator />
      <IconButton
        variant="plain"
        aria-label="More"
        icon={<MoreHorizontalIcon />}
      />
    </Toolbar.Root>
  ),
});
