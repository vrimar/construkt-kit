import preview from "@construkt-kit/story-kit/preview";

import { SearchHighlight } from ".";

const meta = preview.meta({
  title: "Components/Highlight",
  component: SearchHighlight,
  tags: ["autodocs"],
  args: {
    text: "The quick brown fox jumps over the lazy dog",
    query: "quick fox",
  },
});

export const Default = meta.story();

export const NoMatch = meta.story({
  args: {
    text: "Hello world",
    query: "xyz",
  },
});

export const MultipleMatches = meta.story({
  args: {
    text: "React is a JavaScript library for building user interfaces. React makes it easy.",
    query: "React",
  },
});
