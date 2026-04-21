import type { Meta, StoryObj } from "@storybook/react-vite";

import { Stat } from ".";
import { Flex, HStack } from "../Layout";

const meta: Meta = {
  title: "Components/Stat",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
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
};

export const WithTrend: Story = {
  render: () => (
    <HStack gap="8">
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
    </HStack>
  ),
};

export const WithInfo: Story = {
  render: () => (
    <Stat.Root>
      <Stat.Label info="Total unique visitors in the last 30 days">Visitors</Stat.Label>
      <Stat.ValueText value={24500} />
    </Stat.Root>
  ),
};

export const WithUnit: Story = {
  render: () => (
    <Stat.Root>
      <Stat.Label>Response Time</Stat.Label>
      <Stat.ValueText>
        120<Stat.ValueUnit>ms</Stat.ValueUnit>
      </Stat.ValueText>
    </Stat.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Flex
      gap="8"
      p="4"
      align="flex-start"
    >
      {(["sm", "md", "lg"] as const).map((size) => (
        <Stat.Root
          key={size}
          size={size}
        >
          <Stat.Label>Revenue ({size})</Stat.Label>
          <Stat.ValueText>$12,340</Stat.ValueText>
          <Stat.HelpText>Last 30 days</Stat.HelpText>
        </Stat.Root>
      ))}
    </Flex>
  ),
};
