import { Highlight } from "@ark-ui/react/highlight";
import { token } from "@b3/styled-system/tokens";

export interface SearchHighlightProps {
  text: string;
  query: string;
}

export const SearchHighlight = ({ text, query }: SearchHighlightProps) => {
  const words = query.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return text;
  }

  return (
    <Highlight
      text={text}
      query={words}
      ignoreCase
      matchAll
      style={{ background: token("colors.yellow.100") }}
    />
  );
};
