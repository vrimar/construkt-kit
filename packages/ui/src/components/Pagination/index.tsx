import {
  Pagination as ArkPagination,
  PaginationContext,
  usePaginationContext,
} from "@ark-ui/react/pagination";
import { EllipsisIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { createStyleContext } from "@b3/styled-system/jsx";
import { pagination } from "@b3/styled-system/recipes";

import { IconButton } from "../Buttons/IconButton";

const { withProvider, withContext } = createStyleContext(pagination);

const Root = withProvider(ArkPagination.Root, "root");
const RootProvider = withProvider(ArkPagination.RootProvider, "root");
const Item = withContext(ArkPagination.Item, "item");
const Ellipsis = withContext(ArkPagination.Ellipsis, "ellipsis");
const PrevTrigger = withContext(ArkPagination.PrevTrigger, "prevTrigger");
const NextTrigger = withContext(ArkPagination.NextTrigger, "nextTrigger");

export interface PaginationItemsProps extends React.HTMLAttributes<HTMLElement> {
  render: (page: { type: "page"; value: number; selected: boolean }) => React.ReactNode;
  ellipsis?: React.ReactElement | undefined;
}

function Items(props: PaginationItemsProps) {
  const ctx = usePaginationContext();
  const { render, ellipsis, ...rest } = props;

  return ctx.pages.map((page, index) => {
    if (page.type === "ellipsis") {
      return (
        <Ellipsis
          asChild
          key={index}
          index={index}
          {...rest}
        >
          {ellipsis || (
            <IconButton
              variant="plain"
              size="sm"
            >
              <EllipsisIcon />
            </IconButton>
          )}
        </Ellipsis>
      );
    }

    return render({ ...page, selected: ctx.page === page.value });
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
