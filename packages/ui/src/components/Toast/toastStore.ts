import type { ReactNode } from "react";

export type ToastType = "success" | "error" | "loading" | "info" | "warning";

/** Where a toast is in its life: shown, animating out after a dismiss, or gone. */
export type ToastStatus = "visible" | "dismissing" | "unmounted";

/** Which queued toast shows first once a shown one leaves, 1 first. */
export type ToastPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface ToastAction {
  label: ReactNode;
  /** Runs before the toast dismisses itself. */
  onClick: () => void;
}

export interface ToastOptions {
  /** A toast with this id that is shown or queued is updated instead of added again. */
  id?: string | undefined;
  title?: ReactNode;
  description?: ReactNode;
  /** @default "info" */
  type?: ToastType | undefined;
  /**
   * How long the toast shows, in ms, while nothing pauses it; `Infinity` keeps it until dismissed.
   * @default 2000 for success, `Infinity` for loading, 5000 otherwise
   */
  duration?: number | undefined;
  /** @default by type, actionable toasts first: error, warning, loading, success, info */
  priority?: ToastPriority | undefined;
  /** Renders a close button. */
  closable?: boolean | undefined;
  /** Renders a button that runs `onClick` and dismisses the toast. */
  action?: ToastAction | undefined;
  /** Called when the toast shows, when it starts to leave and once it has left. */
  onStatusChange?: ((status: ToastStatus) => void) | undefined;
  meta?: Record<string, unknown> | undefined;
}

export interface Toast extends ToastOptions {
  id: string;
  type: ToastType;
}

type UntypedToastOptions = Omit<ToastOptions, "type">;
type SuccessToastOptions = UntypedToastOptions & { type?: "success" | "warning" | undefined };

export interface ToastPromiseOptions<T> {
  loading: UntypedToastOptions;
  /** The toast once the promise resolves; without it, the toast is removed. */
  success?: SuccessToastOptions | ((result: T) => SuccessToastOptions) | undefined;
  /** The toast once the promise rejects, or resolves to a `Response` that isn't `ok`. */
  error?: UntypedToastOptions | ((error: unknown) => UntypedToastOptions) | undefined;
  finally?: (() => void | Promise<void>) | undefined;
}

/** The kit's toast queue: shows up to five toasts at a time and queues the rest by priority. */
export interface ToastStore {
  /** Shows a toast, or updates the shown or queued one with the same `id`; returns its id. */
  create: (options: ToastOptions) => string;
  success: (options: UntypedToastOptions) => string;
  error: (options: UntypedToastOptions) => string;
  info: (options: UntypedToastOptions) => string;
  warning: (options: UntypedToastOptions) => string;
  loading: (options: UntypedToastOptions) => string;
  /**
   * Shows a loading toast until `promise` settles, then the `success` or `error` toast in its place.
   * `unwrap` resolves or rejects as the promise did.
   */
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
    shared?: UntypedToastOptions,
  ) => { id: string; unwrap: () => Promise<T> };
  /**
   * Updates a shown or queued toast; a function receives the toast as it is. Ignored once the
   * toast is leaving.
   */
  update: (id: string, options: ToastOptions | ((toast: Toast) => ToastOptions)) => string;
  /** Starts a toast leaving, or every toast without an id; a queued one is dropped. */
  dismiss: (id?: string) => void;
  /** Removes a toast at once, or every toast without an id. */
  remove: (id?: string) => void;
  /** Stops a toast's countdown, or every toast's without an id. */
  pause: (id?: string) => void;
  resume: (id?: string) => void;
  /** Spreads the stacked toasts out, as hovering them does. */
  expand: () => void;
  collapse: () => void;
  isVisible: (id: string) => boolean;
  isDismissed: (id: string) => boolean;
  getVisibleToasts: () => readonly Toast[];
  getCount: () => number;
}

export interface ToastEntry extends Toast {
  /** Tells a toast apart from an earlier one removed under the same `id`. */
  instance: number;
  priority: ToastPriority;
  paused: boolean;
  closing: boolean;
  promise?: unknown;
}

export interface ToastSnapshot {
  /** Shown toasts, newest first, including those leaving. */
  toasts: readonly ToastEntry[];
  expanded: boolean;
}

export interface ToastStoreInternal extends ToastStore {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ToastSnapshot;
}

const DURATIONS: Record<ToastType, number> = {
  info: 5000,
  error: 5000,
  success: 2000,
  loading: Infinity,
  warning: 5000,
};

export const getToastDuration = (toast: Toast): number => toast.duration ?? DURATIONS[toast.type];

const PRIORITIES: Record<ToastType, [actionable: ToastPriority, plain: ToastPriority]> = {
  error: [1, 2],
  warning: [3, 6],
  loading: [4, 5],
  success: [5, 7],
  info: [6, 8],
};

const isFailedResponse = (value: unknown): value is Response =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Response).ok === "boolean" &&
  typeof (value as Response).status === "number" &&
  !(value as Response).ok;

const resolve = <A, R>(option: R | ((arg: A) => R), arg: A): R =>
  typeof option === "function" ? (option as (arg: A) => R)(arg) : option;

export function createToastStore({ max }: { max: number }): ToastStoreInternal {
  let toasts: ToastEntry[] = [];
  let queue: ToastEntry[] = [];
  let paused = false;
  let nextId = 0;
  let nextInstance = 0;
  let snapshot: ToastSnapshot = { toasts, expanded: false };
  const dismissed = new Set<string>();
  const promiseTokens = new Map<string, symbol>();
  const listeners = new Set<() => void>();

  const commit = (expanded = snapshot.expanded) => {
    if (snapshot.toasts === toasts && snapshot.expanded === expanded) return;
    snapshot = { toasts, expanded };
    for (const listener of [...listeners]) listener();
  };

  const find = (id: string) =>
    toasts.find((toast) => toast.id === id) ?? queue.find((toast) => toast.id === id);

  const showQueued = (): ToastEntry[] => {
    const shown: ToastEntry[] = [];
    queue = [...queue].sort((a, b) => a.priority - b.priority);
    while (queue.length > 0 && toasts.length < max) {
      const [next, ...rest] = queue;
      const entry = { ...next, paused: paused || next.paused };
      queue = rest;
      toasts = [entry, ...toasts];
      shown.push(entry);
    }
    return shown;
  };

  const create = (options: ToastOptions & { promise?: unknown }): string => {
    const id = options.id ?? `toast:${++nextId}`;
    const existing = find(id);
    if (existing?.closing) return id;
    if ("promise" in options && options.promise !== existing?.promise) promiseTokens.delete(id);
    dismissed.delete(id);

    if (existing) {
      const next: ToastEntry = { ...existing, ...options, id, instance: existing.instance };
      if (toasts.includes(existing)) {
        toasts = toasts.map((toast) => (toast === existing ? next : toast));
        commit();
      } else {
        queue = queue.map((toast) => (toast === existing ? next : toast));
      }
      return id;
    }

    const type = options.type ?? "info";
    const entry: ToastEntry = {
      ...options,
      id,
      instance: ++nextInstance,
      type,
      priority: options.priority ?? PRIORITIES[type][options.action ? 0 : 1],
      paused,
      closing: false,
    };
    if (toasts.length >= max) {
      queue = [...queue, entry];
      return id;
    }
    toasts = [entry, ...toasts];
    commit();
    entry.onStatusChange?.("visible");
    return id;
  };

  const remove = (id?: string) => {
    const removed = [...toasts, ...queue].filter((toast) => id == null || toast.id === id);
    for (const toast of removed) {
      dismissed.add(toast.id);
      promiseTokens.delete(toast.id);
    }
    if (id != null) dismissed.add(id);
    toasts = toasts.filter((toast) => id != null && toast.id !== id);
    queue = queue.filter((toast) => id != null && toast.id !== id);
    const shown = showQueued();
    commit();
    for (const toast of removed) toast.onStatusChange?.("unmounted");
    for (const toast of shown) toast.onStatusChange?.("visible");
  };

  const dismiss = (id?: string) => {
    const dropped = queue.filter((toast) => id == null || toast.id === id);
    queue = queue.filter((toast) => id != null && toast.id !== id);
    for (const toast of dropped) {
      dismissed.add(toast.id);
      promiseTokens.delete(toast.id);
    }
    const leaving = toasts.filter((toast) => (id == null || toast.id === id) && !toast.closing);
    if (leaving.length === 0) return;
    toasts = toasts.map((toast) => (leaving.includes(toast) ? { ...toast, closing: true } : toast));
    commit();
    for (const toast of leaving) toast.onStatusChange?.("dismissing");
  };

  const setPaused = (value: boolean, id?: string) => {
    if (id == null) paused = value;
    const affects = (toast: ToastEntry) =>
      (id == null || toast.id === id) && !toast.closing && toast.paused !== value;
    queue = queue.map((toast) => (affects(toast) ? { ...toast, paused: value } : toast));
    if (toasts.some(affects)) {
      toasts = toasts.map((toast) => (affects(toast) ? { ...toast, paused: value } : toast));
      commit();
    }
  };

  const update: ToastStore["update"] = (id, options) => {
    if (find(id)?.closing) return id;
    if (typeof options !== "function") return create({ ...options, id });
    const existing = find(id);
    if (!existing) return id;
    const next = options({ ...existing });
    const current = find(id);
    if (!current || current.closing) return id;
    return create({ ...next, id });
  };

  function promise<T>(
    task: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
    shared: UntypedToastOptions = {},
  ) {
    const id = create({ ...shared, ...options.loading, promise: task, type: "loading" });
    const token = Symbol(id);
    const current = find(id);
    if (current?.promise === task && !current.closing) promiseTokens.set(id, token);
    const isCurrent = () => promiseTokens.get(id) === token && !find(id)?.closing;

    let removable = true;
    let outcome: { value: T } | { error: unknown } = { error: undefined };
    const settled = (typeof task === "function" ? task() : task)
      .then((value) => {
        outcome = { value };
        if (isFailedResponse(value)) {
          removable = false;
          const error = resolve(options.error, `HTTP Error! status: ${value.status}`);
          if (isCurrent()) create({ ...shared, ...error, id, type: "error" });
        } else if (options.success !== undefined) {
          removable = false;
          const success = resolve(options.success, value);
          if (isCurrent()) create({ ...shared, ...success, id, type: success.type ?? "success" });
        }
      })
      .catch((error: unknown) => {
        outcome = { error };
        if (options.error === undefined) return;
        removable = false;
        if (isCurrent()) create({ ...shared, ...resolve(options.error, error), id, type: "error" });
      })
      .finally(() => {
        if (removable && isCurrent()) remove(id);
        if (promiseTokens.get(id) === token) promiseTokens.delete(id);
        void options.finally?.();
      });

    const unwrap = () =>
      settled.then(() => {
        if ("error" in outcome) throw outcome.error;
        return outcome.value;
      });

    return { id, unwrap };
  }

  return {
    create,
    success: (options) => create({ ...options, type: "success" }),
    error: (options) => create({ ...options, type: "error" }),
    info: (options) => create({ ...options, type: "info" }),
    warning: (options) => create({ ...options, type: "warning" }),
    loading: (options) => create({ ...options, type: "loading" }),
    promise,
    update,
    dismiss,
    remove,
    pause: (id) => setPaused(true, id),
    resume: (id) => setPaused(false, id),
    expand: () => commit(true),
    collapse: () => commit(false),
    isVisible: (id) => !dismissed.has(id) && toasts.some((toast) => toast.id === id),
    isDismissed: (id) => dismissed.has(id),
    getVisibleToasts: () => toasts.filter((toast) => !dismissed.has(toast.id)),
    getCount: () => toasts.length,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
  };
}
