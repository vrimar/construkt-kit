const MAX_SCROLL_SIZE = 15_000_000;

export interface ScrollMapping {
  readonly scrollSize: number;
  readonly stretched: boolean;
  toContent(scroll: number): number;
  toScroll(content: number): number;
}

export function createScrollMapping(contentSize: number, viewportSize: number): ScrollMapping {
  if (contentSize <= MAX_SCROLL_SIZE || viewportSize >= MAX_SCROLL_SIZE) {
    return {
      scrollSize: contentSize,
      stretched: false,
      toContent: (scroll) => scroll,
      toScroll: (content) => content,
    };
  }
  const ratio = (contentSize - viewportSize) / (MAX_SCROLL_SIZE - viewportSize);
  return {
    scrollSize: MAX_SCROLL_SIZE,
    stretched: true,
    toContent: (scroll) => scroll * ratio,
    toScroll: (content) => content / ratio,
  };
}
