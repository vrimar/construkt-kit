import type { Meta, StoryObj } from "@storybook/react-vite";
import { createColumnHelper } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable } from ".";
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
];

const defaultParams: DataTableParams = {
  orderBy: "",
  orderType: "",
  page: 1,
  pageSize: 10,
  filters: {},
};

function DataTableStory(props: { data: Person[]; loading?: boolean; isBasic?: boolean }) {
  const [params, setParams] = useState<DataTableParams>(defaultParams);
  return (
    <DataTable
      columns={columns}
      data={props.data}
      totalItems={props.data.length}
      params={params}
      onParamChange={setParams}
      loading={props.loading}
      isBasic={props.isBasic}
      selections={{ role: roleSelections }}
    />
  );
}

export const Default: Story = {
  render: () => <DataTableStory data={data} />,
};

export const Loading: Story = {
  render: () => (
    <DataTableStory
      data={[]}
      loading
    />
  ),
};

export const Empty: Story = {
  render: () => <DataTableStory data={[]} />,
};

export const Basic: Story = {
  render: () => (
    <DataTableStory
      data={data}
      isBasic
    />
  ),
};
