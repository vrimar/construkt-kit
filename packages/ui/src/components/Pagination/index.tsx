import {
  Pagination as ArkPagination,
  PaginationContext,
  usePaginationContext,
} from "@ark-ui/react/pagination";
import { EllipsisIcon } from "lucide-react";
import { type ComponentProps, Fragment } from "react";

import { createSlotRecipeContext } from "#styled-system/jsx";
import { pagination } from "#styled-system/recipes";

const { withProvider, withContext } = createSlotRecipeContext(pagination);

const Root = withProvider(ArkPagination.Root, "root", { forwardProps: ["page"] });
const RootProvider = withProvider(ArkPagination.RootProvider, "root");
const Item = withContext(ArkPagination.Item, "item");
const Ellipsis = withContext(ArkPagination.Ellipsis, "ellipsis");
const PrevTrigger = withContext(ArkPagination.PrevTrigger, "prevTrigger");
const NextTrigger = withContext(ArkPagination.NextTrigger, "nextTrigger");

export interface PaginationItemsProps {
  render: (page: { type: "page"; value: number; selected: boolean }) => React.ReactNode;
  /** Content of each `Pagination.Ellipsis` between page runs. */
  ellipsis?: React.ReactNode;
}

function Items({ render, ellipsis = <EllipsisIcon /> }: PaginationItemsProps) {
  const ctx = usePaginationContext();

  return ctx.pages.map((page, index) => {
    if (page.type === "ellipsis") {
      return (
        <Ellipsis
          key={`ellipsis-${index}`}
          index={index}
        >
          {ellipsis}
        </Ellipsis>
      );
    }

    return (
      <Fragment key={`page-${page.value}`}>
        {render({ ...page, selected: ctx.page === page.value })}
      </Fragment>
    );
  });
}

export type PaginationRootProps = ComponentProps<typeof Root>;

export const Pagination = {
  Root,
  RootProvider,
  Item,
  Items,
  Ellipsis,
  PrevTrigger,
  NextTrigger,
  Context: PaginationContext,
};

export {
  type UsePaginationProps,
  type UsePaginationReturn,
  usePagination,
} from "@ark-ui/react/pagination";
