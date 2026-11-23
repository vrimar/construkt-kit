import type { ReactNode } from "react";

import type { HTMLStyledProps } from "#styled-system/jsx";
import type { ListboxVariant } from "#styled-system/recipes";

import type { Unstyled } from "../../types";
import type { WithRender } from "../rootProps";
import type {
  SelectionGroupLabelRenderer,
  SelectionItemState,
  SelectionValue,
} from "../selection/types";

export type SelectionIndicatorPosition = NonNullable<ListboxVariant["indicatorPosition"]>;

export type ManagedItemProps = Partial<
  Unstyled<Omit<WithRender<HTMLStyledProps<"div">>, "children">>
>;

export interface ManagedListOptions<T, V extends SelectionValue> {
  loading?: boolean;
  emptyMessage?: ReactNode;
  /** Replaces the empty message's block, for an empty state with its own icon or actions. `emptyMessage` is still announced. */
  emptyState?: ReactNode;
  indicatorPosition?: SelectionIndicatorPosition;
  renderItem?: (item: T, state: SelectionItemState<V>) => ReactNode;
  /** Controls at the end of each row. A list with actions is a `grid` of rows rather than a `listbox`. */
  renderItemActions?: (item: T, state: SelectionItemState<V>) => ReactNode;
  /** Faint text at the end of the row, such as a count or why the item is disabled. */
  renderItemHint?: (item: T, state: SelectionItemState<V>) => ReactNode;
  renderGroupLabel?: SelectionGroupLabelRenderer<T>;
  getItemProps?: (item: T) => ManagedItemProps;
  /** Max height of the list: px if a number, otherwise a size token or CSS length. */
  listMaxHeight?: string | number;
  virtual?: boolean;
}
