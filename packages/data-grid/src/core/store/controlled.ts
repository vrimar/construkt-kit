export class ControlledValue<T> {
  private owned: T | undefined;
  private internal: T;
  private requested: { value: T } | null = null;

  constructor(initial: T) {
    this.internal = initial;
  }

  /** The owner's value; `undefined` leaves the value internal. */
  get controlled(): T | undefined {
    return this.owned;
  }

  set controlled(value: T | undefined) {
    this.owned = value;
    this.requested = null;
  }

  get value(): T {
    return this.owned === undefined ? this.internal : this.owned;
  }

  /** What `set` last asked for that the owner hasn't passed back yet, else `value`. */
  get latest(): T {
    return this.requested ? this.requested.value : this.value;
  }

  set(next: T): void {
    if (this.owned === undefined) this.internal = next;
    else this.requested = { value: next };
  }
}
