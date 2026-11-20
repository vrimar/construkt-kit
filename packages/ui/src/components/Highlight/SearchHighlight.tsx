import { Fragment } from "react";

import { token } from "#styled-system/tokens";

import { highlightWord } from "./highlightWord";

export interface SearchHighlightProps {
  text: string;
  query: string;
}

const markStyle = { background: token("colors.highlight.bg"), color: token("colors.highlight.fg") };

export const SearchHighlight = ({ text, query }: SearchHighlightProps) => {
  const words = query
    .split(/\s+/)
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (words.length === 0) {
    return text;
  }

  return highlightWord({ text, query: words, ignoreCase: true, matchAll: true }).map((chunk, i) =>
    chunk.match ? (
      <mark
        key={i}
        style={markStyle}
      >
        {chunk.text}
      </mark>
    ) : (
      <Fragment key={i}>{chunk.text}</Fragment>
    ),
  );
};
