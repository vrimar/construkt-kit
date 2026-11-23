import { render } from "@testing-library/react";
import { expect, it } from "vitest";

import {
  type RenderedParts,
  type ReportRendered,
  useRenderedParts,
  useReportRendered,
} from "./useRenderedParts";

function Title({ id, report }: { id: string; report: ReportRendered<"title"> }) {
  useReportRendered(report, "title", id);
  return null;
}

it("holds the id a part renders while it is mounted", () => {
  const seen: RenderedParts<"title">[] = [];
  function Root({ titleId }: { titleId: string | null }) {
    const [rendered, report] = useRenderedParts<"title">();
    seen.push(rendered);
    return titleId === null ? null : (
      <Title
        id={titleId}
        report={report}
      />
    );
  }

  const { rerender } = render(<Root titleId="generated" />);
  expect(seen.at(-1)?.title).toBe("generated");

  rerender(<Root titleId="own" />);
  expect(seen.at(-1)?.title).toBe("own");

  rerender(<Root titleId={null} />);
  expect(seen.at(-1)?.title).toBeUndefined();
});
