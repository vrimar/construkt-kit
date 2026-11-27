import { Fragment } from "react";

import { styled } from "#styled-system/jsx";

import { highlightWord } from "./highlightWord";

export interface SearchHighlightProps {
  text: string;
  query: string;
  /** Marks a query word only where it stands as a whole word. */
  wholeWords?: boolean | undefined;
}

const Mark = styled("mark", { base: { bg: "highlight.bg", color: "highlight.fg" } });

export const SearchHighlight = ({ text, query, wholeWords = false }: SearchHighlightProps) => {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (words.length === 0) {
    return text;
  }

  return highlightWord({
    text,
    query: words,
    ignoreCase: true,
    matchAll: true,
    exactMatch: wholeWords,
  }).map((chunk, i) =>
    chunk.match ? <Mark key={i}>{chunk.text}</Mark> : <Fragment key={i}>{chunk.text}</Fragment>,
  );
};
