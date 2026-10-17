import type { Meta, StoryObj } from "@storybook/react-vite";
import { EllipsisIcon, PencilIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { fn } from "storybook/test";

import { createDataTableColumnHelper, DataTable, type DataTableProps } from ".";
import { IconButton } from "../Buttons";
import { Box } from "../Layout";
import { Menu } from "../Menu";
import type { DataTableParams } from "./types";

const meta: Meta = {
  title: "Components/DataTable",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

const columnHelper = createDataTableColumnHelper<Person>();

const onRowClick = fn().mockName("onRowClick");
const onAction = fn().mockName("onAction");

const actionsColumn = columnHelper.display({
  id: "actions",
  meta: { align: "end", width: 64 },
  cell: ({ row }) => (
    <Menu.Root
      placement="bottom-end"
      onSelect={({ value }) => onAction(value, row.original)}
    >
      <Menu.Trigger asChild>
        <IconButton
          variant="plain"
          size="sm"
          aria-label="Actions"
        >
          <EllipsisIcon />
        </IconButton>
      </Menu.Trigger>
      <Menu.Content>
        <Menu.Item
          value="edit"
          icon={<PencilIcon />}
        >
          Edit
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item
          value="delete"
          icon={<TrashIcon />}
          destructive
        >
          Delete
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  ),
});

const columns = [
  columnHelper.accessor("id", { header: "ID", meta: { type: "number", width: 150 } }),
  columnHelper.accessor("name", { header: "Name", meta: { type: "input" } }),
  columnHelper.accessor("email", { header: "Email", meta: { type: "input" } }),
  columnHelper.accessor("role", { header: "Role", meta: { type: "select" } }),
  columnHelper.accessor("createdAt", { header: "Created At", meta: { type: "date" } }),
  actionsColumn,
];

const constrainedColumns = [
  columnHelper.accessor("id", { header: "ID", meta: { type: "number", minWidth: 200 } }),
  columnHelper.accessor("name", { header: "Name", meta: { type: "input" } }),
  columnHelper.accessor("email", {
    header: "Email Address (truncated)",
    meta: { type: "input", width: 140 },
  }),
  columnHelper.accessor("role", {
    header: "Role (center)",
    meta: { type: "select", align: "center" },
  }),
  columnHelper.accessor("createdAt", {
    header: "Created At (end)",
    meta: { type: "date", align: "end", minWidth: 160 },
  }),
  columnHelper.display({
    id: "status",
    header: "Status",
    cell: ({ row }) => (row.original.id % 2 ? "Active" : "Invited"),
  }),
  columnHelper.display({
    id: "score",
    header: "Score",
    meta: { align: "end", width: 96 },
    cell: ({ row }) => row.original.id * 7,
  }),
  actionsColumn,
];

const cardColumns = [
  columnHelper.accessor("id", { header: "ID", meta: { type: "number", card: "hidden" } }),
  columnHelper.accessor("name", { header: "Name", meta: { type: "input", card: "title" } }),
  columnHelper.accessor("email", { header: "Email", meta: { type: "input", card: "subtitle" } }),
  columnHelper.accessor("role", { header: "Role", meta: { type: "select" } }),
  columnHelper.accessor("createdAt", { header: "Created At", meta: { type: "date" } }),
  { ...actionsColumn, meta: { ...actionsColumn.meta, card: "actions" as const } },
];

const data: Person[] = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "Admin",
    createdAt: "2024-01-15",
  },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "User", createdAt: "2024-02-20" },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Editor",
    createdAt: "2024-03-10",
  },
  {
    id: 4,
    name: "Diana Prince",
    email: "diana@example.com",
    role: "Admin",
    createdAt: "2024-04-05",
  },
  { id: 5, name: "Eve Williams", email: "eve@example.com", role: "User", createdAt: "2024-05-18" },
  {
    id: 6,
    name: "Frank Castle",
    email: "frank@example.com",
    role: "Admin",
    createdAt: "2024-06-01",
  },
  {
    id: 7,
    name: "Grace Hopper",
    email: "grace@example.com",
    role: "Editor",
    createdAt: "2024-06-12",
  },
  { id: 8, name: "Hank Pym", email: "hank@example.com", role: "User", createdAt: "2024-07-03" },
  {
    id: 9,
    name: "Irene Adler",
    email: "irene@example.com",
    role: "Editor",
    createdAt: "2024-07-22",
  },
  {
    id: 10,
    name: "Jack Reacher",
    email: "jack@example.com",
    role: "User",
    createdAt: "2024-08-09",
  },
  {
    id: 11,
    name: "Karen Page",
    email: "karen@example.com",
    role: "Admin",
    createdAt: "2024-08-30",
  },
  { id: 12, name: "Leo Messi", email: "leo@example.com", role: "User", createdAt: "2024-09-14" },
  { id: 13, name: "Mona Lisa", email: "mona@example.com", role: "Editor", createdAt: "2024-09-28" },
  { id: 14, name: "Nate Silver", email: "nate@example.com", role: "User", createdAt: "2024-10-05" },
  {
    id: 15,
    name: "Olivia Pope",
    email: "olivia@example.com",
    role: "Admin",
    createdAt: "2024-10-19",
  },
  {
    id: 16,
    name: "Peter Parker",
    email: "peter@example.com",
    role: "User",
    createdAt: "2024-11-02",
  },
  {
    id: 17,
    name: "Quinn Hughes",
    email: "quinn@example.com",
    role: "Editor",
    createdAt: "2024-11-15",
  },
  {
    id: 18,
    name: "Rachel Green",
    email: "rachel@example.com",
    role: "User",
    createdAt: "2024-11-28",
  },
  {
    id: 19,
    name: "Steve Rogers",
    email: "steve@example.com",
    role: "Admin",
    createdAt: "2024-12-10",
  },
  {
    id: 20,
    name: "Tina Turner",
    email: "tina@example.com",
    role: "Editor",
    createdAt: "2024-12-25",
  },
  { id: 21, name: "Uma Thurman", email: "uma@example.com", role: "User", createdAt: "2025-01-08" },
  {
    id: 22,
    name: "Victor Hugo",
    email: "victor@example.com",
    role: "Editor",
    createdAt: "2025-01-20",
  },
  {
    id: 23,
    name: "Wendy Darling",
    email: "wendy@example.com",
    role: "Admin",
    createdAt: "2025-02-03",
  },
  {
    id: 24,
    name: "Xander Harris",
    email: "xander@example.com",
    role: "User",
    createdAt: "2025-02-17",
  },
  {
    id: 25,
    name: "Yara Shahidi",
    email: "yara@example.com",
    role: "Editor",
    createdAt: "2025-03-01",
  },
];

const defaultParams: DataTableParams = {
  orderBy: "",
  orderType: "",
  page: 1,
  pageSize: 10,
  filters: {},
};

function DataTableStory(props: {
  data: Person[];
  loading?: boolean;
  variant?: "default" | "basic";
  columnDefs?: DataTableProps<Person>["columnDefs"];
  mobileLayout?: DataTableProps<Person>["mobileLayout"];
}) {
  const [params, setParams] = useState<DataTableParams>(defaultParams);

  return (
    <DataTable
      clientSide
      columnDefs={props.columnDefs ?? columns}
      data={props.data}
      params={params}
      onParamChange={setParams}
      loading={props.loading}
      variant={props.variant}
      onRowClick={onRowClick}
      mobileLayout={props.mobileLayout}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Box
      display="flex"
      maxW="800px"
      height="420px"
    >
      <DataTableStory data={data} />
    </Box>
  ),
};

export const Loading: Story = {
  render: () => (
    <Box maxW="800px">
      <DataTableStory
        data={[]}
        loading
      />
    </Box>
  ),
};

export const Empty: Story = {
  render: () => (
    <Box maxW="800px">
      <DataTableStory data={[]} />
    </Box>
  ),
};

export const Basic: Story = {
  render: () => (
    <DataTableStory
      data={data}
      variant="basic"
    />
  ),
};

export const Constrained: Story = {
  render: () => (
    <Box
      display="flex"
      maxW="480px"
      height="360px"
    >
      <DataTableStory
        data={data}
        columnDefs={constrainedColumns}
      />
    </Box>
  ),
};

export const MobileCards: Story = {
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  render: () => (
    <Box
      display="flex"
      height="100dvh"
    >
      <DataTableStory
        data={data}
        columnDefs={cardColumns}
        mobileLayout="cards"
      />
    </Box>
  ),
};
