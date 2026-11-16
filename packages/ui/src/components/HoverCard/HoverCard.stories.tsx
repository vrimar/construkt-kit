import preview from "@construkt-kit/story-kit/preview";

import { HoverCard } from ".";
import { Button } from "../Buttons";
import { Box, Stack } from "../Layout";
import { Link } from "../Link";
import { Text } from "../Text";

const meta = preview.meta({
  title: "Components/HoverCard",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <HoverCard.Root>
      <HoverCard.Trigger asChild>
        <Button variant="outline">Hover me</Button>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <HoverCard.Arrow />
        <Box p="4">
          <strong>Hover Card Content</strong>
          <p>This card appears on hover.</p>
        </Box>
      </HoverCard.Content>
    </HoverCard.Root>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <HoverCard.Root defaultOpen>
      <HoverCard.Trigger asChild>
        <Link href="#ada">@ada</Link>
      </HoverCard.Trigger>
      <HoverCard.Content>
        <HoverCard.Arrow />
        <Stack
          gap="1"
          p="4"
          maxW="64"
        >
          <Text fontWeight="semibold">Ada Lovelace</Text>
          <Text
            textStyle="sm"
            color="fg.muted"
          >
            Analytics lead. Owns the revenue dashboards and the weekly metrics review.
          </Text>
          <Text
            textStyle="xs"
            color="fg.subtle"
          >
            12 projects · 4 teams
          </Text>
        </Stack>
      </HoverCard.Content>
    </HoverCard.Root>
  ),
});
