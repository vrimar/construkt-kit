import preview from "@construkt-kit/story-kit/preview";
import { DatabaseIcon, SparklesIcon, UploadIcon } from "lucide-react";
import { useState } from "react";

import { tag } from "#styled-system/recipes";

import { Tag } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Tag",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Tag.Root>
      <Tag.Label>Draft</Tag.Label>
    </Tag.Root>
  ),
});

export const Variants = meta.story({
  render: () => (
    <Wrap gap="2">
      {tag.variantMap.variant.map((variant) => (
        <Tag.Root
          key={variant}
          variant={variant}
        >
          <Tag.Label>{variant}</Tag.Label>
        </Tag.Root>
      ))}
      <Tag.Root colorPalette="yellow">
        <Tag.StartElement>
          <UploadIcon />
        </Tag.StartElement>
        <Tag.Label>Version 3 is ready</Tag.Label>
      </Tag.Root>
    </Wrap>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={tag.variantMap.size}
      renderPreview={(size) => (
        <Tag.Root size={size}>
          <Tag.StartElement>
            <DatabaseIcon />
          </Tag.StartElement>
          <Tag.Label>Data</Tag.Label>
          <Tag.CloseTrigger />
        </Tag.Root>
      )}
    />
  ),
});

export const Closable = meta.story({
  render: function Render() {
    const [teams, setTeams] = useState(["Design", "Engineering", "Marketing", "Customer support"]);
    return (
      <Wrap gap="2">
        {teams.map((team) => (
          <Tag.Root key={team}>
            <Tag.Label>{team}</Tag.Label>
            <Tag.CloseTrigger
              aria-label={`Remove ${team}`}
              onClick={() => setTeams((current) => current.filter((t) => t !== team))}
            />
          </Tag.Root>
        ))}
      </Wrap>
    );
  },
});

export const Clickable = meta.story({
  render: function Render() {
    const [picked, setPicked] = useState<string[]>(["Open"]);
    const toggle = (label: string) =>
      setPicked((current) =>
        current.includes(label) ? current.filter((l) => l !== label) : [...current, label],
      );
    return (
      <Wrap gap="2">
        <Tag.Root render={<button type="button" />}>
          <SparklesIcon />
          What stands out?
        </Tag.Root>
        {["Open", "In progress", "Done"].map((label) => (
          <Tag.Root
            key={label}
            render={
              <button
                type="button"
                aria-pressed={picked.includes(label)}
                onClick={() => toggle(label)}
              />
            }
          >
            {label}
          </Tag.Root>
        ))}
        <Tag.Root
          render={
            <button
              type="button"
              disabled
            />
          }
          variant="subtle"
        >
          Disabled
        </Tag.Root>
      </Wrap>
    );
  },
});
