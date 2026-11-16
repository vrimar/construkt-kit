export interface CellPosition {
  row: number;
  column: number;
}

export interface NavigationBounds {
  rowCount: number;
  columnCount: number;
  pageRows: number;
}

export const NAVIGATION_COMMANDS = [
  "moveUp",
  "moveDown",
  "moveLeft",
  "moveRight",
  "moveRowStart",
  "moveRowEnd",
  "moveColumnStart",
  "moveColumnEnd",
  "moveGridStart",
  "moveGridEnd",
  "movePageUp",
  "movePageDown",
  "moveNext",
  "movePrevious",
] as const;

export type NavigationCommand = (typeof NAVIGATION_COMMANDS)[number];

export const EXTEND_MOVES = {
  extendUp: "moveUp",
  extendDown: "moveDown",
  extendLeft: "moveLeft",
  extendRight: "moveRight",
  extendRowStart: "moveRowStart",
  extendRowEnd: "moveRowEnd",
  extendColumnStart: "moveColumnStart",
  extendColumnEnd: "moveColumnEnd",
  extendGridStart: "moveGridStart",
  extendGridEnd: "moveGridEnd",
  extendPageUp: "movePageUp",
  extendPageDown: "movePageDown",
} as const satisfies Record<string, NavigationCommand>;

export type ExtendCommand = keyof typeof EXTEND_MOVES;

export const EXTEND_COMMANDS = Object.keys(EXTEND_MOVES) as readonly ExtendCommand[];

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

export function navigate(
  command: NavigationCommand,
  { row, column }: CellPosition,
  { rowCount, columnCount, pageRows }: NavigationBounds,
): CellPosition | null {
  if (rowCount === 0 || columnCount === 0) return null;
  const lastRow = rowCount - 1;
  const lastColumn = columnCount - 1;
  const at = (r: number, c: number) => ({ row: clamp(r, lastRow), column: clamp(c, lastColumn) });

  switch (command) {
    case "moveUp":
      return at(row - 1, column);
    case "moveDown":
      return at(row + 1, column);
    case "moveLeft":
      return at(row, column - 1);
    case "moveRight":
      return at(row, column + 1);
    case "moveRowStart":
      return at(row, 0);
    case "moveRowEnd":
      return at(row, lastColumn);
    case "moveColumnStart":
      return at(0, column);
    case "moveColumnEnd":
      return at(lastRow, column);
    case "moveGridStart":
      return at(0, 0);
    case "moveGridEnd":
      return at(lastRow, lastColumn);
    case "movePageUp":
      return at(row - Math.max(1, pageRows), column);
    case "movePageDown":
      return at(row + Math.max(1, pageRows), column);
    case "moveNext":
      if (column < lastColumn) return at(row, column + 1);
      return row < lastRow ? at(row + 1, 0) : null;
    case "movePrevious":
      if (column > 0) return at(row, column - 1);
      return row > 0 ? at(row - 1, lastColumn) : null;
  }
}
