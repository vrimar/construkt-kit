import { EllipsisIcon } from "lucide-react";
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  Fragment,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pagination } from "#styled-system/recipes";

import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, createChangeDetails } from "../../primitives/change";
import { dataAttr, renderable } from "../../primitives/render";
import { mergeProps } from "../../primitives/render/mergeProps";
import { type PaginationPage, getPageRange } from "./pageRange";

export type { PaginationPage };

const { withProvider, withContext } = createSlotRecipeContext(pagination);

const StyledRoot = withProvider(renderable.nav, "root");
const StyledItemButton = withContext(renderable.button, "item");
const StyledItemLink = withContext(renderable.a, "item");
const StyledEllipsis = withContext(renderable.div, "ellipsis");
const StyledPrevButton = withContext(renderable.button, "prevTrigger");
const StyledPrevLink = withContext(renderable.a, "prevTrigger");
const StyledNextButton = withContext(renderable.button, "nextTrigger");
const StyledNextLink = withContext(renderable.a, "nextTrigger");

export type PaginationChangeReason =
  | "item-press"
  | "prev-press"
  | "next-press"
  | "page-size-change";

/** Why `onValueChange` was called, the page size, and a way to stay on the current page. */
export type PaginationValueChangeDetails = ChangeDetails<PaginationChangeReason> & {
  pageSize: number;
};

export interface PaginationTranslations {
  /** The `<nav>`'s `aria-label`. @default "pagination" */
  rootLabel?: string | undefined;
  /** @default "previous page" */
  prevTriggerLabel?: string | undefined;
  /** @default "next page" */
  nextTriggerLabel?: string | undefined;
  /** A page item's `aria-label`. @default "page N", or "last page, page N" */
  itemLabel?: ((details: { page: number; totalPages: number }) => string) | undefined;
}

const defaultItemLabel = ({ page, totalPages }: { page: number; totalPages: number }) =>
  `${totalPages > 1 && page === totalPages ? "last page, " : ""}page ${page}`;

interface PaginationContextValue {
  page: number;
  pageSize: number;
  totalPages: number;
  pages: PaginationPage[];
  type: "button" | "link";
  getPageUrl: ((details: { page: number; pageSize: number }) => string) | undefined;
  translations: PaginationTranslations | undefined;
  setPage: (page: number, reason: PaginationChangeReason, event?: Event) => void;
}

const PaginationContext = createContext<PaginationContextValue | null>(null);

function usePaginationContext(part: string): PaginationContextValue {
  const context = useContext(PaginationContext);
  if (!context) throw new Error(`Pagination.${part} must be placed inside <Pagination.Root>.`);
  return context;
}

type StyledRootProps = ComponentProps<typeof StyledRoot>;

export interface PaginationRootProps extends StyledRootProps {
  /** How many items there are to page through. @default 1 */
  count?: number | undefined;
  /** How many items a page holds. @default 10 */
  pageSize?: number | undefined;
  /** The current page, from 1. */
  value?: number | undefined;
  /** @default 1 */
  defaultValue?: number | undefined;
  /** Called with the page to move to; `details.cancel()` stays on the current one. */
  onValueChange?: ((page: number, details: PaginationValueChangeDetails) => void) | undefined;
  /** How many pages show on each side of the current one. @default 1 */
  siblingCount?: number | undefined;
  /** How many pages show at each end. @default 1 */
  boundaryCount?: number | undefined;
  /** Whether items and triggers are buttons or links to `getPageUrl`. @default "button" */
  type?: "button" | "link" | undefined;
  getPageUrl?: ((details: { page: number; pageSize: number }) => string) | undefined;
  translations?: PaginationTranslations | undefined;
}

function Root({
  count = 1,
  pageSize = 10,
  value,
  defaultValue = 1,
  onValueChange,
  siblingCount = 1,
  boundaryCount = 1,
  type = "button",
  getPageUrl,
  translations,
  ...props
}: PaginationRootProps) {
  const [page, setPageState] = useControllableState({ value, defaultValue });
  const totalPages = Math.ceil(count / pageSize);

  const setPage = (next: number, reason: PaginationChangeReason, event?: Event) => {
    const clamped = Math.min(Math.max(next, 1), totalPages);
    if (clamped === page) return;
    const details = Object.assign(createChangeDetails(reason, event), { pageSize });
    onValueChange?.(clamped, details);
    if (!details.canceled) setPageState(clamped);
  };

  const previousPageSize = useRef(pageSize);
  useLayoutEffect(() => {
    if (previousPageSize.current === pageSize) return;
    previousPageSize.current = pageSize;
    if (page === 1 || (page >= 1 && page <= totalPages)) return;
    const details = Object.assign(createChangeDetails("page-size-change"), { pageSize });
    onValueChange?.(1, details);
    if (!details.canceled) setPageState(1);
  });

  const context: PaginationContextValue = {
    page,
    pageSize,
    totalPages,
    pages: getPageRange({ page, totalPages, siblingCount, boundaryCount }),
    type,
    getPageUrl,
    translations,
    setPage,
  };

  return (
    <PaginationContext value={context}>
      <StyledRoot
        aria-label={translations?.rootLabel ?? "pagination"}
        {...props}
      />
    </PaginationContext>
  );
}

export interface PaginationItemsProps {
  render: (page: { type: "page"; value: number; selected: boolean }) => ReactNode;
  /** Content of each `Pagination.Ellipsis` between page runs. */
  ellipsis?: ReactNode;
}

function Items({ render, ellipsis = <EllipsisIcon /> }: PaginationItemsProps) {
  const context = usePaginationContext("Items");

  return context.pages.map((page, index) => {
    if (page.type === "ellipsis") {
      return <StyledEllipsis key={`ellipsis-${index}`}>{ellipsis}</StyledEllipsis>;
    }

    return (
      <Fragment key={`page-${page.value}`}>
        {render({ ...page, selected: context.page === page.value })}
      </Fragment>
    );
  });
}

type ItemButtonProps = ComponentProps<typeof StyledItemButton>;

export interface PaginationItemProps extends Omit<ItemButtonProps, "type" | "value"> {
  /** The page this item moves to. */
  value: number;
  type?: "page" | undefined;
}

function Item({ value, type: _type, ...props }: PaginationItemProps) {
  const context = usePaginationContext("Item");
  const selected = value === context.page;
  const link = context.type === "link";
  const own = {
    "data-index": value,
    "data-selected": dataAttr(selected),
    "aria-current": selected ? ("page" as const) : undefined,
    "aria-label": (context.translations?.itemLabel ?? defaultItemLabel)({
      page: value,
      totalPages: context.totalPages,
    }),
    onClick(event: MouseEvent<HTMLElement>) {
      context.setPage(value, "item-press", event.nativeEvent);
    },
  };

  if (link) {
    return (
      <StyledItemLink
        {...mergeProps<ComponentProps<typeof StyledItemLink>>(
          { ...own, href: context.getPageUrl?.({ page: value, pageSize: context.pageSize }) },
          props as ComponentProps<typeof StyledItemLink>,
        )}
      />
    );
  }
  return <StyledItemButton {...mergeProps<ItemButtonProps>({ ...own, type: "button" }, props)} />;
}

type TriggerButtonProps = ComponentProps<typeof StyledPrevButton>;

function useTriggerProps(direction: "prev" | "next") {
  const context = usePaginationContext(direction === "prev" ? "PrevTrigger" : "NextTrigger");
  const target = direction === "prev" ? context.page - 1 : context.page + 1;
  const disabled = direction === "prev" ? context.page === 1 : context.page >= context.totalPages;
  const label =
    direction === "prev"
      ? (context.translations?.prevTriggerLabel ?? "previous page")
      : (context.translations?.nextTriggerLabel ?? "next page");
  const own = {
    "data-disabled": dataAttr(disabled),
    "aria-label": label,
    onClick(event: MouseEvent<HTMLElement>) {
      if (disabled) return;
      context.setPage(
        target,
        direction === "prev" ? "prev-press" : "next-press",
        event.nativeEvent,
      );
    },
  };

  if (context.type === "button") {
    return { link: false, props: { ...own, type: "button" as const, disabled } };
  }
  if (disabled) {
    return { link: true, props: { ...own, role: "link", "aria-disabled": true } };
  }
  return {
    link: true,
    props: { ...own, href: context.getPageUrl?.({ page: target, pageSize: context.pageSize }) },
  };
}

function PrevTrigger(props: TriggerButtonProps) {
  const trigger = useTriggerProps("prev");
  if (trigger.link) {
    return (
      <StyledPrevLink
        {...mergeProps<ComponentProps<typeof StyledPrevLink>>(
          trigger.props,
          props as ComponentProps<typeof StyledPrevLink>,
        )}
      />
    );
  }
  return <StyledPrevButton {...mergeProps<TriggerButtonProps>(trigger.props, props)} />;
}

function NextTrigger(props: TriggerButtonProps) {
  const trigger = useTriggerProps("next");
  if (trigger.link) {
    return (
      <StyledNextLink
        {...mergeProps<ComponentProps<typeof StyledNextLink>>(
          trigger.props,
          props as ComponentProps<typeof StyledNextLink>,
        )}
      />
    );
  }
  return <StyledNextButton {...mergeProps<TriggerButtonProps>(trigger.props, props)} />;
}

export const Pagination = {
  Root,
  Item,
  Items,
  Ellipsis: StyledEllipsis,
  PrevTrigger,
  NextTrigger,
};
