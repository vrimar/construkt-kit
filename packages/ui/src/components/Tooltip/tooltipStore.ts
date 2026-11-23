import type { ReactNode } from "react";

import { emitChange } from "../../primitives/change";
import type { OpenChangeReason, UseOpenStateOptions } from "../../primitives/layer";
import type { PlacementOption } from "../../primitives/position";
import { Store } from "../../primitives/store";

export const DEFAULT_OPEN_DELAY = 300;

const SKIP_DELAY_WINDOW = 300;

export interface TooltipStoreOptions extends Pick<UseOpenStateOptions, "onOpenChange"> {
  openDelay: number;
  closeDelay: number;
  /** The controlled open state, or `undefined` to keep it here. */
  open?: boolean | undefined;
}

/** What a trigger in a group shows in the group's popup. */
export interface TooltipEntry {
  label: ReactNode;
  placement: PlacementOption;
  shortcut: ReactNode;
  showArrow: boolean | undefined;
}

export interface TooltipState {
  /** The controlled open state, or else the store's own. */
  open: boolean;
  key: string | null;
  trigger: HTMLElement | null;
  /** What the trigger of `key` registered to show, for a group's popup. */
  entry: TooltipEntry | undefined;
}

const shown: { store: TooltipStore | null; hiddenAt: number } = {
  store: null,
  hiddenAt: Number.NEGATIVE_INFINITY,
};

/** Open state of one tooltip popup that one trigger, or a group's many, show and hide. */
export class TooltipStore extends Store<TooltipState> {
  private ownOpen: boolean;
  private readonly entries = new Map<string, TooltipEntry>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private options: TooltipStoreOptions;

  // A single-trigger store needs its trigger's `key` up front, or an initially open popup has no owner.
  constructor(
    options: TooltipStoreOptions,
    { defaultOpen = false, key = null }: { defaultOpen?: boolean; key?: string | null } = {},
  ) {
    super({ open: options.open ?? defaultOpen, key, trigger: null, entry: undefined });
    this.ownOpen = defaultOpen;
    this.options = options;
  }

  readonly isShown = (key: string): boolean => this.state.open && this.state.key === key;

  configure(options: TooltipStoreOptions): void {
    this.options = options;
    this.syncOpen();
  }

  /** Keeps what the trigger of `key` shows in a group's popup until the returned function runs. */
  register(key: string, entry: TooltipEntry): () => void {
    this.entries.set(key, entry);
    if (this.state.key === key) this.set("entry", entry);
    return () => {
      if (this.entries.get(key) !== entry) return;
      this.entries.delete(key);
      if (this.state.key === key) this.set("entry", undefined);
    };
  }

  show(key: string, trigger: HTMLElement, reason: OpenChangeReason, event?: Event): void {
    clearTimeout(this.timer);
    if (this.state.key !== key || this.state.trigger !== trigger) {
      this.setState({ ...this.state, key, trigger, entry: this.entries.get(key) });
    }
    if (!this.state.open) this.change(true, reason, event);
  }

  hide(key: string | null, reason: OpenChangeReason, event?: Event): void {
    clearTimeout(this.timer);
    if (!this.state.open || (key !== null && this.state.key !== key)) return;
    this.change(false, reason, event);
  }

  showAfterDelay(key: string, trigger: HTMLElement, event?: Event): void {
    clearTimeout(this.timer);
    if (this.isShown(key)) return;
    const recentlyHidden = Date.now() - shown.hiddenAt < SKIP_DELAY_WINDOW;
    if (shown.store !== null || this.state.open || recentlyHidden) {
      this.show(key, trigger, "trigger-hover", event);
      return;
    }
    this.timer = setTimeout(() => {
      if (trigger.isConnected) this.show(key, trigger, "trigger-hover", event);
    }, this.options.openDelay);
  }

  hideAfterDelay(key: string, event: Event): void {
    clearTimeout(this.timer);
    if (this.options.closeDelay <= 0) {
      this.hide(key, "pointer-leave", event);
      return;
    }
    this.timer = setTimeout(() => this.hide(key, "pointer-leave", event), this.options.closeDelay);
  }

  mount(): void {
    this.syncShown();
  }

  dispose(): void {
    clearTimeout(this.timer);
    if (shown.store === this) shown.store = null;
  }

  private change(open: boolean, reason: OpenChangeReason, event?: Event): void {
    if (!emitChange(this.options.onOpenChange, open, reason, event)) return;
    if (this.options.open !== undefined) return;
    this.ownOpen = open;
    this.syncOpen();
  }

  private syncOpen(): void {
    const open = this.options.open ?? this.ownOpen;
    if (open === this.state.open) return;
    this.set("open", open);
    this.syncShown();
  }

  private syncShown(): void {
    if (this.state.open) {
      if (shown.store === this) return;
      const previous = shown.store;
      shown.store = this;
      previous?.hide(null, "trigger-hover");
    } else if (shown.store === this) {
      shown.store = null;
      shown.hiddenAt = Date.now();
    }
  }
}
