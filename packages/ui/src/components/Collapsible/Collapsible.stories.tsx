import preview from "@construkt-kit/story-kit/preview";

import { Collapsible } from ".";
import { Button } from "../Buttons";
import { Box } from "../Layout";

const meta = preview.meta({
  title: "Components/Collapsible",
  tags: ["autodocs"],
});

export const Default = meta.story({
  render: () => (
    <Box maxW="400px">
      <Collapsible.Root>
        <Collapsible.Trigger render={<Button variant="outline" />}>
          Toggle content
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Box p="4">
            This content can be expanded and collapsed. Lorem ipsum dolor sit amet, consectetur
            adipiscing elit.
          </Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  ),
});

export const DefaultOpen = meta.story({
  render: () => (
    <Box maxW="400px">
      <Collapsible.Root defaultOpen>
        <Collapsible.Trigger render={<Button variant="outline" />}>Toggle</Collapsible.Trigger>
        <Collapsible.Content>
          <Box p="4">This section is open by default.</Box>
        </Collapsible.Content>
      </Collapsible.Root>
    </Box>
  ),
});
