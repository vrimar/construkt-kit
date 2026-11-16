type Listener = () => void;

export const SHARED_CHANNELS = { rows: "rows", cells: "cells", geometry: "geometry" } as const;

export class Channels {
  private readonly listeners = new Map<string, Set<Listener>>();
  private readonly versions = new Map<string, number>();
  private pending: Set<string> | null = null;
  private muted = 0;

  subscribe(channel: string, listener: Listener): () => void {
    let set = this.listeners.get(channel);
    if (!set) {
      set = new Set();
      this.listeners.set(channel, set);
    }
    set.add(listener);
    return () => {
      set.delete(listener);
    };
  }

  version(channel: string): number {
    return this.versions.get(channel) ?? 0;
  }

  notify(channel: string): void {
    this.versions.set(channel, this.version(channel) + 1);
    if (this.muted > 0) return;
    if (this.pending) this.pending.add(channel);
    else this.emit(channel);
  }

  batch<T>(fn: () => T): T {
    if (this.pending) return fn();
    this.pending = new Set();
    try {
      return fn();
    } finally {
      const channels = this.pending;
      this.pending = null;
      for (const channel of channels) this.emit(channel);
    }
  }

  silently<T>(fn: () => T): T {
    this.muted++;
    try {
      return fn();
    } finally {
      this.muted--;
    }
  }

  private emit(channel: string) {
    const set = this.listeners.get(channel);
    if (!set) return;
    for (const listener of [...set]) listener();
  }
}
