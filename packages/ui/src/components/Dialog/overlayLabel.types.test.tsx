import { describe, expectTypeOf, it } from "vitest";

import { Dialog } from ".";
import { Drawer } from "../Drawer";
import { Sheet } from "../Sheet";

function Unnamed() {
  return (
    <>
      {/* @ts-expect-error a dialog needs a title or an aria-label */}
      <Dialog.Root />
      {/* @ts-expect-error a drawer needs a title or an aria-label */}
      <Drawer.Root placement="start" />
      {/* @ts-expect-error a sheet needs a title or an aria-label */}
      <Sheet.Root snapPoints={[0.5, 1]} />
    </>
  );
}

describe("overlay labels", () => {
  it("rejects a modal overlay with neither a title nor an aria-label", () => {
    expectTypeOf(Unnamed).toBeFunction();
  });
});
