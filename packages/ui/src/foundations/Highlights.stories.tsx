import preview from "@construkt-kit/story-kit/preview";
import { BellIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { Button } from "../components/Buttons";
import { Box, Grid, HStack, Stack } from "../components/Layout";
import { Text } from "../components/Text";

const meta = preview.meta({
  title: "Foundations/Highlights",
  parameters: {
    docs: {
      description: {
        component:
          "Animation styles that draw the eye to a change and fade back to the element's own look. " +
          "`fresh`, `changed`, `flash` and `spot` take their colour from `colorPalette`; `ring` shakes " +
          "an icon and `blink` pulses until removed. All of them stop under `prefers-reduced-motion`. " +
          "Remount the element (or re-add the style) to replay one.",
      },
    },
  },
});

const Sample = ({ name, children }: { name: string; children: ReactNode }) => (
  <Stack gap="1.5">
    <Text
      textStyle="xs"
      color="fg.muted"
    >
      {name}
    </Text>
    {children}
  </Stack>
);

export const AnimationStyles = meta.story({
  render: function AnimationStylesStory() {
    const [run, setRun] = useState(0);

    return (
      <Stack
        gap="6"
        alignItems="flex-start"
      >
        <Button
          size="sm"
          onClick={() => setRun((n) => n + 1)}
        >
          Replay
        </Button>
        <Grid
          key={run}
          columns={{ base: 1, sm: 3 }}
          gap="8"
        >
          <Sample name="fresh">
            <Box
              animationStyle="fresh"
              px="3"
              py="2"
              borderRadius="md"
            >
              Row just added
            </Box>
          </Sample>
          <Sample name="changed">
            <Box
              animationStyle="changed"
              px="3"
              py="1.5"
              borderWidth="1px"
              borderRadius="md"
            >
              Filter changed
            </Box>
          </Sample>
          <Sample name="flash (orange)">
            <Box
              animationStyle="flash"
              colorPalette="orange"
              px="3"
              py="2"
            >
              Cited cell
            </Box>
          </Sample>
          <Sample name="spot">
            <Box
              animationStyle="spot"
              py="2"
            >
              Deep-linked setting
            </Box>
          </Sample>
          <Sample name="ring">
            <Box
              as="span"
              display="inline-flex"
              animationStyle="ring"
            >
              <BellIcon />
            </Box>
          </Sample>
          <Sample name="blink">
            <HStack gap="1">
              <Box
                boxSize="1.5"
                borderRadius="full"
                bg="fg.subtle"
                animationStyle="blink"
              />
              <Box
                boxSize="1.5"
                borderRadius="full"
                bg="fg.subtle"
                animationStyle="blink"
                animationDelay="0.2s"
              />
              <Box
                boxSize="1.5"
                borderRadius="full"
                bg="fg.subtle"
                animationStyle="blink"
                animationDelay="0.4s"
              />
            </HStack>
          </Sample>
        </Grid>
      </Stack>
    );
  },
});
