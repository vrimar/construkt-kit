import type { ReactNode } from "react";

import { Table } from "../components/Table";

interface Props<T extends string> {
  sizes: T[];
  renderPreview: (size: T) => ReactNode;
  pivot?: boolean;
}

export const SizePreviewTable = <T extends string>({ sizes, renderPreview, pivot }: Props<T>) => {
  if (pivot) {
    return (
      <Table.Root>
        <Table.Head>
          <Table.Row>
            {sizes.map((size) => (
              <Table.Header key={size}>{size}</Table.Header>
            ))}
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            {sizes.map((size) => (
              <Table.Cell key={size}>{renderPreview(size)}</Table.Cell>
            ))}
          </Table.Row>
        </Table.Body>
      </Table.Root>
    );
  }

  return (
    <Table.Root maxWidth="420px">
      <Table.Head>
        <Table.Row>
          <Table.Header>Size</Table.Header>
          <Table.Header>Preview</Table.Header>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {sizes.map((size) => (
          <Table.Row key={size}>
            <Table.Cell>{size}</Table.Cell>
            <Table.Cell>{renderPreview(size)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};
