type Listener<State> = (state: State) => void;

/** State held outside React that components read through `useStore`, each subscribing to a slice. */
export class Store<State> {
  state: State;

  private readonly listeners = new Set<Listener<State>>();
  private updateTick = 0;

  constructor(state: State) {
    this.state = state;
  }

  subscribe = (listener: Listener<State>): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): State => this.state;

  setState(next: State): void {
    if (this.state === next) return;
    this.state = next;
    this.updateTick += 1;
    const tick = this.updateTick;
    for (const listener of this.listeners) {
      // A listener that set the state again has already notified everyone of the newer state.
      if (tick !== this.updateTick) return;
      listener(next);
    }
  }

  set<Key extends keyof State>(key: Key, value: State[Key]): void {
    if (!Object.is(this.state[key], value)) this.setState({ ...this.state, [key]: value });
  }
}
