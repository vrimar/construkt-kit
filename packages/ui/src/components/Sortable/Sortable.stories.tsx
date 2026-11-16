import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { Sortable, type SortableDropOntoDetails, applySortableReorder } from ".";
import { Box, Flex } from "../Layout";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/Sortable",
  tags: ["autodocs"],
});

interface Row {
  id: string;
  label: string;
}

const initialRows: Row[] = [
  "Rent",
  "Utilities",
  "Groceries",
  "Dining out",
  "Transport",
  "Fuel",
  "Insurance",
  "Subscriptions",
  "Gym membership",
  "Travel",
  "Gifts",
  "Savings",
].map((label, index) => ({ id: `row-${index}`, label }));

function VerticalDemo() {
  const [rows, setRows] = useState(initialRows);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

  const mergeRows = ({ sourceValue, targetValue }: SortableDropOntoDetails) => {
    const source = rows.find((row) => row.id === sourceValue);
    if (!source) return;
    setRows(
      rows
        .filter((row) => row.id !== sourceValue)
        .map((row) =>
          row.id === targetValue ? { ...row, label: `${row.label} + ${source.label}` } : row,
        ),
    );
  };

  return (
    <Box
      ref={setScrollElement}
      maxW="360px"
      h="320px"
      overflowY="auto"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      p="2"
    >
      <Sortable.Root
        values={rows.map((row) => row.id)}
        onReorder={(details) => setRows(applySortableReorder(rows, details, (row) => row.id))}
        onDropOnto={mergeRows}
        scrollElement={scrollElement}
        gap="1"
      >
        {rows.map((row) => (
          <Sortable.Item
            key={row.id}
            value={row.id}
            label={row.label}
            display="flex"
            alignItems="center"
            gap="2"
            px="2"
            py="1.5"
            rounded="sm"
            bg="bg.subtle"
          >
            <Sortable.Handle />
            <Text
              textStyle="sm"
              truncate
            >
              {row.label}
            </Text>
          </Sortable.Item>
        ))}
      </Sortable.Root>
    </Box>
  );
}

/** Drag a row by its handle; drop on a row's middle third to merge the two. */
export const VerticalWithDropOnto = meta.story({
  render: () => <VerticalDemo />,
});

const initialColumns = ["Q1", "Q2", "Q3", "Q4", "Full year", "Last year", "Change"];

function HorizontalDemo() {
  const [columns, setColumns] = useState(initialColumns);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);

  return (
    <Box
      ref={setScrollElement}
      maxW="480px"
      overflowX="auto"
      borderWidth="1px"
      borderColor="border"
      rounded="md"
      p="3"
    >
      <Sortable.Root
        values={columns}
        axis="horizontal"
        handleVisibility="always"
        onReorder={(details) => setColumns(applySortableReorder(columns, details))}
        scrollElement={scrollElement}
        gap="3"
        w="max-content"
      >
        {columns.map((column) => (
          <Sortable.Item
            key={column}
            value={column}
            label={column}
            w="24"
            borderWidth="1px"
            borderColor="border"
            rounded="md"
            bg="bg"
          >
            <Flex
              justify="center"
              borderBottomWidth="1px"
              borderColor="border"
              py="0.5"
            >
              <Sortable.Handle />
            </Flex>
            <Text
              textStyle="sm"
              fontWeight="medium"
              textAlign="center"
              py="6"
            >
              {column}
            </Text>
          </Sortable.Item>
        ))}
      </Sortable.Root>
    </Box>
  );
}

/** Columns reorder along the horizontal axis; handles stay visible. */
export const Horizontal = meta.story({
  render: () => <HorizontalDemo />,
});
