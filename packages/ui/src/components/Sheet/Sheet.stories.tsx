import type { Meta, StoryObj } from "@storybook/react-vite";
import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";

import { Sheet } from ".";
import { Button, IconButton } from "../Buttons";
import { Select } from "../Select";
import { Text } from "../Text";

const meta: Meta = {
  title: "Components/Sheet",
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export default meta;
type Story = StoryObj;

const lines = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);

export const Default: Story = {
  render: () => (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button>Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header
          endElement={
            <Sheet.ActionTrigger asChild>
              <Button
                variant="plain"
                size="sm"
              >
                Done
              </Button>
            </Sheet.ActionTrigger>
          }
        >
          <Sheet.Title>Sheet title</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          <Text>Swipe down, tap the backdrop or press Escape to close.</Text>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
};

export const FullHeight: Story = {
  render: () => (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button>Open full-height sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content fullHeight>
        <Sheet.Header>
          <Sheet.Title>Long list</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          {lines.map((line) => (
            <Text
              key={line}
              py="2"
            >
              {line}
            </Text>
          ))}
        </Sheet.Body>
        <Sheet.Footer>
          <Sheet.ActionTrigger asChild>
            <Button
              width="full"
              size="lg"
            >
              Done
            </Button>
          </Sheet.ActionTrigger>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  ),
};

export const SnapPoints: Story = {
  render: () => (
    <Sheet.Root snapPoints={[0.5, 1]}>
      <Sheet.Trigger asChild>
        <Button>Open half-height sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content fullHeight>
        <Sheet.Header>
          <Sheet.Title>Drag up to expand</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          {lines.map((line) => (
            <Text
              key={line}
              py="2"
            >
              {line}
            </Text>
          ))}
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
};

export const Nested: Story = {
  render: () => (
    <Sheet.Root>
      <Sheet.Trigger asChild>
        <Button>Open sheet</Button>
      </Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Header>
          <Sheet.Title>Settings</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          <Sheet.Root>
            <Sheet.Trigger asChild>
              <Button variant="outline">Open nested sheet</Button>
            </Sheet.Trigger>
            <Sheet.Content>
              <Sheet.Header
                startElement={
                  <Sheet.ActionTrigger asChild>
                    <IconButton
                      variant="plain"
                      aria-label="Back"
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                  </Sheet.ActionTrigger>
                }
              >
                <Sheet.Title>Nested</Sheet.Title>
              </Sheet.Header>
              <Sheet.Body>
                <Text>Swiping this sheet leaves the one behind it in place.</Text>
              </Sheet.Body>
            </Sheet.Content>
          </Sheet.Root>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
};

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

export const PickerInSheet: Story = {
  render: function PickerInSheetStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Sheet.Root>
        <Sheet.Trigger asChild>
          <Button>Open filters</Button>
        </Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Header>
            <Sheet.Title>Filters</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>
            <Select
              items={fruits}
              getItemValue={(item) => item.id}
              getItemLabel={(item) => item.name}
              value={value}
              onValueChange={setValue}
              placeholder="Fruit"
            />
          </Sheet.Body>
        </Sheet.Content>
      </Sheet.Root>
    );
  },
};
