import { GRID_CHANNELS } from "../core/grid";
import type { DataGridOwnProps } from "./types";
import { type AnyGridCore, useChannels } from "./useGridCore";

const STATUS_CHANNELS = [GRID_CHANNELS.selection];

interface StatusBarProps {
  core: AnyGridCore;
  className: string;
  render: DataGridOwnProps<unknown>["statusBar"];
}

export function StatusBar({ core, className, render }: StatusBarProps) {
  useChannels(core, STATUS_CHANNELS);
  const shown =
    typeof render === "function"
      ? render({ ...core.selection.details, stats: core.selection.stats() })
      : render;
  if (shown == null || shown === false) return null;
  return <div className={className}>{shown}</div>;
}
