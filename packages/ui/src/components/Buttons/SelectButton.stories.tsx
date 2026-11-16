import preview from "@construkt-kit/story-kit/preview";
import { useState } from "react";

import { button } from "#styled-system/recipes";

import { ButtonGroup, SelectButton } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { HStack, VStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Buttons/SelectButton",
  component: SelectButton,
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <VStack
      gap="2"
      maxW="300px"
    >
      <SelectButton
        label="Select an option"
        hasValue={false}
      />
      <SelectButton
        label="Selected value"
        hasValue
      />
    </VStack>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={button.variantMap.size}
      renderPreview={(size) => (
        <SelectButton
          size={size}
          label={`Selected value (${size})`}
          hasValue
        />
      )}
    />
  ),
});

export const Active = meta.story({
  render: () => (
    <HStack gap="2">
      <SelectButton
        sublabel="Group by"
        label="None"
        hasValue
      />
      <SelectButton
        active
        sublabel="Group by"
        label="Status"
        hasValue
      />
    </HStack>
  ),
});

const FILTER = "Open tasks assigned to me due this month";

function ClearableDemo() {
  const [filter, setFilter] = useState<string>();

  return (
    <SelectButton
      maxW="72"
      active={filter != null}
      sublabel="Filter"
      label={filter ?? "None"}
      hasValue={filter != null}
      onClick={() => setFilter(FILTER)}
      onClear={filter == null ? undefined : () => setFilter(undefined)}
      clearLabel="Clear filter"
    />
  );
}

export const Clearable = meta.story({
  render: () => <ClearableDemo />,
});

function StripDemo() {
  const [filter, setFilter] = useState<string | undefined>(FILTER);

  return (
    <ButtonGroup
      attached
      size="sm"
    >
      <SelectButton
        maxW="64"
        active={filter != null}
        sublabel="Filter"
        label={filter ?? "None"}
        hasValue={filter != null}
        onClick={() => setFilter(FILTER)}
        onClear={filter == null ? undefined : () => setFilter(undefined)}
        clearLabel="Clear filter"
      />
      <SelectButton
        sublabel="Group by"
        label="Status"
        hasValue
      />
      <SelectButton
        sublabel="Owner"
        label="All team members"
        hasValue
      />
    </ButtonGroup>
  );
}

export const Strip = meta.story({
  render: () => <StripDemo />,
});
