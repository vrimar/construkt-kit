import preview from "@construkt-kit/story-kit/preview";

import { Badge } from "../components/Badge";
import { Button } from "../components/Buttons";
import { Box, HStack, Stack } from "../components/Layout";
import { Progress } from "../components/Progress";
import { Text } from "../components/Text";

const meta = preview.meta({
  title: "Foundations/Color scheme",
  parameters: {
    docs: {
      description: {
        component:
          "A `light` or `dark` class on any element forces that scheme for its subtree, whatever the " +
          "app's mode: semantic tokens, the default `brand` palette, text colour, `color-scheme` and " +
          "`_light`/`_dark` styles all follow the nearest scope. Give the scope its own background.",
      },
    },
  },
});

const Sample = ({ label }: { label: string }) => (
  <Stack gap="3">
    <Text fontWeight="semibold">{label}</Text>
    <Text color="fg.muted">Muted text follows the scope.</Text>
    <HStack gap="2">
      <Button size="sm">Primary</Button>
      <Button
        size="sm"
        variant="outline"
      >
        Outline
      </Button>
      <Badge>Badge</Badge>
    </HStack>
    <Progress.Root
      value={60}
      striped
    >
      <Progress.Track>
        <Progress.Range />
      </Progress.Track>
    </Progress.Root>
  </Stack>
);

export const NestedScopes = meta.story({
  render: () => (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap="6"
      alignItems="flex-start"
    >
      <Box
        className="dark"
        bg="bg"
        p="6"
        borderRadius="lg"
        w="sm"
        maxW="full"
      >
        <Sample label="Dark scope" />
        <Box
          className="light"
          bg="bg"
          p="6"
          mt="6"
          borderRadius="md"
          boxShadow="lg"
        >
          <Sample label="Light card inside it" />
        </Box>
      </Box>
      <Box
        className="light"
        bg="bg"
        p="6"
        borderRadius="lg"
        borderWidth="1px"
        w="sm"
        maxW="full"
      >
        <Sample label="Light scope" />
        <Box
          className="dark"
          bg="bg"
          p="6"
          mt="6"
          borderRadius="md"
        >
          <Sample label="Dark panel inside it" />
        </Box>
      </Box>
    </Stack>
  ),
});
