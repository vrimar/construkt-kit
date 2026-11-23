import { useEffect, useRef, useState } from "react";

import { isMacPlatform } from "../../foundations/platform";
import { useAnnouncer } from "../../hooks/useAnnouncer";
import { useLatestRef } from "../../hooks/useLatestRef";
import { useStore } from "../store";
import { type ListEntry, type ListboxNode, selectSuggesting } from "./listboxNode";

const RESULTS_DELAY = 1000;

export interface AnnouncerProps {
  node: ListboxNode;
  entries: readonly ListEntry[];
  inputValue: string;
  loading: boolean;
  isSelected: (value: string) => boolean;
}

const resultsMessage = (loading: boolean, count: number) => {
  if (loading) return "Loading results";
  if (count === 0) return "No results";
  return count === 1 ? "1 result" : `${count} results`;
};

export function Announcer({ node, entries, inputValue, loading, isSelected }: AnnouncerProps) {
  const suggesting = useStore(node.store, selectSuggesting);
  const { liveRegion: highlightRegion, announce: announceHighlight } = useAnnouncer({
    politeness: "assertive",
  });
  const {
    liveRegion: resultsRegion,
    announce: announceResults,
    cancel: cancelResults,
  } = useAnnouncer();
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
    if (!isMacPlatform()) return;
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
