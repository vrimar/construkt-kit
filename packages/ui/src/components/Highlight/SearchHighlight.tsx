import { Fragment } from "react";

import { styled } from "#styled-system/jsx";

import { highlightWord } from "./highlightWord";

export interface SearchHighlightProps {
  text: string;
  query: string;
}

const Mark = styled("mark", { base: { bg: "highlight.bg", color: "highlight.fg" } });

export const SearchHighlight = ({ text, query }: SearchHighlightProps) => {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (words.length === 0) {
    return text;
  }

  return highlightWord({ text, query: words, ignoreCase: true, matchAll: true }).map((chunk, i) =>
    chunk.match ? <Mark key={i}>{chunk.text}</Mark> : <Fragment key={i}>{chunk.text}</Fragment>,
  );
};
