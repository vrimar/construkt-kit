import type { Meta, StoryObj } from "@storybook/react-vite";

import { editable } from "#styled-system/recipes";

import { Editable } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Table } from "../Table";

const meta: Meta = {
  title: "Components/Editable",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Editable.Root
      defaultValue="Click to edit"
      activationMode="click"
    >
      <Editable.Label>Name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
      <Editable.Control>
        <Editable.EditTrigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
        </Editable.EditTrigger>
        <Editable.CancelTrigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </Editable.CancelTrigger>
        <Editable.SubmitTrigger asChild>
          <Button size="sm">Save</Button>
        </Editable.SubmitTrigger>
      </Editable.Control>
    </Editable.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={editable.variantMap.size}
      renderPreview={(size) => (
        <Editable.Root
          defaultValue={`Editable value (${size})`}
          size={size}
        >
          <Editable.Label>{size}</Editable.Label>
          <Editable.Area>
            <Editable.Input />
            <Editable.Preview />
          </Editable.Area>
        </Editable.Root>
      )}
    />
  ),
};

export const PageTitle: Story = {
  render: () => (
    <Editable.Root
      size="inherit"
      textStyle="3xl"
      fontFamily="heading"
      fontWeight="semibold"
      placeholder="Untitled document"
      defaultValue="Quarterly review"
      maxW="xl"
    >
      <Editable.Area>
        <Editable.Input aria-label="Document title" />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  ),
};

const rowLabels = ["In store", "Wholesale", "Online"];

export const DoubleClickRename: Story = {
  render: () => (
    <Table.Root maxW="md">
      <Table.Head>
        <Table.Row>
          <Table.Header>Channel</Table.Header>
          <Table.Header textAlign="end">Orders</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rowLabels.map((label, index) => (
          <Table.Row key={label}>
            <Table.Cell>
              <Editable.Root
                size="inherit"
                activationMode="dblclick"
                defaultValue={label}
              >
                <Editable.Area>
                  <Editable.Input aria-label="Row label" />
                  <Editable.Preview />
                </Editable.Area>
              </Editable.Root>
            </Table.Cell>
            <Table.Cell textAlign="end">{(index + 2) * 137}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  ),
};
