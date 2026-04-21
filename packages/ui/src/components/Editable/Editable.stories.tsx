import type { Meta, StoryObj } from "@storybook/react-vite";

import { Editable } from ".";
import { Button } from "../Buttons";
import { VStack } from "../Layout";

const meta: Meta = {
  title: "Components/Editable",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Editable.Root
      defaultValue="Click to edit"
      activationMode="click"
    >
      <Editable.Label>Name</Editable.Label>
      <Editable.Area>
        <Editable.Input />
        <Editable.Preview />
      </Editable.Area>
      <Editable.Control>
        <Editable.EditTrigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            Edit
          </Button>
        </Editable.EditTrigger>
        <Editable.CancelTrigger asChild>
          <Button
            variant="outline"
            size="sm"
          >
            Cancel
          </Button>
        </Editable.CancelTrigger>
        <Editable.SubmitTrigger asChild>
          <Button size="sm">Save</Button>
        </Editable.SubmitTrigger>
      </Editable.Control>
    </Editable.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <VStack
      gap="4"
      p="4"
      maxW="400px"
    >
      {(["2xs", "xs", "sm", "md", "lg"] as const).map((size) => (
        <Editable.Root
          key={size}
          defaultValue={`Editable value (${size})`}
          size={size}
        >
          <Editable.Label>{size}</Editable.Label>
          <Editable.Area>
            <Editable.Input />
            <Editable.Preview />
          </Editable.Area>
        </Editable.Root>
      ))}
    </VStack>
  ),
};
