import preview from "@construkt-kit/story-kit/preview";

import { stat } from "#styled-system/recipes";

import { Stat } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Stat",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Stat.Root>
      <Stat.Label>Revenue</Stat.Label>
      <Stat.ValueText
        value={45600}
        formatOptions={{ style: "currency", currency: "USD" }}
      />
      <Stat.HelpText>Last 30 days</Stat.HelpText>
    </Stat.Root>
  ),
});

export const WithTrend = meta.story({
  render: () => (
    <Wrap gap="8">
      <Stat.Root>
        <Stat.Label>Sales</Stat.Label>
        <Stat.ValueText>$12,340</Stat.ValueText>
        <Stat.UpTrend>12%</Stat.UpTrend>
      </Stat.Root>
      <Stat.Root>
        <Stat.Label>Expenses</Stat.Label>
        <Stat.ValueText>$8,120</Stat.ValueText>
        <Stat.DownTrend>4%</Stat.DownTrend>
      </Stat.Root>
    </Wrap>
  ),
});

export const WithInfo = meta.story({
  render: () => (
    <Stat.Root>
      <Stat.Label info="Total unique visitors in the last 30 days">Visitors</Stat.Label>
      <Stat.ValueText value={24500} />
    </Stat.Root>
  ),
});

export const WithUnit = meta.story({
  render: () => (
    <Stat.Root>
      <Stat.Label>Response Time</Stat.Label>
      <Stat.ValueText>
        120<Stat.ValueUnit>ms</Stat.ValueUnit>
      </Stat.ValueText>
    </Stat.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={stat.variantMap.size}
      renderPreview={(size) => (
        <Stat.Root size={size}>
          <Stat.Label>Revenue ({size})</Stat.Label>
          <Stat.ValueText>$12,340</Stat.ValueText>
          <Stat.HelpText>Last 30 days</Stat.HelpText>
        </Stat.Root>
      )}
    />
  ),
});
