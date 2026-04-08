import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from ".";
import { Button } from "../Buttons";
import { Wrap } from "../Layout";

const meta: Meta = {
  title: "Components/Card",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Card.Root maxW="sm">
      <Card.Header>
        <Card.Title>Card Title</Card.Title>
        <Card.Description>Card description goes here.</Card.Description>
      </Card.Header>
      <Card.Body>This is the card body content. You can put any content here.</Card.Body>
      <Card.Footer>
        <Button variant="outline">Cancel</Button>
        <Button>Submit</Button>
      </Card.Footer>
    </Card.Root>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Wrap gap="4">
      {(["Compact", "Default", "Spacious"] as const).map((label) => (
        <Card.Root
          key={label}
          minW="200px"
        >
          <Card.Header>
            <Card.Title>{label}</Card.Title>
          </Card.Header>
          <Card.Body>Card content</Card.Body>
        </Card.Root>
      ))}
    </Wrap>
  ),
};
