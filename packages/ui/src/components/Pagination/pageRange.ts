export type PaginationPage = { type: "page"; value: number } | { type: "ellipsis" };

interface PageRangeOptions {
  page: number;
  totalPages: number;
  siblingCount: number;
  boundaryCount: number;
}

const ELLIPSIS = "ellipsis";

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => index + start);

function getRange({ page, totalPages, siblingCount, boundaryCount }: PageRangeOptions) {
  if (totalPages <= 0) return [];
  if (totalPages === 1) return [1];

  const firstPageIndex = 1;
  const lastPageIndex = totalPages;
  const leftSiblingIndex = Math.max(page - siblingCount, firstPageIndex);
  const rightSiblingIndex = Math.min(page + siblingCount, lastPageIndex);
  const totalPageNumbers = Math.min(siblingCount * 2 + 3 + boundaryCount * 2, totalPages);

  if (totalPages <= totalPageNumbers) return range(firstPageIndex, lastPageIndex);

  const itemCount = totalPageNumbers - 1 - boundaryCount;
  const showLeftEllipsis =
    leftSiblingIndex > firstPageIndex + boundaryCount + 1 &&
    Math.abs(leftSiblingIndex - firstPageIndex) > boundaryCount + 1;
  const showRightEllipsis =
    rightSiblingIndex < lastPageIndex - boundaryCount - 1 &&
    Math.abs(lastPageIndex - rightSiblingIndex) > boundaryCount + 1;

  const pages: (number | typeof ELLIPSIS)[] = [];
  if (!showLeftEllipsis && showRightEllipsis) {
    pages.push(...range(1, itemCount), ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else if (showLeftEllipsis && !showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1), ELLIPSIS);
    pages.push(...range(lastPageIndex - itemCount + 1, lastPageIndex));
  } else if (showLeftEllipsis && showRightEllipsis) {
    pages.push(...range(firstPageIndex, firstPageIndex + boundaryCount - 1), ELLIPSIS);
    pages.push(...range(leftSiblingIndex, rightSiblingIndex), ELLIPSIS);
    pages.push(...range(lastPageIndex - boundaryCount + 1, lastPageIndex));
  } else {
    pages.push(...range(firstPageIndex, lastPageIndex));
  }

  for (let index = 0; index < pages.length; index++) {
    if (pages[index] !== ELLIPSIS) continue;
    const before = pages[index - 1];
    const after = pages[index + 1];
    const prevPage = typeof before === "number" ? before : 0;
    const nextPage = typeof after === "number" ? after : totalPages + 1;
    if (nextPage - prevPage === 2) pages[index] = prevPage + 1;
  }

  return pages;
}

export const getPageRange = (options: PageRangeOptions): PaginationPage[] =>
  getRange(options).map((value) =>
    typeof value === "number" ? { type: "page", value } : { type: "ellipsis" },
  );
