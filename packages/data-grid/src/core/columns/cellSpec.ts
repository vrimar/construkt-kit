import type { CellContext, CellRenderContext, CellSpec } from "./types";

export function mergeCellSpecs<TRow, TNode>(
  ...specs: Array<CellSpec<TRow, TNode> | undefined>
): CellSpec<TRow, TNode> {
  const merged: Record<string, unknown> = {};
  for (const spec of specs) {
    if (!spec) continue;
    for (const [key, value] of Object.entries(spec)) if (value !== undefined) merged[key] = value;
  }
  return merged;
}

export function formatCellValue<TRow, TNode>(
  spec: CellSpec<TRow, TNode>,
  ctx: CellContext<TRow>,
): string {
  if (spec.format) return spec.format(ctx.value, ctx);
  const { value } = ctx;
  switch (typeof value) {
    case "string":
      return value;
    case "number":
    case "bigint":
    case "boolean":
      return String(value);
    case "object":
      if (value === null) return "";
      if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString();
      return JSON.stringify(value);
    default:
      return "";
  }
}

export function resolveTooltip<TRow, TNode>(
  spec: CellSpec<TRow, TNode>,
  ctx: CellRenderContext<TRow>,
): TNode | undefined {
  const { tooltip } = spec;
  return typeof tooltip === "function"
    ? (tooltip as (ctx: CellRenderContext<TRow>) => TNode)(ctx)
    : tooltip;
}
