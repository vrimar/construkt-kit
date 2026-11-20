/** Why a component asked to change a piece of its state, and a way to refuse. */
export interface ChangeDetails<Reason extends string> {
  reason: Reason;
  event: Event | undefined;
  /** Keeps the state as it is. */
  cancel: () => void;
  readonly canceled: boolean;
}

export function createChangeDetails<Reason extends string>(
  reason: Reason,
  event?: Event,
): ChangeDetails<Reason> {
  let canceled = false;
  return {
    reason,
    event,
    cancel: () => {
      canceled = true;
    },
    get canceled() {
      return canceled;
    },
  };
}
