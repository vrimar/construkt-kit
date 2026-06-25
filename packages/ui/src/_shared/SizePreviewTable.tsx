import type { ReactNode } from "react";

import { Box } from "../components/Layout";
import { Table } from "../components/Table";

interface Props<T extends string> {
  sizes: T[];
  renderPreview: (size: T) => ReactNode;
  pivot?: boolean;
}

export const SizePreviewTable = <T extends string>({ sizes, renderPreview, pivot }: Props<T>) => {
  if (pivot) {
    return (
      // Many size columns sit side-by-side; let them scroll inside the canvas on narrow screens.
      <Box
        overflowX="auto"
        maxW="full"
      >
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
      </Box>
    );
  }

  return (
    <Box
      overflowX="auto"
      maxW={{ base: "full", sm: "420px" }}
    >
      <Table.Root>
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
    </Box>
  );
};
