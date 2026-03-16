import type { Meta, StoryObj } from "@storybook/react-vite";
import { Editable } from ".";
import { Button } from "../Buttons";

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
