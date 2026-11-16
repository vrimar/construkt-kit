import preview from "@construkt-kit/story-kit/preview";

import { Span } from ".";

const meta = preview.meta({
  title: "Components/Span",
  component: Span,
  tags: ["autodocs"],
  args: {
    children: "Inline text",
  },
});

export const Default = meta.story();

export const Styled = meta.story({
  render: () => (
    <p>
      This is a paragraph with a{" "}
      <Span
        color="brand.fg"
        fontWeight="bold"
      >
        highlighted span
      </Span>{" "}
      inside.
    </p>
  ),
});
