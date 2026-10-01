import type { ReactNode } from "react";

import { Table } from "../components/Table";

const SIZE_ORDER = ["inherit", "2xs", "xs", "sm", "md", "lg", "xl", "2xl", "full", "cover"];

const sizeRank = (size: string) => {
  const rank = SIZE_ORDER.indexOf(size);
  return rank === -1 ? SIZE_ORDER.length : rank;
};

interface Props<T extends string> {
  sizes: ReadonlyArray<T | undefined>;
  renderPreview: (size: T) => ReactNode;
  pivot?: boolean;
}

export const SizePreviewTable = <T extends string>({
  sizes: variants,
  renderPreview,
  pivot,
}: Props<T>) => {
  const sizes = variants
    .filter((size) => size !== undefined)
    .sort((a, b) => sizeRank(a) - sizeRank(b));

  if (pivot) {
    return (
      <Table.ScrollArea>
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
      </Table.ScrollArea>
    );
  }

  return (
    <Table.ScrollArea maxWidth={{ base: "full", sm: "420px" }}>
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
    </Table.ScrollArea>
  );
};
