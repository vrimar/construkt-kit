import preview from "@construkt-kit/story-kit/preview";

import { Link } from ".";
import { HStack } from "../Layout";

const meta = preview.meta({
  title: "Components/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    children: "Click me",
    href: "#",
  },
});

export const Default = meta.story();

export const Variants = meta.story({
  render: () => (
    <HStack gap="4">
      <Link
        href="#"
        variant="underline"
      >
        Underline
      </Link>
      <Link
        href="#"
        variant="plain"
      >
        Plain
      </Link>
    </HStack>
  ),
});
