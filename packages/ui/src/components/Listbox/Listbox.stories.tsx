import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { Listbox } from ".";
import { Button } from "../Buttons";
import { HStack } from "../Layout";
import { Popover } from "../Popover";

const items = [
  { id: 1, name: "Apple" },
  { id: 2, name: "Banana" },
  { id: 3, name: "Cherry" },
  { id: 4, name: "Dragon fruit" },
];

const produce = [
  { id: 1, name: "Apple", kind: "Fruit" },
  { id: 2, name: "Carrot", kind: "Vegetable" },
  { id: 3, name: "Banana", kind: "Fruit" },
  { id: 4, name: "Spinach", kind: "Vegetable" },
];

const meta = preview.meta({
  title: "Components/Listbox",
  component: Listbox,
});

export const Default = meta.story({
  render: function DefaultStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        label="Fruit"
        maxW="64"
      />
    );
  },
});

export const Multiple = meta.story({
  render: function MultipleStory() {
    const [value, setValue] = useState<number[]>([1]);
    return (
      <Listbox
        items={items}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        selectionMode="multiple"
        value={value}
        onValueChange={setValue}
        label="Fruits"
        maxW="64"
      />
    );
  },
});

export const CustomRendering = meta.story({
  // The name is the item's label; hints and shortcuts are its description, which WCAG 2.5.3 allows.
  parameters: {
    a11y: { config: { rules: [{ id: "label-content-name-mismatch", enabled: false }] } },
  },
  render: () => (
    <Listbox
      items={items}
      getItemValue={(item) => item.id}
      getItemLabel={(item) => item.name}
      value={1}
      onValueChange={() => {}}
      renderItem={(item, state) => `${item.name}${state.selected ? " (selected)" : ""}`}
      renderItemActions={(item) => <button type="button">Edit {item.name}</button>}
      label="Fruit"
      maxW="64"
    />
  ),
});

export const OverlayActions = meta.story({
  render: () => (
    <Listbox
      items={items}
      getItemValue={(item) => item.id}
      getItemLabel={(item) => item.name}
      value={4}
      onValueChange={() => {}}
      selection="tint"
      actionsPosition="overlay"
      actionsVisibility="always"
      renderItemActions={(item) => (
        <Button
          size="2xs"
          variant="plain"
          aria-label={`Edit ${item.name}`}
        >
          Edit
        </Button>
      )}
      label="Fruit"
      maxW="32"
    />
  ),
});

const teamMembers = [
  { id: 1, name: "Ada Lovelace", count: 12, unavailable: "Already assigned" },
  { id: 2, name: "Grace Hopper", count: 8 },
  { id: 3, name: "Alan Turing", count: 3, unavailable: "On leave" },
  { id: 4, name: "Mary Jackson", count: 5 },
];

export const Hints = meta.story({
  // The name is the item's label; hints and shortcuts are its description, which WCAG 2.5.3 allows.
  parameters: {
    a11y: { config: { rules: [{ id: "label-content-name-mismatch", enabled: false }] } },
  },
  render: function HintsStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={teamMembers}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        isItemDisabled={(item) => item.unavailable != null}
        renderItemHint={(item, state) =>
          state.disabled ? item.unavailable : `${item.count} tasks`
        }
        value={value}
        onValueChange={setValue}
        label="Assignee"
        maxW="64"
      />
    );
  },
});

export const IndicatorPositions = meta.story({
  render: () => (
    <HStack
      alignItems="flex-start"
      flexWrap="wrap"
    >
      {(["start", "end", "none"] as const).map((indicatorPosition) => (
        <Listbox
          key={indicatorPosition}
          items={items}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.name}
          value={1}
          onValueChange={() => {}}
          label={indicatorPosition}
          indicatorPosition={indicatorPosition}
          search={false}
          maxW="56"
        />
      ))}
    </HStack>
  ),
});

export const Selections = meta.story({
  render: () => (
    <HStack alignItems="flex-start">
      {(["check", "tint"] as const).map((selection) => (
        <Listbox
          key={selection}
          items={items}
          getItemValue={(item) => item.id}
          getItemLabel={(item) => item.name}
          value={2}
          onValueChange={() => {}}
          label={selection}
          selection={selection}
          search={false}
          maxW="56"
        />
      ))}
    </HStack>
  ),
});

export const Grouped = meta.story({
  render: function GroupedStory() {
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={produce}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        groupBy={(item) => item.kind}
        groupSort="asc"
        value={value}
        onValueChange={setValue}
        search
        label="Produce"
        maxW="64"
      />
    );
  },
});

export const Virtualized = meta.story({
  render: function VirtualizedStory() {
    const manyItems = Array.from({ length: 1_000 }, (_, index) => ({
      id: index,
      name: `Item ${index}`,
    }));
    const [value, setValue] = useState<number | null>(null);
    return (
      <Listbox
        items={manyItems}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        value={value}
        onValueChange={setValue}
        virtual
        label="Item"
        maxW="64"
      />
    );
  },
});

export const InPopover = meta.story({
  tags: ["open-state"],
  render: function InPopoverStory() {
    const [value, setValue] = useState<number | null>(1);
    return (
      <Popover.Root defaultOpen>
        <Popover.Trigger render={<Button variant="outline" />}>Produce</Popover.Trigger>
        <Popover.Content>
          <Popover.Header>
            <Popover.Title>Produce</Popover.Title>
          </Popover.Header>
          <Popover.Body>
            <Listbox
              items={produce}
              getItemValue={(item) => item.id}
              getItemLabel={(item) => item.name}
              groupBy={(item) => item.kind}
              groupSort="asc"
              value={value}
              onValueChange={setValue}
              search={{ placeholder: "Search produce" }}
              aria-label="Produce"
            />
          </Popover.Body>
          <Popover.Footer stretch>
            <Button
              size="sm"
              variant="plain"
              colorPalette="brand"
            >
              New item…
            </Button>
          </Popover.Footer>
        </Popover.Content>
      </Popover.Root>
    );
  },
});
