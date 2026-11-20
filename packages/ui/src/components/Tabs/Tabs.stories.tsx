import preview from "@construkt-kit/story-kit/preview";

import { tabs } from "#styled-system/recipes";

import { Tabs } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Box, Stack } from "../Layout";

const meta = preview.meta({
  title: "Components/Tabs",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <Tabs.Root defaultValue="tab-1">
        <Tabs.List>
          <Tabs.Trigger value="tab-1">Overview</Tabs.Trigger>
          <Tabs.Trigger value="tab-2">Settings</Tabs.Trigger>
          <Tabs.Trigger value="tab-3">Billing</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="tab-1">Overview content goes here.</Tabs.Content>
        <Tabs.Content value="tab-2">Settings content goes here.</Tabs.Content>
        <Tabs.Content value="tab-3">Billing content goes here.</Tabs.Content>
      </Tabs.Root>
    </Box>
  ),
});

export const Variants = meta.story({
  render: () => (
    <Stack gap="6">
      {tabs.variantMap.variant.map((variant) => (
        <Tabs.Root
          key={variant}
          defaultValue="a"
          variant={variant}
        >
          <Tabs.List>
            <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="a">Tab A Content</Tabs.Content>
          <Tabs.Content value="b">Tab B Content</Tabs.Content>
        </Tabs.Root>
      ))}
    </Stack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={tabs.variantMap.size}
      renderPreview={(size) => (
        <Tabs.Root
          defaultValue="a"
          size={size}
        >
          <Tabs.List>
            <Tabs.Trigger value="a">Tab A</Tabs.Trigger>
            <Tabs.Trigger value="b">Tab B</Tabs.Trigger>
            <Tabs.Indicator />
          </Tabs.List>
          <Tabs.Content value="a">Content</Tabs.Content>
          <Tabs.Content value="b">Content</Tabs.Content>
        </Tabs.Root>
      )}
    />
  ),
});

export const ManualActivation = meta.story({
  render: () => (
    <Box maxW="400px">
      <Tabs.Root
        defaultValue="overview"
        activationMode="manual"
      >
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger
            value="usage"
            disabled
          >
            Usage
          </Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
          <Tabs.Indicator />
        </Tabs.List>
        <Tabs.Content value="overview">Overview content goes here.</Tabs.Content>
        <Tabs.Content value="usage">Usage content goes here.</Tabs.Content>
        <Tabs.Content value="settings">Settings content goes here.</Tabs.Content>
        <Tabs.Content value="billing">Billing content goes here.</Tabs.Content>
      </Tabs.Root>
    </Box>
  ),
});
