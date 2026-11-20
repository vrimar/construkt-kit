import { Menu, type MenuRootProps, useLatestRef } from "@construkt-kit/ui";
import {
  type ReactNode,
  type RefCallback,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GRID_CHANNELS, type MenuRequest } from "../core/grid";
import type { MenuEntry } from "../core/menu";
import { FOCUSABLE, cellSelector } from "./dom";
import { type AnyGridCore, useChannels } from "./useGridCore";

const MENU_CHANNELS = [GRID_CHANNELS.menu];

interface SharedMenuProps {
  core: AnyGridCore;
  scroller: HTMLElement | null;
}

export function SharedMenu({ core, scroller }: SharedMenuProps) {
  useChannels(core, MENU_CHANNELS);
  const request = core.menuRequest;
  const [shown, setShown] = useState(request);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const opener = useRef<Element | null>(null);
  if (request && request !== shown) {
    setShown(request);
    setHighlighted(request.fromKeyboard ? firstItemId(request.entries) : null);
  }
  useLayoutEffect(() => {
    if (request) opener.current = document.activeElement;
  }, [request]);
  const shownRef = useLatestRef(shown);
  const [contents] = useState(() => new Set<HTMLElement>());
  const trackContent = useCallback(
    (element: HTMLDivElement | null) => {
      if (!element) return;
      contents.add(element);
      return () => {
        contents.delete(element);
      };
    },
    [contents],
  );
  const inMenuOrLost = (element: Element | null) =>
    element === null ||
    element === document.body ||
    !element.isConnected ||
    [...contents].some((content) => content.contains(element));

  const anchorElement = (current: MenuRequest<ReactNode>): HTMLElement | null => {
    if (current.anchor instanceof HTMLElement && current.anchor.isConnected) return current.anchor;
    const { target } = current;
    if (target.kind === "header") {
      return (
        scroller?.querySelector<HTMLElement>(`[data-header-id="${CSS.escape(target.columnId)}"]`) ??
        null
      );
    }
    const position = core.positionOf(target);
    if (!position) return null;
    return (
      scroller?.querySelector<HTMLElement>(cellSelector(position.row, position.column)) ?? null
    );
  };

  const returnTarget = (current: MenuRequest<ReactNode>): HTMLElement | null => {
    const candidates = [current.anchor, opener.current];
    for (const candidate of candidates) {
      if (candidate instanceof HTMLElement && candidate.isConnected && isFocusable(candidate)) {
        return candidate;
      }
    }
    const active = core.activePosition();
    return active
      ? (scroller?.querySelector<HTMLElement>(cellSelector(active.row, active.column)) ?? null)
      : null;
  };

  const lastRect = useRef<DOMRect | null>(null);
  const measureAnchor = (): DOMRect => {
    const current = shownRef.current;
    const rect = current?.point
      ? new DOMRect(current.point.x, current.point.y, 0, 0)
      : current && anchorElement(current)?.getBoundingClientRect();
    if (rect) lastRect.current = rect;
    return lastRect.current ?? new DOMRect();
  };
  const measureAnchorRef = useLatestRef(measureAnchor);
  // A new request, even one that keeps the menu open, must move the menu to its anchor.
  const anchor = useMemo<MenuRootProps["anchor"]>(
    () => shown && { getBoundingClientRect: () => measureAnchorRef.current() },
    [shown, measureAnchorRef],
  );

  const onClose = () => {
    const current = shownRef.current;
    const restore = inMenuOrLost(document.activeElement);
    core.closeMenu();
    if (!current || !restore) return;
    // After the commit: an item's action may unmount the anchor or the active cell.
    setTimeout(() => {
      if (inMenuOrLost(document.activeElement))
        returnTarget(current)?.focus({ preventScroll: true });
    });
  };

  return (
    <Menu.Root
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      highlightedValue={highlighted}
      onHighlightChange={(highlightedValue) => setHighlighted(highlightedValue)}
      anchor={anchor}
    >
      <Menu.Content ref={trackContent}>
        {renderEntries(shown?.entries ?? [], trackContent)}
      </Menu.Content>
    </Menu.Root>
  );
}

const isFocusable = (element: HTMLElement) =>
  element.matches(FOCUSABLE) && !element.closest("[inert], [hidden]");

const firstItemId = (entries: readonly MenuEntry<ReactNode>[]): string | null => {
  const first = entries.find((entry) => entry.type !== "separator" && !entry.disabled);
  return first && first.type !== "separator" && !first.items ? first.id : null;
};

function renderEntries(
  entries: readonly MenuEntry<ReactNode>[],
  contentRef: RefCallback<HTMLDivElement>,
): ReactNode {
  return entries.map((entry, index) => {
    if (entry.type === "separator") return <Menu.Separator key={`separator-${index}`} />;
    if (entry.items) {
      return (
        <Menu.Root key={entry.id}>
          <Menu.TriggerItem icon={entry.icon}>{entry.label}</Menu.TriggerItem>
          <Menu.Content ref={contentRef}>{renderEntries(entry.items, contentRef)}</Menu.Content>
        </Menu.Root>
      );
    }
    return (
      <Menu.Item
        key={entry.id}
        value={entry.id}
        icon={entry.icon}
        hint={entry.hint}
        disabled={entry.disabled}
        destructive={entry.destructive}
        onSelect={entry.onSelect}
      >
        {entry.label}
      </Menu.Item>
    );
  });
}
