import { useEffect, useState } from "react";

export interface FrameQueue {
  request: (key: string, callback: () => void) => void;
  cancel: (key: string) => void;
}

export function useFrameQueue(): FrameQueue {
  const [frames] = useState(() => new Map<string, number>());
  const [queue] = useState<FrameQueue>(() => ({
    request(key, callback) {
      cancelAnimationFrame(frames.get(key) ?? 0);
      frames.set(
        key,
        requestAnimationFrame(() => {
          frames.delete(key);
          callback();
        }),
      );
    },
    cancel(key) {
      cancelAnimationFrame(frames.get(key) ?? 0);
      frames.delete(key);
    },
  }));
  useEffect(
    () => () => {
      for (const frame of frames.values()) cancelAnimationFrame(frame);
      frames.clear();
    },
    [frames],
  );
  return queue;
}
