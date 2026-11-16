import preview from "@construkt-kit/story-kit/preview";

import { card } from "#styled-system/recipes";

import { Card } from ".";
import { Button } from "../Buttons";
import { Wrap } from "../Layout";

const meta = preview.meta({
  title: "Components/Card",
  tags: ["autodocs"],
});

export const Default = meta.story({
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
});

export const Variants = meta.story({
  render: () => (
    <Wrap gap="4">
      {card.variantMap.variant.map((variant) => (
        <Card.Root
          key={variant}
          variant={variant}
          minW="200px"
        >
          <Card.Header>
            <Card.Title>{variant}</Card.Title>
          </Card.Header>
          <Card.Body>Card content</Card.Body>
        </Card.Root>
      ))}
    </Wrap>
  ),
});
