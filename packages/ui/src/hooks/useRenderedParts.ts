import { useCallback, useLayoutEffect, useState } from "react";

/** The id each part renders, while it is mounted. */
export type RenderedParts<Part extends string> = Readonly<Partial<Record<Part, string>>>;

export type ReportRendered<Part extends string> = (part: Part, id: string | undefined) => void;

export function useRenderedParts<Part extends string>(): [
  RenderedParts<Part>,
  ReportRendered<Part>,
] {
  const [rendered, setRendered] = useState({} as RenderedParts<Part>);
  const report = useCallback((part: Part, id: string | undefined) => {
    setRendered((prev) => (prev[part] === id ? prev : { ...prev, [part]: id }));
  }, []);
  return [rendered, report];
}

/** Reports `part` rendered with `id` while the caller is mounted, and returns `id`. */
export function useReportRendered<Part extends string, Id extends string | undefined>(
  report: ReportRendered<Part> | undefined,
  part: Part,
  id: Id,
): Id {
  useLayoutEffect(() => {
    if (!report) return;
    report(part, id);
    return () => report(part, undefined);
  }, [report, part, id]);
  return id;
}
