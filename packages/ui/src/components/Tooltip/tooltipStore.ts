import {
  type OpenChangeDetails,
  type OpenChangeReason,
  createOpenChangeDetails,
} from "../../primitives/layer";

export const DEFAULT_OPEN_DELAY = 300;

const SKIP_DELAY_WINDOW = 300;

export interface TooltipStoreOptions {
  openDelay: number;
  closeDelay: number;
  onOpenChange?: ((open: boolean, details: OpenChangeDetails) => void) | undefined;
  /** The controlled open state, or `undefined` to keep it here. */
  open?: boolean | undefined;
}

interface TooltipState {
  open: boolean;
  key: string | null;
  trigger: HTMLElement | null;
}

const shown: { store: TooltipStore | null; hiddenAt: number } = {
  store: null,
  hiddenAt: Number.NEGATIVE_INFINITY,
};

/** Open state of one tooltip popup that one trigger, or a group's many, show and hide. */
export class TooltipStore {
  private state: TooltipState;
  private readonly listeners = new Set<() => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private options: TooltipStoreOptions;

  // A single-trigger store needs its trigger's `key` up front, or an initially open popup has no owner.
  constructor(
    options: TooltipStoreOptions,
    { defaultOpen = false, key = null }: { defaultOpen?: boolean; key?: string | null } = {},
  ) {
    this.options = options;
    this.state = { open: defaultOpen, key, trigger: null };
  }

  readonly subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  get open(): boolean {
    return this.options.open ?? this.state.open;
  }

  get key(): string | null {
    return this.state.key;
  }

  get trigger(): HTMLElement | null {
    return this.state.trigger;
  }

  readonly isShown = (key: string): boolean => this.open && this.state.key === key;

  configure(options: TooltipStoreOptions): void {
    const changed = options.open !== this.options.open;
    this.options = options;
    if (!changed) return;
    this.emit();
    this.syncShown();
  }

  show(key: string, trigger: HTMLElement, reason: OpenChangeReason, event?: Event): void {
    clearTimeout(this.timer);
    if (this.state.key !== key || this.state.trigger !== trigger) {
      this.state = { ...this.state, key, trigger };
      this.emit();
    }
    if (!this.open) this.change(true, reason, event);
  }

  hide(key: string | null, reason: OpenChangeReason, event?: Event): void {
    clearTimeout(this.timer);
    if (!this.open || (key !== null && this.state.key !== key)) return;
    this.change(false, reason, event);
  }

  showAfterDelay(key: string, trigger: HTMLElement, event: Event): void {
    clearTimeout(this.timer);
    if (this.isShown(key)) return;
    const recentlyHidden = Date.now() - shown.hiddenAt < SKIP_DELAY_WINDOW;
    if (shown.store !== null || this.open || recentlyHidden) {
      this.show(key, trigger, "trigger-hover", event);
      return;
    }
    this.timer = setTimeout(
      () => this.show(key, trigger, "trigger-hover", event),
      this.options.openDelay,
    );
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
    const details = createOpenChangeDetails(reason, event);
    this.options.onOpenChange?.(open, details);
    if (details.canceled || this.options.open !== undefined) return;
    this.state = { ...this.state, open };
    this.emit();
    this.syncShown();
  }

  private syncShown(): void {
    if (this.open) {
      if (shown.store === this) return;
      const previous = shown.store;
      shown.store = this;
      previous?.hide(null, "trigger-hover");
    } else if (shown.store === this) {
      shown.store = null;
      shown.hiddenAt = Date.now();
    }
  }

  private emit() {
    for (const listener of [...this.listeners]) listener();
  }
}
