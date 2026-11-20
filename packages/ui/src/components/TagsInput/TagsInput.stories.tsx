import preview from "@construkt-kit/story-kit/preview";

import { tagsInput } from "#styled-system/recipes";

import { TagsInput } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Dialog } from "../Dialog";

const meta = preview.meta({
  title: "Components/TagsInput",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <TagsInput.Root
      defaultValue={["React", "Vue"]}
      maxW="400px"
    >
      <TagsInput.Label>Tags</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Items />
        <TagsInput.Input placeholder="Add tag..." />
        <TagsInput.ClearTrigger />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  ),
});

export const Empty = meta.story({
  render: () => (
    <TagsInput.Root maxW="400px">
      <TagsInput.Label>Keywords</TagsInput.Label>
      <TagsInput.Control>
        <TagsInput.Items />
        <TagsInput.Input placeholder="Type and press Enter..." />
      </TagsInput.Control>
      <TagsInput.HiddenInput />
    </TagsInput.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={tagsInput.variantMap.size}
      renderPreview={(size) => (
        <TagsInput.Root
          defaultValue={["React", "Vue"]}
          size={size}
        >
          <TagsInput.Label>Tags</TagsInput.Label>
          <TagsInput.Control>
            <TagsInput.Items />
            <TagsInput.Input placeholder="Add tag..." />
          </TagsInput.Control>
          <TagsInput.HiddenInput />
        </TagsInput.Root>
      )}
    />
  ),
});

export const InDialog = meta.story({
  tags: ["open-state"],
  render: () => (
    <Dialog.Root
      defaultOpen
      title="Edit post"
    >
      <Dialog.Trigger render={<Button />}>Edit post</Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Body>
          <TagsInput.Root defaultValue={["React", "Vue"]}>
            <TagsInput.Label>Tags</TagsInput.Label>
            <TagsInput.Control>
              <TagsInput.Items />
              <TagsInput.Input placeholder="Add tag..." />
            </TagsInput.Control>
          </TagsInput.Root>
        </Dialog.Body>
        <Dialog.CloseTrigger />
      </Dialog.Content>
    </Dialog.Root>
  ),
});
