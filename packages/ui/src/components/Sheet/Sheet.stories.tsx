import preview from "@construkt-kit/story-kit/preview";
import { ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import { fn } from "storybook/test";

import { Sheet } from ".";
import { Button, IconButton } from "../Buttons";
import { Select } from "../Select";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/Sheet",
  tags: ["autodocs", "phone-only"],
  parameters: { layout: "fullscreen" },
  globals: { viewport: { value: "mobile1", isRotated: false } },
});

const lines = Array.from({ length: 30 }, (_, i) => `Row ${i + 1}`);

export const Default = meta.story({
  render: () => (
    <Sheet.Root title="Sheet title">
      <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
      <Sheet.Content
        headerEnd={
          <Sheet.ActionTrigger
            render={
              <Button
                variant="plain"
                size="sm"
              />
            }
          >
            Done
          </Sheet.ActionTrigger>
        }
      >
        <Sheet.Body>
          <Text>Swipe down, tap the backdrop or press Escape to close.</Text>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
});

export const FullHeight = meta.story({
  render: () => (
    <Sheet.Root title="Long list">
      <Sheet.Trigger render={<Button />}>Open full-height sheet</Sheet.Trigger>
      <Sheet.Content fullHeight>
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
          <Sheet.ActionTrigger
            render={
              <Button
                width="full"
                size="lg"
              />
            }
          >
            Done
          </Sheet.ActionTrigger>
        </Sheet.Footer>
      </Sheet.Content>
    </Sheet.Root>
  ),
});

export const SnapPoints = meta.story({
  render: () => (
    <Sheet.Root
      snapPoints={[0.5, 1]}
      title="Drag up to expand"
    >
      <Sheet.Trigger render={<Button />}>Open half-height sheet</Sheet.Trigger>
      <Sheet.Content fullHeight>
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
});

export const Nested = meta.story({
  render: () => (
    <Sheet.Root title="Settings">
      <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
      <Sheet.Content>
        <Sheet.Body>
          <Sheet.Root title="Nested">
            <Sheet.Trigger render={<Button variant="outline" />}>Open nested sheet</Sheet.Trigger>
            <Sheet.Content
              headerStart={
                <Sheet.ActionTrigger
                  render={
                    <IconButton
                      variant="plain"
                      aria-label="Back"
                    />
                  }
                >
                  <ChevronLeftIcon />
                </Sheet.ActionTrigger>
              }
            >
              <Sheet.Body>
                <Text>Swiping this sheet leaves the one behind it in place.</Text>
              </Sheet.Body>
            </Sheet.Content>
          </Sheet.Root>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
});

const fruits = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
];

export const PickerInSheet = meta.story({
  render: function PickerInSheetStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Sheet.Root title="Filters">
        <Sheet.Trigger render={<Button />}>Open filters</Sheet.Trigger>
        <Sheet.Content>
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
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <Sheet.Root
      defaultOpen
      title="Q3 planning"
    >
      <Sheet.Trigger render={<Button />}>Open sheet</Sheet.Trigger>
      <Sheet.Content
        headerEnd={
          <Sheet.ActionTrigger
            render={
              <Button
                variant="plain"
                size="sm"
              />
            }
          >
            Done
          </Sheet.ActionTrigger>
        }
      >
        <Sheet.Body>
          <Text>12 tasks · 4 members · Due 30 September</Text>
          <Text color="fg.muted">Swipe down, tap the backdrop or press Escape to close.</Text>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
});

export const HeldOpen = meta.story({
  tags: ["open-state"],
  args: { onOpenChange: fn(), onSnapPointChange: fn() },
  render: ({ onOpenChange, onSnapPointChange }) => (
    <Sheet.Root
      title="Uploading files"
      open
      snapPoints={[0.5, 1]}
      snapPoint={1}
      onOpenChange={onOpenChange}
      onSnapPointChange={onSnapPointChange}
    >
      <Sheet.Content fullHeight>
        <Sheet.Body>
          <Text>3 of 5 files uploaded.</Text>
          <Text color="fg.muted">This stays open at full height until every file is done.</Text>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet.Root>
  ),
});
