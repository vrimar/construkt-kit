import { type ColumnModel, headerText } from "../columns/columnModel";
import type { CellRenderContext, CellSpec } from "../columns/types";
import type { RowModel } from "../rows/rowModel";
import type { RowId } from "../rows/rowNode";
import type { CellPosition } from "../selection/navigation";
import type { CellAddress, GridTarget } from "../selection/types";
import type { Channels } from "../store/channels";

export const EDITING_CHANNEL = "editing";

export interface EditState {
  target: GridTarget;
  text: string;
}

export interface CellChange<TRow> {
  rowId: RowId;
  columnId: string;
  row: TRow;
  /** The typed text, through the cell's `parse` when it has one. */
  value: unknown;
  previousValue: unknown;
}

export interface HeaderRename {
  columnId: string;
  name: string;
}

export interface EditingOptions<TRow> {
  /** Called with the cells an edit commits; the grid keeps showing `rows` until they change. */
  onCellsChange?: (changes: readonly CellChange<TRow>[]) => void;
  /** Called when a header rename commits with a different name. */
  onHeaderRename?: (rename: HeaderRename) => void;
}

export const EDITING_OPTION_KEYS = {
  onCellsChange: true,
  onHeaderRename: true,
} as const satisfies Record<keyof EditingOptions<unknown>, true>;

export interface EditingHost<TRow, TNode> {
  readonly channels: Channels;
  readonly rowModel: RowModel<TRow>;
  readonly columns: ColumnModel<TRow, TNode>;
  activePosition(): CellPosition | null;
  setActiveCell(position: CellPosition): void;
  positionOf(address: CellAddress): CellPosition | null;
  addressOf(position: CellPosition): CellAddress | null;
  resolveCell(
    row: number,
    column: number,
  ): { spec: CellSpec<TRow, TNode>; ctx: CellRenderContext<TRow> };
}

export class GridEditing<TRow, TNode> {
  private current: EditState | null = null;

  constructor(
    private readonly host: EditingHost<TRow, TNode>,
    private readonly options: () => EditingOptions<TRow>,
  ) {}

  get state(): EditState | null {
    return this.current;
  }

  canEditCell({ row, column }: CellPosition): boolean {
    if (row < 0 || row >= this.host.rowModel.rowCount) return false;
    if (column < 0 || column >= this.host.columns.leaves.length) return false;
    if (this.host.rowModel.kindOf(row) === "fullWidth") return false;
    return this.host.resolveCell(row, column).spec.editable === true;
  }

  editingColumn(rowId: RowId): number {
    const target = this.current?.target;
    if (target?.kind !== "cell" || target.rowId !== rowId) return -1;
    return this.host.columns.indexOf(target.columnId);
  }

  isRenaming(columnId: string): boolean {
    const target = this.current?.target;
    return target?.kind === "header" && target.columnId === columnId;
  }

  startCell(position: CellPosition): boolean {
    const address = this.host.addressOf(position);
    if (!address || !this.canEditCell(position)) return false;
    const { ctx } = this.host.resolveCell(position.row, position.column);
    this.host.channels.batch(() => {
      this.host.setActiveCell(position);
      this.open({ target: { kind: "cell", ...address }, text: ctx.formattedValue });
    });
    return true;
  }

  startHeader(columnId: string): boolean {
    const cell = this.host.columns.headerCell(columnId);
    if (!cell?.def.headerEditable) return false;
    this.host.channels.batch(() => {
      const row = this.host.activePosition()?.row ?? 0;
      if (this.host.rowModel.rowCount > 0) this.host.setActiveCell({ row, column: cell.first });
      this.open({ target: { kind: "header", columnId }, text: headerText(cell.def) });
    });
    return true;
  }

  commit(text: string): void {
    const state = this.current;
    if (!state) return;
    this.close();
    if (text === state.text) return;
    const { target } = state;
    if (target.kind === "header") {
      this.options().onHeaderRename?.({ columnId: target.columnId, name: text });
      return;
    }
    const position = this.host.positionOf(target);
    if (!position) return;
    const { spec, ctx } = this.host.resolveCell(position.row, position.column);
    const value = spec.parse ? spec.parse(text, ctx) : text;
    this.options().onCellsChange?.([
      {
        rowId: target.rowId,
        columnId: target.columnId,
        row: ctx.row,
        value,
        previousValue: ctx.value,
      },
    ]);
  }

  cancel(): void {
    if (this.current) this.close();
  }

  dropIfGone(): void {
    const target = this.current?.target;
    if (!target) return;
    const gone =
      target.kind === "cell"
        ? this.host.positionOf(target) === null
        : !this.host.columns.headerCell(target.columnId);
    if (gone) this.close();
  }

  private open(state: EditState) {
    this.current = state;
    this.host.channels.notify(EDITING_CHANNEL);
  }

  private close() {
    this.current = null;
    this.host.channels.notify(EDITING_CHANNEL);
  }
}
