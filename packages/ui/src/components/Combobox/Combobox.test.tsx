import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Combobox, type ComboboxRootProps, useCombobox } from ".";
import { createListCollection } from "../Listbox";

const collection = createListCollection({ items: ["a", "b"] });

const renderPositioner = (positioning: ComboboxRootProps["positioning"]) =>
  render(
    <Combobox.Root
      collection={collection}
      positioning={positioning}
    >
      <Combobox.Positioner data-testid="positioner" />
    </Combobox.Root>,
  );

describe("Combobox", () => {
  it("keeps its content free of the input's width when given other positioning", () => {
    const { getByTestId } = renderPositioner({ placement: "top-start" });

    expect(getByTestId("positioner").style.width).not.toBe("var(--reference-width)");
  });

  it("matches the input's width when asked to", () => {
    const { getByTestId } = renderPositioner({ sameWidth: true });

    expect(getByTestId("positioner").style.width).toBe("var(--reference-width)");
  });

  it("keeps RootProvider content free of the input's width", () => {
    const Provided = () => {
      const combobox = useCombobox({ collection, positioning: { placement: "top-start" } });
      return (
        <Combobox.RootProvider value={combobox}>
          <Combobox.Positioner data-testid="positioner" />
        </Combobox.RootProvider>
      );
    };
    const { getByTestId } = render(<Provided />);

    expect(getByTestId("positioner").style.width).not.toBe("var(--reference-width)");
  });
});
