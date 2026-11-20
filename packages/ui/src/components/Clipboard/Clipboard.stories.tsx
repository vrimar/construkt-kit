import preview from "@construkt-kit/story-kit/preview";

import { Clipboard } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/Clipboard",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="320px">
      <Clipboard.Root value="https://example.com">
        <Clipboard.Label>Share URL</Clipboard.Label>
        <Clipboard.Control>
          <Clipboard.Input />
          <Clipboard.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
              />
            }
          >
            <Clipboard.Indicator />
          </Clipboard.Trigger>
        </Clipboard.Control>
      </Clipboard.Root>
    </Box>
  ),
});

export const CopyText = meta.story({
  render: () => (
    <Box maxW="320px">
      <Clipboard.Root value="Copy me!">
        <Clipboard.Label>Snippet</Clipboard.Label>
        <Clipboard.Control>
          <Clipboard.Input />
          <Clipboard.Trigger
            render={
              <Button
                variant="outline"
                size="sm"
              />
            }
          >
            <Clipboard.CopyText />
          </Clipboard.Trigger>
        </Clipboard.Control>
      </Clipboard.Root>
    </Box>
  ),
});
