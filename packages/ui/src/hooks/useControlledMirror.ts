import { useState } from "react";

export interface ControlledMirrorOptions<T> {
  /** The controlled value from the parent. */
  value: T;
  onValueChange: (value: T) => unknown;
  /** Runs during render whenever the parent supplies a value that is not an echo of `emit`. */
  onExternalChange: (value: T) => void;
  isSame?: (a: T, b: T) => boolean;
}

export interface ControlledMirror<T> {
  /** The value last emitted, or last supplied by the parent other than as an echo. */
  applied: T;
  /** Sends a value to the parent. */
  emit: (next: T) => void;
}

/**
 * Mirrors a controlled value into local state without letting the parent's echo of an
 * emission overwrite edits made after that emission.
 */
export function useControlledMirror<T>({
  value,
  onValueChange,
  onExternalChange,
  isSame = Object.is,
}: ControlledMirrorOptions<T>): ControlledMirror<T> {
  const [syncedValue, setSyncedValue] = useState(value);
  const [applied, setApplied] = useState(value);
  const [pendingEchoes, setPendingEchoes] = useState<T[]>([]);

  if (!isSame(value, syncedValue)) {
    setSyncedValue(value);
    const echoIndex = pendingEchoes.findIndex((pending) => isSame(pending, value));
    if (echoIndex === -1) {
      if (pendingEchoes.length > 0) setPendingEchoes([]);
      setApplied(value);
      onExternalChange(value);
    } else {
      setPendingEchoes(pendingEchoes.slice(echoIndex + 1));
    }
  }

  const emit = (next: T) => {
    setApplied(next);
    setPendingEchoes((pending) => [...pending, next]);
    onValueChange(next);
  };

  return { applied, emit };
}
