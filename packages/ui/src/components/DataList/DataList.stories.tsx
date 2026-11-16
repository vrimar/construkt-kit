import preview from "@construkt-kit/story-kit/preview";

import { dataList } from "#styled-system/recipes";

import { DataList, type DataListRootProps } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Grid } from "../Layout";

const meta = preview.meta({
  title: "Components/DataList",
  tags: ["autodocs"],
});

const items = [
  { label: "Prepared by", value: "Ada Lovelace" },
  { label: "Due date", value: "March 2026" },
  { label: "Shared with", value: "All workspace members (1,204)" },
];

const Example = (props: DataListRootProps) => (
  <DataList.Root {...props}>
    {items.map((item) => (
      <DataList.Item key={item.label}>
        <DataList.ItemLabel>{item.label}</DataList.ItemLabel>
        <DataList.ItemValue>{item.value}</DataList.ItemValue>
      </DataList.Item>
    ))}
  </DataList.Root>
);

export const Default = meta.story({
  render: () => <Example />,
});

export const Orientations = meta.story({
  render: () => (
    <Grid
      gridTemplateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap="10"
      maxW="3xl"
    >
      <Example orientation="horizontal" />
      <Example orientation="vertical" />
    </Grid>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={dataList.variantMap.size}
      renderPreview={(size) => (
        <Example
          orientation="horizontal"
          size={size}
        />
      )}
    />
  ),
});
