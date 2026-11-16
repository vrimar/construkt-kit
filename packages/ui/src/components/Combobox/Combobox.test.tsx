import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Combobox, type ComboboxRootProps, useCombobox } from ".";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { createListCollection } from "../Listbox";

const collection = createListCollection({ items: ["a", "b"] });

const renderPositioner = (positioning: ComboboxRootProps["positioning"]) =>
  render(
    <Combobox.Root
      collection={collection}
      positioning={positioning}
      defaultOpen
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
      const combobox = useCombobox({
        collection,
        positioning: { placement: "top-start" },
        defaultOpen: true,
      });
      return (
        <Combobox.RootProvider value={combobox}>
          <Combobox.Positioner data-testid="positioner" />
        </Combobox.RootProvider>
      );
    };
    const { getByTestId } = render(<Provided />);

    expect(getByTestId("positioner").style.width).not.toBe("var(--reference-width)");
  });

  it("submits its value with the form when picked from a phone sheet", async () => {
    mockMatchMedia(viewportWidth(375));
    const { container } = render(
      <form>
        <Combobox.Root collection={collection}>
          <Combobox.Label>Letter</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input name="letter" />
          </Combobox.Control>
          <Combobox.Content>
            <Combobox.List>
              {collection.items.map((item) => (
                <Combobox.Item
                  key={item}
                  item={item}
                >
                  <Combobox.ItemText>{item}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
      </form>,
    );

    // jsdom loads no stylesheet, so the sheet's pointer-events override on its content is absent.
    const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });
    await user.click(screen.getByRole("button", { name: /Letter/ }));
    await user.click(await screen.findByRole("option", { name: "b" }));

    const form = container.querySelector("form") as HTMLFormElement;
    await waitFor(() => expect(new FormData(form).get("letter")).toBe("b"));
  });

  it("keeps Home and End for the text cursor instead of the highlight", async () => {
    const user = userEvent.setup();
    render(
      <Combobox.Root
        collection={collection}
        defaultOpen
      >
        <Combobox.Control>
          <Combobox.Input aria-label="Letter" />
        </Combobox.Control>
        <Combobox.Content>
          <Combobox.List>
            {collection.items.map((item) => (
              <Combobox.Item
                key={item}
                item={item}
              >
                <Combobox.ItemText>{item}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>,
    );
    const input = screen.getByRole<HTMLInputElement>("combobox");
    const highlighted = () =>
      document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;

    await user.click(input);
    await user.keyboard("ab{ArrowDown}{Home}");
    expect(input.selectionStart).toBe(0);

    await user.keyboard("{End}");
    expect(highlighted()).toBe("a");
    expect(input.selectionStart).toBe(2);
  });

  describe("on phones", () => {
    const renderPhoneField = (rootProps: Partial<ComboboxRootProps<string>>) => {
      mockMatchMedia(viewportWidth(375));
      return render(
        <form>
          <Combobox.Root
            collection={collection}
            {...rootProps}
          >
            <Combobox.Label>Letter</Combobox.Label>
            <Combobox.Control>
              <Combobox.Input name="letter" />
            </Combobox.Control>
          </Combobox.Root>
        </form>,
      );
    };

    it("leaves a disabled field's value out of the form and validates a required one", () => {
      const { container, unmount } = renderPhoneField({ disabled: true, defaultValue: ["b"] });
      expect(
        new FormData(container.querySelector("form") as HTMLFormElement).get("letter"),
      ).toBeNull();
      unmount();

      const required = renderPhoneField({ required: true });
      expect((required.container.querySelector("form") as HTMLFormElement).checkValidity()).toBe(
        false,
      );
    });

    it("doesn't take keyboard focus when tapped read-only", async () => {
      renderPhoneField({ readOnly: true });

      await userEvent.click(screen.getByRole("button", { name: /Letter/ }));

      expect(document.activeElement?.getAttribute("aria-hidden")).not.toBe("true");
    });

    it("names the field by the input's aria-label when there is no label", () => {
      mockMatchMedia(viewportWidth(375));
      render(
        <Combobox.Root collection={collection}>
          <Combobox.Control>
            <Combobox.Input
              aria-label="Letter"
              placeholder="Pick one"
            />
          </Combobox.Control>
        </Combobox.Root>,
      );

      expect(screen.getByRole("button", { name: "Letter Pick one" })).not.toBeNull();
    });
  });
});
