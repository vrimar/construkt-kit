import type { Meta, StoryObj } from "@storybook/react-vite";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";

import { DataTable } from ".";
import { Box } from "../Layout";
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

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor("name", { header: "Name", meta: { type: "input" } }),
  columnHelper.accessor("email", { header: "Email", meta: { type: "input" } }),
  columnHelper.accessor("role", { header: "Role", meta: { type: "select" } }),
  columnHelper.accessor("createdAt", { header: "Created At", meta: { type: "date" } }),
];

const roleSelections = ["Admin", "User", "Editor"];

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

function applyFiltersAndSorting(items: Person[], params: DataTableParams): Person[] {
  let result = [...items];

  // Apply filters
  for (const [key, values] of Object.entries(params.filters)) {
    if (!values || values.length === 0) continue;
    result = result.filter((row) => {
      const cell = String(row[key as keyof Person] ?? "");
      // For input/date filters, values is a single-element array with a search string
      // For select filters, values is an array of selected options
      return values.some((v) => cell === v || cell.toLowerCase().includes(v.toLowerCase()));
    });
  }

  // Apply sorting
  if (params.orderBy) {
    const key = params.orderBy as keyof Person;
    const dir = params.orderType === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const aVal = String(a[key] ?? "");
      const bVal = String(b[key] ?? "");
      return aVal.localeCompare(bVal) * dir;
    });
  }

  return result;
}

function paginate(items: Person[], params: DataTableParams): Person[] {
  const start = (params.page - 1) * params.pageSize;
  return items.slice(start, start + params.pageSize);
}

function DataTableStory(props: {
  data: Person[];
  loading?: boolean;
  variant?: "default" | "basic";
}) {
  const [params, setParams] = useState<DataTableParams>(defaultParams);
  const filtered = applyFiltersAndSorting(props.data, params);
  const paged = paginate(filtered, params);

  return (
    <DataTable
      columns={columns}
      data={paged}
      totalItems={filtered.length}
      params={params}
      onParamChange={setParams}
      loading={props.loading}
      variant={props.variant}
      selections={{ role: roleSelections }}
    />
  );
}

export const Default: Story = {
  render: () => (
    <Box maxW="800px">
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
