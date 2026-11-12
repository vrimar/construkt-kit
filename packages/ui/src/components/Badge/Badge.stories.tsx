import type { Meta, StoryObj } from "@storybook/react-vite";
import { BellIcon, CircleCheckIcon, SparklesIcon, StarIcon, TriangleAlertIcon } from "lucide-react";

import { badge } from "#styled-system/recipes";

import { Badge } from ".";
import { SizePreviewTable } from "../../_shared/SizePreviewTable";
import { IconButton } from "../Buttons";
import { Float, HStack, Stack, Wrap } from "../Layout";
import { Text } from "../Text";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <Wrap gap="2">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="surface">Surface</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="plain">Plain</Badge>
    </Wrap>
  ),
};

export const Sizes: Story = {
  render: () => (
    <SizePreviewTable
      sizes={badge.variantMap.size.filter((size) => size !== "dot")}
      renderPreview={(size) => <Badge size={size}>{size}</Badge>}
    />
  ),
};

export const PlainStatus: Story = {
  render: () => (
    <Stack gap="2">
      <Badge
        variant="plain"
        colorPalette="warning"
      >
        <TriangleAlertIcon />
        Needs review
      </Badge>
      <Badge
        variant="plain"
        colorPalette="success"
      >
        <CircleCheckIcon />
        In use
      </Badge>
      <Badge variant="plain">
        <SparklesIcon />
        Ready
      </Badge>
      <Badge
        variant="plain"
        colorPalette="yellow"
      >
        <StarIcon />
        Starred
      </Badge>
    </Stack>
  ),
};

export const Dot: Story = {
  render: () => (
    <Stack
      gap="3"
      alignItems="flex-start"
    >
      <HStack gap="2">
        <Badge
          size="dot"
          variant="solid"
        />
        <Text textStyle="sm">New data is ready</Text>
      </HStack>
      <HStack gap="2">
        <Badge
          size="dot"
          variant="solid"
          colorPalette="danger"
        />
        <Text textStyle="sm">Export failed</Text>
      </HStack>
      <IconButton
        variant="outline"
        aria-label="Notifications, unread"
        icon={
          <>
            <BellIcon />
            <Float
              placement="top-end"
              offset="2"
            >
              <Badge
                size="dot"
                variant="solid"
                colorPalette="danger"
              />
            </Float>
          </>
        }
      />
    </Stack>
  ),
};

export const CountOnIconButton: Story = {
  render: () => (
    <IconButton
      variant="outline"
      aria-label="Notifications, 3 unread"
      icon={
        <>
          <BellIcon />
          <Float placement="top-end">
            <Badge
              size="xs"
              variant="solid"
              colorPalette="danger"
              borderRadius="full"
              minW="4"
              justifyContent="center"
            >
              3
            </Badge>
          </Float>
        </>
      }
    />
  ),
};
