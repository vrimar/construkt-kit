import { useTable } from "@tanstack/react-table";
import { Columns3Icon } from "lucide-react";
import { Fragment, type ReactElement, useMemo } from "react";

import { Button } from "../Buttons";
import { Menu } from "../Menu";
import { getColumnLabel } from "./Header/columnLabel";
import { resolveLabels } from "./labels";
import {
  type DataTableColumn,
  type DataTableColumnDef,
  type DataTableColumnVisibility,
  type DataTableLabels,
  dataTableFeatures,
} from "./types";

export interface DataTableColumnPickerProps<TData extends object> {
  /** The table's `columnDefs`. Columns with `meta.isVisible: false` or `enableHiding: false` aren't listed. */
  columnDefs: DataTableColumnDef<TData, any>[];
  /** The table's `columnVisibility`. */
  columnVisibility: DataTableColumnVisibility;
  onColumnVisibilityChange: (columnVisibility: DataTableColumnVisibility) => unknown;
  labels?: Pick<DataTableLabels, "columns" | "showAllColumns">;
  /** Trigger in place of the default "Columns" button; it must accept a ref and props. */
  children?: ReactElement;
}

interface ColumnGroup<TData extends object> {
  parent: DataTableColumn<TData> | undefined;
  columns: DataTableColumn<TData>[];
}

const NO_ROWS: never[] = [];

/**
 * Menu that shows and hides a `DataTable`'s columns. Pass it the table's `columnDefs` and the same
 * `columnVisibility` state as the table. The last visible column it lists can't be hidden.
 */
export const DataTableColumnPicker = <TData extends object>({
  columnDefs,
  columnVisibility,
  onColumnVisibilityChange,
  labels,
  children,
}: DataTableColumnPickerProps<TData>) => {
  const { columns: triggerLabel, showAllColumns } = resolveLabels(labels);
  const listedColumns = useMemo(
    () => columnDefs.filter((column) => column.meta?.isVisible !== false),
    [columnDefs],
  );
  const table = useTable({
    features: dataTableFeatures,
    columns: listedColumns,
    data: NO_ROWS,
    state: { columnVisibility },
  });

  const leaves = table.getAllLeafColumns().filter((column) => column.getCanHide());
  const visibleCount = leaves.filter((column) => column.getIsVisible()).length;
  const groups = leaves.reduce<ColumnGroup<TData>[]>((acc, column) => {
    const last = acc.at(-1);
    if (last && last.parent === column.parent) last.columns.push(column);
    else acc.push({ parent: column.parent, columns: [column] });
    return acc;
  }, []);

  const renderItem = (column: DataTableColumn<TData>) => {
    const visible = column.getIsVisible();
    return (
      <Menu.CheckboxItem
        key={column.id}
        value={column.id}
        checked={visible}
        disabled={visible && visibleCount === 1}
        onCheckedChange={(checked) =>
          onColumnVisibilityChange({ ...columnVisibility, [column.id]: checked })
        }
      >
        {getColumnLabel({ column })}
      </Menu.CheckboxItem>
    );
  };

  return (
    <Menu.Root closeOnSelect={false}>
      <Menu.Trigger asChild>
        {children ?? (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Columns3Icon />}
          >
            {triggerLabel}
          </Button>
        )}
      </Menu.Trigger>
      <Menu.Content>
        {groups.map(({ parent, columns }) =>
          parent ? (
            <Menu.ItemGroup
              key={parent.id}
              label={getColumnLabel({ column: parent })}
            >
              {columns.map(renderItem)}
            </Menu.ItemGroup>
          ) : (
            <Fragment key={columns[0].id}>{columns.map(renderItem)}</Fragment>
          ),
        )}
        <Menu.Separator />
        <Menu.Item
          value="show-all-columns"
          disabled={visibleCount === leaves.length}
          onSelect={() => onColumnVisibilityChange({})}
        >
          {showAllColumns}
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  );
};
