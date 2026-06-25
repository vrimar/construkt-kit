import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { Button } from "../components/Buttons";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";
import { Input } from "../components/Input";
import { HStack, Stack } from "../components/Layout";
import { Slider } from "../components/Slider";
import { Spinner } from "../components/Spinner";
import { Switch } from "../components/Switch";
import { Text } from "../components/Text";

interface DensityArgs {
  baseHeight: number;
  basePx: number;
  baseFont: number;
  surfaceScale: number;
  visualScale: number;
}

// CSS custom properties aren't in @types/react's CSSProperties; cast to set the knobs inline.
const knobs = (a: Partial<DensityArgs>): CSSProperties =>
  ({
    ...(a.baseHeight != null && { "--control-base-h": `${a.baseHeight}px` }),
    ...(a.basePx != null && { "--control-base-px": `${a.basePx}px` }),
    ...(a.baseFont != null && { "--control-base-font": `${a.baseFont}px` }),
    ...(a.surfaceScale != null && { "--surface-scale": `${a.surfaceScale}` }),
    ...(a.visualScale != null && { "--visual-scale": `${a.visualScale}` }),
  }) as CSSProperties;

const meta: Meta<DensityArgs> = {
  title: "Foundations/Control density",
  parameters: {
    docs: {
      description: {
        component:
          "The whole component surface scales from a few CSS-variable knobs, grouped in three " +
          "families. **Control** lengths (`--control-base-h` 36px, `--control-base-px` 12px, " +
          "`--control-base-font` 14px, …) drive form-control geometry & text on a grid-aligned " +
          "base+offset ladder. **`--surface-scale`** multiplies container/overlay padding. " +
          "**`--visual-scale`** multiplies graphical element sizes (slider thumb, spinner, …). " +
          "Override any knob on `:root` or any container to rescale everything inside it at " +
          "runtime — no rebuild. Each knob is independent: `--control-base-h` alone still works.",
      },
    },
  },
  argTypes: {
    baseHeight: {
      control: { type: "range", min: 24, max: 56, step: 2 },
      description: "--control-base-h (px) — control heights",
    },
    basePx: {
      control: { type: "range", min: 4, max: 24, step: 1 },
      description: "--control-base-px (px) — control horizontal padding",
    },
    baseFont: {
      control: { type: "range", min: 10, max: 22, step: 1 },
      description: "--control-base-font (px) — control text",
    },
    surfaceScale: {
      control: { type: "range", min: 0.5, max: 2, step: 0.1 },
      description: "--surface-scale — container/overlay padding multiplier",
    },
    visualScale: {
      control: { type: "range", min: 0.5, max: 2, step: 0.1 },
      description: "--visual-scale — graphical element multiplier",
    },
  },
  args: { baseHeight: 36, basePx: 12, baseFont: 14, surfaceScale: 1, visualScale: 1 },
};

export default meta;
type Story = StoryObj<typeof meta>;

const Controls = () => (
  <Stack
    gap="3"
    w="64"
  >
    <HStack gap="2">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
    </HStack>
    <Input placeholder="Search…" />
    <Checkbox defaultChecked>Enable feature</Checkbox>
    <Switch defaultChecked>Notifications</Switch>
  </Stack>
);

// One sample from each knob family, so an override visibly rescales all three together.
const Showcase = () => (
  <Stack
    direction={{ base: "column", md: "row" }}
    gap="8"
    alignItems="flex-start"
  >
    <Stack gap="2">
      <Text textStyle="sm">Control</Text>
      <Controls />
    </Stack>
    <Stack gap="2">
      <Text textStyle="sm">Surface</Text>
      <Card.Root w="64">
        <Card.Header>
          <Card.Title>Density</Card.Title>
          <Card.Description>Padding follows --surface-scale.</Card.Description>
        </Card.Header>
        <Card.Body>Resize the surface knob to see padding grow.</Card.Body>
        <Card.Footer>
          <Button variant="outline">Dismiss</Button>
        </Card.Footer>
      </Card.Root>
    </Stack>
    <Stack gap="2">
      <Text textStyle="sm">Visual</Text>
      <Stack
        gap="4"
        w="48"
      >
        <Slider defaultValue={[50]} />
        <HStack gap="4">
          <Spinner size="md" />
          <Spinner size="xl" />
        </HStack>
      </Stack>
    </Stack>
  </Stack>
);

// Drive all five knobs at once; the wrapping container scopes them.
export const RuntimeKnobs: Story = {
  render: (args) => (
    <div style={knobs(args)}>
      <Showcase />
    </div>
  ),
};

// Proves a single knob still works on its own: only --control-base-h is set here.
export const HeightOnly: Story = {
  render: ({ baseHeight }) => (
    <div style={knobs({ baseHeight })}>
      <Controls />
    </div>
  ),
};

// A nested scope override rescales controls, surface padding, and graphical controls together,
// independent of the page-level defaults around it.
export const NestedScope: Story = {
  render: () => (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap="10"
      alignItems="flex-start"
    >
      <Stack gap="2">
        <Text>Default</Text>
        <Showcase />
      </Stack>
      <Stack gap="2">
        <Text>Nested — denser controls, roomier surface, larger visuals</Text>
        <div
          style={knobs({
            baseHeight: 30,
            basePx: 8,
            baseFont: 12,
            surfaceScale: 1.5,
            visualScale: 1.5,
          })}
        >
          <Showcase />
        </div>
      </Stack>
    </Stack>
  ),
};

export const Comparison: Story = {
  render: () => (
    <Stack
      direction={{ base: "column", md: "row" }}
      gap="10"
      alignItems="flex-start"
    >
      <Stack gap="2">
        <Text>Compact — 32px</Text>
        <div style={knobs({ baseHeight: 32 })}>
          <Controls />
        </div>
      </Stack>
      <Stack gap="2">
        <Text>Default — 36px</Text>
        <Controls />
      </Stack>
      <Stack gap="2">
        <Text>Comfortable — 44px</Text>
        <div style={knobs({ baseHeight: 44 })}>
          <Controls />
        </div>
      </Stack>
    </Stack>
  ),
};
