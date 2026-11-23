export interface HighlightChunk {
  text: string;
  /** Whether the text matches the query. */
  match: boolean;
}

export interface UseHighlightProps {
  /** The text to split into chunks. */
  text: string;
  /** The text, or several texts, to find in it. */
  query: string | string[];
  ignoreCase?: boolean | undefined;
  /** Finds every match instead of the first. Defaults to whether `query` is an array, which requires it. */
  matchAll?: boolean | undefined;
  /** Matches whole words only. */
  exactMatch?: boolean | undefined;
}

interface Span {
  start: number;
  end: number;
  match?: boolean;
}

// `-` is written as `\x2d` because `\-` is a syntax error in regexes with the `u` flag.
const escapeRegex = (term: string): string =>
  term.replace(/[|\\{}()[\]^$+*?.]/g, (char) => `\\${char}`).replace(/-/g, "\\x2d");

// `\b` only knows ASCII word characters.
const WORD_CHAR = "[\\p{L}\\p{M}\\p{N}_]";

const wholeWord = (pattern: string): string => `(?<!${WORD_CHAR})(${pattern})(?!${WORD_CHAR})`;

function normalizeSpans(spans: Span[], length: number): Span[] {
  const result: Span[] = [];
  const append = (start: number, end: number, match: boolean) => {
    if (end - start > 0) result.push({ start, end, match });
  };
  let lastIndex = 0;
  for (const span of spans) {
    append(lastIndex, span.start, false);
    append(span.start, span.end, true);
    lastIndex = span.end;
  }
  append(lastIndex, length, false);
  return result;
}

const toChunks = (text: string, spans: Span[]): HighlightChunk[] =>
  normalizeSpans(spans, text.length).map((span) => ({
    text: text.slice(span.start, span.end),
    match: !!span.match,
  }));

function toRegex({ query, ignoreCase, exactMatch }: UseHighlightProps, global: boolean) {
  const terms = (Array.isArray(query) ? query : [query]).filter(Boolean);
  if (terms.length === 0) return null;
  const pattern = terms.map(escapeRegex).join("|");
  const flags = `${ignoreCase ? "i" : ""}${global ? "g" : ""}u`;
  return new RegExp(exactMatch ? wholeWord(pattern) : `(${pattern})`, flags);
}

/** Splits `text` into the chunks that match `query` and the ones between them. */
export function highlightWord(props: UseHighlightProps): HighlightChunk[] {
  const matchAll = props.matchAll ?? Array.isArray(props.query);
  if (!matchAll && Array.isArray(props.query)) {
    throw new Error("matchAll must be true when using multiple queries");
  }
  const { text } = props;
  const regex = toRegex(props, matchAll);
  if (!regex) return [{ text, match: false }];
  const matches = matchAll ? [...text.matchAll(regex)] : [regex.exec(text)];
  const spans = matches.flatMap((match) =>
    match ? [{ start: match.index, end: match.index + match[0].length }] : [],
  );
  return toChunks(text, spans);
}

/** The chunks of `text` that match `query` and the ones between them, for rendering highlights. */
export const useHighlight = (props: UseHighlightProps): HighlightChunk[] => highlightWord(props);
