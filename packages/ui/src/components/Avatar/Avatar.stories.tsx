import preview from "@construkt-kit/story-kit/preview";

import { avatar } from "#styled-system/recipes";

import { Avatar } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { Button } from "../Buttons";
import { Collapsible } from "../Collapsible";
import { HStack } from "../Layout";

const portraitSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="150" height="150" viewBox="0 0 150 150">
    <rect width="150" height="150" fill="#c7d2fe" />
    <circle cx="75" cy="58" r="28" fill="#4f46e5" />
    <path d="M24 150C24 112 48 92 75 92C102 92 126 112 126 150Z" fill="#4f46e5" />
  </svg>
`)}`;

const meta = preview.meta({
  title: "Components/Avatar",
  tags: ["autodocs"],
});

export const WithImage = meta.story({
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback name="John Doe" />
      <Avatar.Image
        src={portraitSrc}
        alt="John Doe"
      />
    </Avatar.Root>
  ),
});

export const WithInitials = meta.story({
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback name="Jane Smith" />
    </Avatar.Root>
  ),
});

export const WithIcon = meta.story({
  render: () => (
    <Avatar.Root>
      <Avatar.Fallback />
    </Avatar.Root>
  ),
});

export const Sizes = meta.story({
  render: () => (
    <SizePreviewTable
      sizes={avatar.variantMap.size}
      renderPreview={(size) => (
        <Avatar.Root size={size}>
          <Avatar.Fallback name="John Doe" />
        </Avatar.Root>
      )}
    />
  ),
});

export const LazyImageInClosedSection = meta.story({
  render: () => (
    <Collapsible.Root>
      <Collapsible.Trigger render={<Button variant="outline" />}>Reviewers</Collapsible.Trigger>
      <Collapsible.Content>
        <HStack pt="3">
          <Avatar.Root>
            <Avatar.Fallback name="Ada Lovelace" />
            <Avatar.Image
              loading="lazy"
              src={portraitSrc}
              alt="Ada Lovelace"
            />
          </Avatar.Root>
        </HStack>
      </Collapsible.Content>
    </Collapsible.Root>
  ),
});
