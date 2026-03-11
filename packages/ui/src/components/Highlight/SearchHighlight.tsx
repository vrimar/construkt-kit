import { Highlight } from "@chakra-ui/react";

export interface SearchHighlightProps {
  text: string;
  query: string;
}

export function SearchHighlight({ text, query }: SearchHighlightProps) {
  const words = query.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return text;
  }

  return (
    <Highlight
      query={words}
      ignoreCase
      matchAll
      styles={{ bg: "yellow.200" }}
    >
      {text}
    </Highlight>
  );
}
