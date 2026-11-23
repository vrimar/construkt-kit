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

type DetailsExtra<Details> = Omit<Details, keyof ChangeDetails<string>>;

/**
 * Calls `onChange` with `next` and fresh details, adding `extra`'s fields to them, and returns
 * whether the change stands: `false` once the handler calls `details.cancel()`.
 */
export function emitChange<Value, Details extends ChangeDetails<string>>(
  onChange: ((value: Value, details: Details) => void) | undefined,
  next: Value,
  reason: Details["reason"],
  event?: Event,
  ...[extra]: {} extends DetailsExtra<Details>
    ? [extra?: DetailsExtra<Details>]
    : [extra: DetailsExtra<Details>]
): boolean {
  const details = Object.assign(createChangeDetails(reason, event), extra) as Details;
  onChange?.(next, details);
  return !details.canceled;
}
