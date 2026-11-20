import preview from "@construkt-kit/story-kit/preview";

import { editable } from "#styled-system/recipes";

import { Editable } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Table } from "../Table";

const meta = preview.meta({
  title: "Components/Editable",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
        <Editable.EditTrigger
          render={
            <Button
              variant="outline"
              size="sm"
            />
          }
        >
          Edit
        </Editable.EditTrigger>
        <Editable.CancelTrigger
          render={
            <Button
              variant="outline"
              size="sm"
            />
          }
        >
          Cancel
        </Editable.CancelTrigger>
        <Editable.SubmitTrigger render={<Button size="sm" />}>Save</Editable.SubmitTrigger>
      </Editable.Control>
    </Editable.Root>
  ),
});

export const Sizes = meta.story({
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
});

export const PageTitle = meta.story({
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
});

export const Multiline = meta.story({
  render: () => (
    <Editable.Root
      defaultValue={"Call the supplier\nConfirm the delivery date"}
      maxW="sm"
    >
      <Editable.Label>Notes</Editable.Label>
      <Editable.Area>
        <Editable.Input render={<textarea rows={3} />} />
        <Editable.Preview whiteSpace="pre-wrap" />
      </Editable.Area>
    </Editable.Root>
  ),
});

const rowLabels = ["In store", "Wholesale", "Online"];

export const DoubleClickRename = meta.story({
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
});
