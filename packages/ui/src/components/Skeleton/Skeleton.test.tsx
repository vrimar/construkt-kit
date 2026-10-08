import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonText } from ".";

const classesOf = (element: Element | null) => element?.className.split(" ") ?? [];

describe("SkeletonText", () => {
  it("applies style props to the root and lineCss and variants to every line", () => {
    const { container } = render(
      <SkeletonText
        noOfLines={2}
        w="200px"
        animation="none"
        lineCss={{ h: "3" }}
      />,
    );

    const root = container.firstElementChild;
    const lines = [...(root?.children ?? [])];
    expect(classesOf(root)).toContain("w_200px");
    expect(classesOf(root)).not.toContain("h_3");
    expect(classesOf(root)).not.toContain("anim_none");
    expect(lines).toHaveLength(2);
    for (const line of lines) {
      expect(classesOf(line)).toEqual(expect.arrayContaining(["h_3", "skeleton--animation_none"]));
      expect(classesOf(line)).not.toContain("h_4");
      expect(classesOf(line)).not.toContain("w_200px");
    }
  });
});
