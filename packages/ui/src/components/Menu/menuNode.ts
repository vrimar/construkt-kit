import type { KeyboardEvent } from "react";

import { isEditableTarget } from "../../foundations/dom";
import {
  CompositeList,
  Typeahead,
  elementList,
  getFirstEnabledIndex,
  getLastEnabledIndex,
  getNextIndex,
  isCrossOrientationCloseKey,
  isCrossOrientationOpenKey,
  isItemDisabled,
  scrollIntoViewIfNeeded,
} from "../../primitives/composite";
import {
  KEEP_FOCUS,
  RESTORE_FOCUS,
  type ReturnFocusIntent,
  closeFocusIntent,
  getTabbables,
} from "../../primitives/focus";
import type { OpenChangeReason } from "../../primitives/layer";
import type { Side } from "../../primitives/position";
import { Store } from "../../primitives/store";
import { type Point, type Polygon, getSubmenuGracePolygon, isPointInPolygon } from "./pointerGrace";

const SUBMENU_OPEN_DELAY = 200;
const SUBMENU_CLOSE_DELAY = 100;

export interface HighlightState {
  highlightedValue: string | null;
}

export const selectHighlighted = (state: HighlightState): string | null => state.highlightedValue;

export const selectIsHighlighted = (state: HighlightState, value: string): boolean =>
  state.highlightedValue === value;

type Edge = "first" | "last";

export interface MenuNodeProps {
  open: boolean;
  /** Asks the menu to open or close; returns whether the request stood. */
  setOpen: (open: boolean, reason: OpenChangeReason, event?: Event) => boolean;
  setReturnFocus: (intent: ReturnFocusIntent) => void;
  closeOnSelect: boolean;
  loopFocus: boolean;
  rtl: boolean;
  highlightControlled: boolean;
  onHighlightChange: ((value: string | null) => void) | undefined;
  onSelect: ((value: string) => void) | undefined;
}

export interface SelectOptions {
  closeOnSelect: boolean | undefined;
  /** Whether the root's `onSelect` hears about it. */
  notify: boolean;
  onSelect: (() => void) | undefined;
  /** Applies a checkbox or radio item's new state. */
  toggle: (() => void) | undefined;
}

const CLOSED: MenuNodeProps = {
  open: false,
  setOpen: () => false,
  setReturnFocus: () => {},
  closeOnSelect: true,
  loopFocus: false,
  rtl: false,
  highlightControlled: false,
  onHighlightChange: undefined,
  onSelect: undefined,
};

const isOwnFocus = (content: HTMLElement, active: Element | null) =>
  active === content ||
  (active !== null && content.contains(active) && active.closest("[role=menu]") === content);

function canTabWithin(content: HTMLElement, backward: boolean) {
  const tabbables = getTabbables(content);
  const active = content.ownerDocument.activeElement;
  if (tabbables.length === 0) return false;
  return backward ? active !== tabbables[0] : active !== tabbables.at(-1);
}

/**
 * One menu of a menu tree: its highlight, keyboard and typeahead handling, and the pointer rules
 * that open a submenu on hover and keep it open while the pointer crosses over to it.
 */
export class MenuNode {
  readonly store: Store<HighlightState>;
  readonly list = new CompositeList();
  readonly children = new Set<MenuNode>();
  readonly contextTriggers = new Set<HTMLElement>();
  private contentElement: HTMLElement | null = null;
  private originElement: HTMLElement | null = null;
  private side: Side = "bottom";

  private config = CLOSED;
  private pending: boolean | null = null;
  private readonly typeahead = new Typeahead();
  private pendingEdge: Edge | null = null;
  private routingLocked = false;
  private lastHighlighted: string | null = null;
  private grace: Polygon | null = null;
  private endTransit: (() => void) | null = null;
  private openTimer: ReturnType<typeof setTimeout> | undefined;
  private focusFrame = 0;

  constructor(
    readonly id: string,
    readonly parent: MenuNode | null,
    highlightedValue: string | null,
  ) {
    this.store = new Store<HighlightState>({ highlightedValue });
  }

  update(config: MenuNodeProps): void {
    this.config = config;
  }

  get props(): MenuNodeProps {
    return this.config;
  }

  get content(): HTMLElement | null {
    return this.contentElement;
  }

  setContent(element: HTMLElement | null): void {
    this.contentElement = element;
  }

  /** What had focus when the menu opened at a point, for focus to return to. */
  get origin(): HTMLElement | null {
    return this.originElement;
  }

  /** Remembers what has focus as the menu opens at a point, for focus to return to. */
  captureOrigin(doc: Document): void {
    const active = doc.activeElement;
    this.originElement = active instanceof HTMLElement && active !== doc.body ? active : null;
  }

  /** The side of its anchor the menu is placed on, which the pointer crosses to reach it. */
  setSide(side: Side): void {
    this.side = side;
  }

  get root(): MenuNode {
    return this.parent ? this.parent.root : this;
  }

  /** The value of this submenu's trigger item among its parent's items. */
  get triggerItemValue(): string {
    return `${this.id}:trigger`;
  }

  itemId(value: string): string {
    return `${this.id}:item:${value}`;
  }

  get highlighted(): string | null {
    return this.store.state.highlightedValue;
  }

  get typingAhead(): boolean {
    return this.typeahead.typing;
  }

  highlight(value: string | null, scroll = false): void {
    if (value !== this.highlighted) {
      this.config.onHighlightChange?.(value);
      if (!this.config.highlightControlled) this.store.set("highlightedValue", value);
    }
    if (scroll) scrollIntoViewIfNeeded(this.content, this.list.find(value)?.element ?? null);
  }

  move(target: "next" | "prev" | Edge): void {
    const items = this.list.items();
    const elements = elementList(items.map((item) => item.element));
    const current = items.findIndex((item) => item.value === this.highlighted);
    let index: number;
    if (target === "first") index = getFirstEnabledIndex(elements);
    else if (target === "last") index = getLastEnabledIndex(elements);
    else {
      index = getNextIndex(elements, current, {
        decrement: target === "prev",
        loop: this.config.loopFocus,
      });
    }
    const item = items[index];
    if (item) this.highlight(item.value, true);
  }

  private typeaheadKey(key: string) {
    const items = this.list.items();
    const labels = items.map(({ element, label }) =>
      isItemDisabled(element) ? null : (label ?? element.textContent ?? ""),
    );
    const current = items.findIndex((item) => item.value === this.highlighted);
    const item = items[this.typeahead.match(labels, key, current)];
    if (item) this.highlight(item.value, true);
  }

  /** What takes focus in the menu: its first field or other control, else the menu itself. */
  initialFocus(): HTMLElement | null {
    const { content } = this;
    if (!content) return null;
    const control = getTabbables(content).find(
      (element) =>
        element.closest("[role=menu]") === content &&
        !element.getAttribute("role")?.startsWith("menuitem"),
    );
    return control ?? content;
  }

  focusContent(): void {
    cancelAnimationFrame(this.focusFrame);
    this.focusFrame = requestAnimationFrame(() => {
      const { content } = this;
      if (!content || isOwnFocus(content, content.ownerDocument.activeElement)) return;
      this.initialFocus()?.focus({ preventScroll: true });
    });
  }

  private request(open: boolean, reason: OpenChangeReason, event?: Event) {
    if ((this.pending ?? this.config.open) === open) return false;
    if (!this.config.setOpen(open, reason, event)) return false;
    // Layers and focus moves can ask again in the same task, before the change commits.
    this.pending = open;
    queueMicrotask(() => {
      this.pending = null;
    });
    return true;
  }

  /** Opens the menu, highlighting its first or last item once they mount; an open menu just takes focus. */
  open(reason: OpenChangeReason, event?: Event, edge: Edge | null = null): boolean {
    if (this.config.open) {
      if (edge) this.move(edge);
      this.focusContent();
      return true;
    }
    this.pendingEdge = edge;
    return this.request(true, reason, event);
  }

  /** Applies the highlight `open` asked for, now that the items have mounted. */
  settleOpen(): void {
    const edge = this.pendingEdge;
    this.pendingEdge = null;
    if (edge) this.move(edge);
    this.parent?.suggestHighlight(this.triggerItemValue);
  }

  close(
    reason: OpenChangeReason,
    event?: Event,
    focus: ReturnFocusIntent = RESTORE_FOCUS,
  ): boolean {
    if (!this.request(false, reason, event)) return false;
    this.config.setReturnFocus(focus);
    return true;
  }

  closeTree(reason: OpenChangeReason, event?: Event, focus?: ReturnFocusIntent): boolean {
    return this.root.close(reason, event, focus);
  }

  /** Clears what an open menu tracks; called once it has closed. */
  reset(): void {
    cancelAnimationFrame(this.focusFrame);
    this.cancelHoverOpen();
    this.stopTransit();
    this.grace = null;
    this.pendingEdge = null;
    this.routingLocked = false;
    this.lastHighlighted = null;
    this.typeahead.reset();
    this.highlight(null);
  }

  dispose(): void {
    cancelAnimationFrame(this.focusFrame);
    this.cancelHoverOpen();
    this.stopTransit();
    this.typeahead.reset();
  }

  select(value: string, element: HTMLElement, event: MouseEvent, options: SelectOptions): void {
    if (isEditableTarget(element)) {
      this.highlight(value);
      return;
    }
    options.onSelect?.();
    if (options.notify) this.config.onSelect?.(value);
    options.toggle?.();
    if (options.closeOnSelect ?? this.config.closeOnSelect) {
      this.closeTree("item-press", event, closeFocusIntent(event));
    }
  }

  inContextTrigger(target: EventTarget | null): boolean {
    if (!(target instanceof Node)) return false;
    for (const element of this.contextTriggers) if (element.contains(target)) return true;
    return false;
  }

  hoverItem(value: string, point: Point, triggerItem: boolean): void {
    if (this.routingLocked) {
      this.lastHighlighted = value;
    } else {
      this.highlight(value);
      this.focusContent();
    }
    if (triggerItem) this.closeSiblings(value, point);
  }

  leaveItem(triggerItem: boolean): void {
    if (!this.routingLocked && !triggerItem) this.highlight(null);
  }

  private closeSiblings(value: string, point: Point) {
    for (const child of this.children) {
      if (child.triggerItemValue === value || !child.config.open) continue;
      if (child.grace && isPointInPolygon(child.grace, point)) continue;
      child.close("pointer-leave", undefined, KEEP_FOCUS);
      this.content?.focus({ preventScroll: true });
    }
  }

  private suggestHighlight(value: string) {
    if (this.highlighted == null) this.highlight(value);
    else this.lastHighlighted = value;
    this.routingLocked = false;
  }

  private restoreHighlight() {
    const last = this.lastHighlighted;
    this.lastHighlighted = null;
    if (last != null) this.highlight(last);
  }

  /** The pointer moved over this submenu's trigger item. */
  hoverTrigger(point: Point): void {
    if (this.config.open) {
      this.setGrace(point);
      return;
    }
    if (this.openTimer !== undefined) return;
    this.openTimer = setTimeout(() => {
      this.openTimer = undefined;
      this.open("trigger-hover");
    }, SUBMENU_OPEN_DELAY);
  }

  /** The pointer left this submenu's trigger item, perhaps on its way into the submenu. */
  leaveTrigger(point: Point): void {
    if (this.openTimer !== undefined) {
      this.cancelHoverOpen();
      return;
    }
    if (!this.config.open || !this.parent) return;
    this.setGrace(point);
    this.parent.routingLocked = true;
    this.startTransit();
  }

  /** The pointer entered this menu's content. */
  enterContent(): void {
    if (!this.endTransit) return;
    this.stopTransit();
    this.grace = null;
    this.focusContent();
    this.parent?.suggestHighlight(this.triggerItemValue);
  }

  private cancelHoverOpen() {
    clearTimeout(this.openTimer);
    this.openTimer = undefined;
  }

  private setGrace(point: Point) {
    this.grace = this.content
      ? getSubmenuGracePolygon(point, this.content.getBoundingClientRect(), this.side)
      : null;
  }

  private startTransit() {
    this.stopTransit();
    const doc = this.content?.ownerDocument ?? document;
    const onMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY };
      if (!this.grace || !isPointInPolygon(this.grace, point)) this.leaveSubmenu();
    };
    const timer = setTimeout(() => this.leaveSubmenu(), SUBMENU_CLOSE_DELAY);
    doc.addEventListener("pointermove", onMove);
    this.endTransit = () => {
      doc.removeEventListener("pointermove", onMove);
      clearTimeout(timer);
    };
  }

  private stopTransit() {
    if (!this.endTransit) return;
    this.endTransit();
    this.endTransit = null;
    if (this.parent) this.parent.routingLocked = false;
  }

  private leaveSubmenu() {
    this.stopTransit();
    this.close("pointer-leave");
    this.parent?.restoreHighlight();
  }

  private openHighlightedSubmenu(event: Event) {
    for (const child of this.children) {
      if (child.triggerItemValue !== this.highlighted) continue;
      child.open("list-navigation", event, "first");
      return true;
    }
    return false;
  }

  private clickHighlighted(event: KeyboardEvent<HTMLElement>) {
    const element = this.list.find(this.highlighted)?.element;
    if (!element || isItemDisabled(element)) return;
    const init: MouseEventInit = {
      bubbles: true,
      cancelable: true,
      composed: true,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
    };
    queueMicrotask(() => element.dispatchEvent(new MouseEvent("click", init)));
  }

  onContentKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented) return;
    const content = event.currentTarget;
    const target = event.target as HTMLElement;
    if (!content.contains(target)) return;
    if (target !== content && target.closest("[role=menu]") !== content) return;

    if (event.key === "Tab") {
      if (!canTabWithin(content, event.shiftKey)) event.preventDefault();
      return;
    }

    const { rtl } = this.config;
    const native = event.nativeEvent;
    const activate = () => {
      if (!this.openHighlightedSubmenu(native)) this.clickHighlighted(event);
    };
    let handled = true;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      this.move(event.key === "ArrowDown" ? "next" : "prev");
      this.focusContent();
    } else if (event.key === "Home" || event.key === "End") {
      this.move(event.key === "Home" ? "first" : "last");
      this.focusContent();
    } else if (isCrossOrientationOpenKey(event.key, rtl)) {
      this.openHighlightedSubmenu(native);
    } else if (isCrossOrientationCloseKey(event.key, rtl)) {
      if (this.parent) this.close("list-navigation", native);
    } else if (event.key === "Enter") {
      activate();
    } else if (event.key === " ") {
      if (this.typingAhead) this.typeaheadKey(" ");
      else activate();
    } else {
      handled = false;
    }

    if (handled) {
      event.stopPropagation();
      event.preventDefault();
      return;
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    if (isEditableTarget(target)) return;
    this.typeaheadKey(event.key);
    event.preventDefault();
  }
}
