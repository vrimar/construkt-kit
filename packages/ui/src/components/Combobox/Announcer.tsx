import { useEffect, useRef, useState } from "react";

import { useLatestRef } from "../../hooks/useLatestRef";
import { useLiveRegion } from "../../hooks/useLiveRegion";
import type { ListEntry, ListboxNode } from "../Listbox/listboxNode";

const isApple = () => /mac|iphone|ipad|ipod/i.test(navigator.platform);

const RESULTS_DELAY = 1000;

export interface AnnouncerProps {
  node: ListboxNode;
  entries: readonly ListEntry[];
  inputValue: string;
  loading: boolean;
  suggesting: boolean;
  isSelected: (value: string) => boolean;
}

const resultsMessage = (loading: boolean, count: number) => {
  if (loading) return "Loading results";
  if (count === 0) return "No results";
  return count === 1 ? "1 result" : `${count} results`;
};

export function Announcer({
  node,
  entries,
  inputValue,
  loading,
  suggesting,
  isSelected,
}: AnnouncerProps) {
  const [highlightRegion, announceHighlight] = useLiveRegion("assertive");
  const [resultsRegion, announceResults, cancelResults] = useLiveRegion("polite");
  const latest = useLatestRef({ entries, isSelected });
  const resultsKey = `${loading}:${inputValue}:${entries.map((entry) => entry.value).join(",")}`;
  const [mountedKey] = useState(resultsKey);
  const announced = useRef(false);

  useEffect(() => {
    if (resultsKey === mountedKey && !announced.current) return;
    announced.current = true;
    announceResults(resultsMessage(loading, entries.length), RESULTS_DELAY);
  }, [resultsKey, mountedKey, loading, entries.length, announceResults]);

  useEffect(() => {
    if (!suggesting) cancelResults();
  }, [suggesting, cancelResults]);

  useEffect(() => {
    if (!isApple()) return;
    let previous = node.store.state.highlightedValue;
    return node.store.subscribe(({ highlightedValue }) => {
      if (highlightedValue === previous) return;
      previous = highlightedValue;
      const entry = latest.current.entries.find(
        (candidate) => candidate.value === highlightedValue,
      );
      if (!entry) return;
      announceHighlight(
        latest.current.isSelected(entry.value) ? `${entry.label}, selected` : entry.label,
      );
    });
  }, [node, latest, announceHighlight]);

  return (
    <>
      {highlightRegion}
      {resultsRegion}
    </>
  );
}
