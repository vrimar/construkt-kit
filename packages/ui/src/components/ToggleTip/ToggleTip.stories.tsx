import preview from "@construkt-kit/story-kit/preview";

import { InfoTip, ToggleTip } from ".";
import { Button } from "../Buttons";
import { HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/ToggleTip",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <ToggleTip label="This is a toggle tip with helpful information.">
      <Button variant="outline">Click for info</Button>
    </ToggleTip>
  ),
});

export const InfoTipStory = meta.story({
  name: "InfoTip",
  render: () => (
    <HStack gap="2">
      <span>Some label</span>
      <InfoTip>This provides additional context about the label.</InfoTip>
    </HStack>
  ),
});

export const WithArrow = meta.story({
  render: () => (
    <ToggleTip
      label="Arrow tip"
      showArrow
    >
      <Button variant="outline">With Arrow</Button>
    </ToggleTip>
  ),
});

export const Open = meta.story({
  tags: ["open-state"],
  render: () => (
    <ToggleTip
      label="Hours logged against a client project, rounded to the nearest quarter hour."
      showArrow
      defaultOpen
    >
      <Button variant="outline">What counts as billable?</Button>
    </ToggleTip>
  ),
});
