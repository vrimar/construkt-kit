import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table } from ".";
import { Box, VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Table",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const data = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", role: "User" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", role: "Editor" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", role: "Admin" },
];

export const Default: Story = {
  render: () => (
    <Box maxW="600px">
      <Table.Root>
        <Table.Head>
          <Table.Row>
            <Table.Header>Name</Table.Header>
            <Table.Header>Email</Table.Header>
            <Table.Header>Role</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.name}</Table.Cell>
              <Table.Cell>{row.email}</Table.Cell>
              <Table.Cell>{row.role}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  ),
};

export const WithCaption: Story = {
  render: () => (
    <Box maxW="600px">
      <Table.Root>
        <Table.Caption>Team Members</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.Header>Name</Table.Header>
            <Table.Header>Role</Table.Header>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {data.map((row) => (
            <Table.Row key={row.id}>
              <Table.Cell>{row.name}</Table.Cell>
              <Table.Cell>{row.role}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.Cell colSpan={2}>Total: {data.length} members</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table.Root>
    </Box>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack gap="6">
      {(["sm", "md"] as const).map((size) => (
        <Table.Root
          key={size}
          size={size}
        >
          <Table.Head>
            <Table.Row>
              <Table.Header>Size: {size}</Table.Header>
              <Table.Header>Value</Table.Header>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Row 1</Table.Cell>
              <Table.Cell>Data</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      ))}
    </VStack>
  ),
};
