import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

import { radioCardGroup } from "#styled-system/recipes";

import { RadioCard } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";

const meta: Meta = {
  title: "Components/RadioCard",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <RadioCard.Root
      defaultValue="option-1"
      maxW="400px"
    >
      <RadioCard.Label>Select a plan</RadioCard.Label>
      {[
        { value: "option-1", title: "Starter", description: "Best for small projects" },
        { value: "option-2", title: "Pro", description: "Best for growing teams" },
        { value: "option-3", title: "Enterprise", description: "Best for large organizations" },
      ].map((item) => (
        <RadioCard.Item
          key={item.value}
          value={item.value}
          label={item.title}
          description={item.description}
        />
      ))}
    </RadioCard.Root>
  ),
};

export const WithAddon: Story = {
  render: () => (
    <RadioCard.Root
      defaultValue="monthly"
      maxW="400px"
    >
      <RadioCard.Label>Billing</RadioCard.Label>
      <RadioCard.Item
        value="monthly"
        label="Monthly"
        description="Billed every month"
      />
      <RadioCard.Item
        value="yearly"
        label="Yearly"
        description="Billed once a year"
        addon="Two months free"
      />
    </RadioCard.Root>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioCard.Root
      defaultValue="monthly"
      orientation="horizontal"
      maxW="480px"
    >
      <RadioCard.Label>Billing</RadioCard.Label>
      <RadioCard.Item
        value="monthly"
        label="Monthly"
        description="Billed every month"
      />
      <RadioCard.Item
        value="yearly"
        label="Yearly"
        description="Billed once a year"
      />
    </RadioCard.Root>
  ),
};

export const CustomIndicator: Story = {
  render: () => (
    <RadioCard.Root
      defaultValue="light"
      maxW="400px"
    >
      <RadioCard.Label>Theme</RadioCard.Label>
      {[
        { value: "light", title: "Light", indicator: <SunIcon /> },
        { value: "dark", title: "Dark", indicator: <MoonIcon /> },
        { value: "system", title: "System", indicator: <MonitorIcon /> },
      ].map((item) => (
        <RadioCard.Item
          key={item.value}
          value={item.value}
          label={item.title}
          indicator={item.indicator}
        />
      ))}
    </RadioCard.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={radioCardGroup.variantMap.size}
      renderPreview={(size) => (
        <RadioCard.Root
          defaultValue="starter"
          maxW="280px"
          size={size}
        >
          <RadioCard.Label>{size.toUpperCase()} plan selection</RadioCard.Label>
          {[
            { value: "starter", title: "Starter" },
            { value: "pro", title: "Pro" },
          ].map((item) => (
            <RadioCard.Item
              key={item.value}
              value={item.value}
              label={item.title}
            />
          ))}
        </RadioCard.Root>
      )}
    />
  ),
};
