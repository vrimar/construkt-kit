import preview from "@construkt-kit/story-kit/preview";

import { Popover } from ".";
import { Button } from "../Buttons";
import { HStack } from "../Layout";
import { Span } from "../Span";

const meta = preview.meta({
  title: "Components/Popover/InheritedText",
});

export const InsideSmallUnselectableText = meta.story({
  render: () => (
    <HStack
      gap="3"
      fontSize="xs"
      lineHeight="1"
      userSelect="none"
      fontVariantNumeric="tabular-nums"
    >
      <Span>INV-1042</Span>
      <Span>Mar 9, 2026</Span>
      <Popover.Root>
        <Popover.Trigger
          render={
            <Button
              size="xs"
              variant="outline"
            />
          }
        >
          Details
        </Popover.Trigger>
        <Popover.Content>
          <Popover.Header>
            <Popover.Title>Invoice INV-1042</Popover.Title>
          </Popover.Header>
          <Popover.Body>Paid on March 9 by bank transfer.</Popover.Body>
        </Popover.Content>
      </Popover.Root>
    </HStack>
  ),
});
