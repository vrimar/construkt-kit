import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SegmentGroup, useSegmentGroup } from ".";

describe("SegmentGroup", () => {
  it("orients a RootProvider like Root", () => {
    const Provided = () => (
      <SegmentGroup.RootProvider
        value={useSegmentGroup()}
        data-testid="provided"
      />
    );
    render(
      <>
        <SegmentGroup.Root data-testid="root" />
        <Provided />
      </>,
    );

    expect(screen.getByTestId("provided").dataset.orientation).toBe(
      screen.getByTestId("root").dataset.orientation,
    );
  });
});
