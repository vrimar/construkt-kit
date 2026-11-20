import { useCallback, useSyncExternalStore } from "react";

import type { Store } from "./Store";

/**
 * The slice of `store` that `selector` picks, re-rendering only when it changes by `Object.is`, so
 * a selector must return a primitive or a reference the state already holds.
 */
export function useStore<State, Value>(
  store: Store<State>,
  selector: (state: State) => Value,
): Value;
export function useStore<State, Value, Arg>(
  store: Store<State>,
  selector: (state: State, arg: Arg) => Value,
  arg: Arg,
): Value;
export function useStore<State, Value, Arg>(
  store: Store<State>,
  selector: (state: State, arg?: Arg) => Value,
  arg?: Arg,
): Value {
  const getSelection = useCallback(
    () => selector(store.getSnapshot(), arg),
    [store, selector, arg],
  );
  return useSyncExternalStore(store.subscribe, getSelection, getSelection);
}
