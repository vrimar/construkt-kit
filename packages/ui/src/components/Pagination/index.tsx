import { clampValue } from "@construkt-kit/utils";
import { EllipsisIcon } from "lucide-react";
import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  Fragment,
  useLayoutEffect,
  useRef,
} from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pagination } from "#styled-system/recipes";

import { useControllableState } from "../../hooks/useControllableState";
import { type ChangeDetails, emitChange } from "../../primitives/change";
import { dataAttr, mergeProps, renderable } from "../../primitives/render";
import { createPartContext } from "../partContext";
import { type PaginationPage, getPageRange } from "./pageRange";

export type { PaginationPage };

const { withProvider, withContext } = createSlotRecipeContext(pagination);

const StyledRoot = withProvider(renderable.nav, "root");
const StyledItemButton = withContext(renderable.button, "item");
const StyledItemLink = withContext(renderable.a, "item");
const StyledEllipsis = withContext(renderable.div, "ellipsis");

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

const [PaginationContext, usePaginationContext] =
  createPartContext<PaginationContextValue>("<Pagination.Root>");

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
    const clamped = clampValue(next, 1, totalPages);
    if (clamped === page) return;
    if (emitChange(onValueChange, clamped, reason, event, { pageSize })) setPageState(clamped);
  };

  const previousPageSize = useRef(pageSize);
  useLayoutEffect(() => {
    if (previousPageSize.current === pageSize) return;
    previousPageSize.current = pageSize;
    if (page === 1 || (page >= 1 && page <= totalPages)) return;
    if (emitChange(onValueChange, 1, "page-size-change", undefined, { pageSize })) setPageState(1);
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
  const context = usePaginationContext("Pagination.Items");

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
  const context = usePaginationContext("Pagination.Item");
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
  return (
    <StyledItemButton
      {...mergeProps<ItemButtonProps>({ ...own, type: props.render ? undefined : "button" }, props)}
    />
  );
}

const TRIGGERS = {
  prev: {
    part: "Pagination.PrevTrigger",
    reason: "prev-press",
    step: -1,
    disabled: ({ page }: PaginationContextValue) => page === 1,
    labelKey: "prevTriggerLabel",
    label: "previous page",
    Button: withContext(renderable.button, "prevTrigger"),
    Link: withContext(renderable.a, "prevTrigger"),
  },
  next: {
    part: "Pagination.NextTrigger",
    reason: "next-press",
    step: 1,
    disabled: ({ page, totalPages }: PaginationContextValue) => page >= totalPages,
    labelKey: "nextTriggerLabel",
    label: "next page",
    Button: withContext(renderable.button, "nextTrigger"),
    Link: withContext(renderable.a, "nextTrigger"),
  },
} as const;

type TriggerButtonProps = ComponentProps<typeof TRIGGERS.prev.Button>;
type TriggerLinkProps = ComponentProps<typeof TRIGGERS.prev.Link>;

function triggerPart(trigger: (typeof TRIGGERS)[keyof typeof TRIGGERS]) {
  const { part, reason, step, labelKey, label, Button, Link } = trigger;
  return function Trigger(props: TriggerButtonProps) {
    const context = usePaginationContext(part);
    const target = context.page + step;
    const disabled = trigger.disabled(context);
    const own = {
      "data-disabled": dataAttr(disabled),
      "aria-label": context.translations?.[labelKey] ?? label,
      onClick(event: MouseEvent<HTMLElement>) {
        if (!disabled) context.setPage(target, reason, event.nativeEvent);
      },
    };

    if (context.type === "button") {
      return (
        <Button
          {...mergeProps<TriggerButtonProps>(
            { ...own, type: props.render ? undefined : "button", disabled },
            props,
          )}
        />
      );
    }
    const link = disabled
      ? { role: "link", "aria-disabled": true }
      : { href: context.getPageUrl?.({ page: target, pageSize: context.pageSize }) };
    return (
      <Link {...mergeProps<TriggerLinkProps>({ ...own, ...link }, props as TriggerLinkProps)} />
    );
  };
}

const PrevTrigger = triggerPart(TRIGGERS.prev);
const NextTrigger = triggerPart(TRIGGERS.next);

export const Pagination = {
  Root,
  Item,
  Items,
  Ellipsis: StyledEllipsis,
  PrevTrigger,
  NextTrigger,
};
