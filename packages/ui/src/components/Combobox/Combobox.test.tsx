import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent, { PointerEventsCheckLevel } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Combobox, type ComboboxRootProps } from ".";
import { mockMatchMedia, viewportWidth } from "../../_shared/matchMedia";
import { Field } from "../Form";

const letters = ["a", "b"];

const letterProps = {
  items: letters,
  getItemValue: (item: string) => item,
  getItemLabel: (item: string) => item,
};

const letterItems = letters.map((item) => (
  <Combobox.Item
    key={item}
    item={item}
  >
    <Combobox.ItemText>{item}</Combobox.ItemText>
  </Combobox.Item>
));

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

const renderFrameworks = (onValueChange = vi.fn()) => {
  render(
    <Combobox.Root
      items={frameworks}
      getItemValue={(item) => item.value}
      getItemLabel={(item) => item.label}
      onValueChange={onValueChange}
    >
      <Combobox.Control>
        <Combobox.Input aria-label="Framework" />
      </Combobox.Control>
      <Combobox.Content>
        <Combobox.List>
          {frameworks.map((item) => (
            <Combobox.Item
              key={item.value}
              item={item}
            >
              <Combobox.ItemText>{item.label}</Combobox.ItemText>
            </Combobox.Item>
          ))}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>,
  );
  return screen.getByRole<HTMLInputElement>("combobox");
};

describe("Combobox", () => {
  it("picks the highlighted option with Enter, shows its label and closes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const input = renderFrameworks(onValueChange);
    const highlighted = () =>
      document.getElementById(input.getAttribute("aria-activedescendant") ?? "")?.textContent;

    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(highlighted()).toBe("React"));
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("vue");
    expect(input.value).toBe("Vue");
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("clears typed text that matches no option when a press outside closes the list", async () => {
    const user = userEvent.setup();
    const input = renderFrameworks();

    await user.click(input);
    await user.keyboard("zz");
    expect(input.getAttribute("aria-expanded")).toBe("true");
    await user.click(document.body);

    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.value).toBe("");
  });

  it("goes back to its initial value and text when its form resets", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Combobox.Root
          items={frameworks}
          getItemValue={(item) => item.value}
          getItemLabel={(item) => item.label}
          defaultValue="react"
          onValueChange={onValueChange}
        >
          <Combobox.Control>
            <Combobox.Input
              aria-label="Framework"
              name="framework"
            />
          </Combobox.Control>
          <Combobox.Content>
            <Combobox.List>
              {frameworks.map((item) => (
                <Combobox.Item
                  key={item.value}
                  item={item}
                >
                  <Combobox.ItemText>{item.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const input = screen.getByRole<HTMLInputElement>("combobox");

    await user.click(input);
    await user.keyboard("{ArrowDown}");
    await user.click(await screen.findByRole("option", { name: "Vue" }));
    expect(input.value).toBe("Vue");

    act(() => form.reset());

    expect(onValueChange).toHaveBeenLastCalledWith("react");
    expect(input.value).toBe("React");
    expect(new FormData(form).get("framework")).toBe("React");
  });

  it("submits its value with the form when picked from a phone sheet", async () => {
    mockMatchMedia(viewportWidth(375));
    const { container } = render(
      <form>
        <Combobox.Root {...letterProps}>
          <Combobox.Label>Letter</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input name="letter" />
          </Combobox.Control>
          <Combobox.Content>
            <Combobox.List>{letterItems}</Combobox.List>
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
        {...letterProps}
        defaultOpen
      >
        <Combobox.Control>
          <Combobox.Input aria-label="Letter" />
        </Combobox.Control>
        <Combobox.Content>
          <Combobox.List>{letterItems}</Combobox.List>
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

  it("leaves the text selected in the focused input as a pick closes the list", async () => {
    const user = userEvent.setup();
    render(
      <Combobox.Root {...letterProps}>
        <Combobox.Control>
          <Combobox.Input aria-label="Letter" />
        </Combobox.Control>
        <Combobox.Content>
          <Combobox.List>{letterItems}</Combobox.List>
        </Combobox.Content>
      </Combobox.Root>,
    );
    const input = screen.getByRole<HTMLInputElement>("combobox");

    await user.click(input);
    await user.keyboard("a{ArrowDown}{Enter}");
    input.setSelectionRange(0, input.value.length);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    expect(input.selectionStart).toBe(0);
  });

  it("leaves a link option to the browser when a new-tab click opens it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox.Root
        {...letterProps}
        defaultOpen
        onValueChange={onValueChange}
      >
        <Combobox.Control>
          <Combobox.Input aria-label="Letter" />
        </Combobox.Control>
        <Combobox.Content>
          <Combobox.List>
            <Combobox.Item
              item="a"
              render={<a href="#a" />}
            >
              <Combobox.ItemText>a</Combobox.ItemText>
            </Combobox.Item>
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>,
    );
    const option = screen.getByRole("option", { name: "a" });

    await user.keyboard("{Control>}{Meta>}");
    await user.click(option);
    await user.keyboard("{/Meta}{/Control}");
    expect(onValueChange).not.toHaveBeenCalled();

    await user.click(option);
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith("a");
  });

  describe("on phones", () => {
    const renderPhoneField = (rootProps: Partial<ComboboxRootProps<string, string>>) => {
      mockMatchMedia(viewportWidth(375));
      return render(
        <form>
          <Combobox.Root
            {...letterProps}
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
      const { container, unmount } = renderPhoneField({ disabled: true, defaultValue: "b" });
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
        <Combobox.Root {...letterProps}>
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

    it("marks the field invalid and described by its Field's error", () => {
      mockMatchMedia(viewportWidth(375));
      render(
        <Field
          label="Letter"
          invalid
          errorText="Pick a letter."
        >
          <Combobox.Root {...letterProps}>
            <Combobox.Control>
              <Combobox.Input />
            </Combobox.Control>
          </Combobox.Root>
        </Field>,
      );

      const field = screen.getByRole("button", { name: /Letter/ });
      expect(field.getAttribute("aria-invalid")).toBe("true");
      expect(field.hasAttribute("data-invalid")).toBe(true);
      expect(
        document.getElementById(field.getAttribute("aria-describedby") ?? "")?.textContent,
      ).toBe("Pick a letter.");
    });

    it("announces from inside the sheet, which makes the page behind it inert", async () => {
      mockMatchMedia(viewportWidth(375));
      render(
        <Combobox.Root {...letterProps}>
          <Combobox.Label>Letter</Combobox.Label>
          <Combobox.Control>
            <Combobox.Input />
          </Combobox.Control>
          <Combobox.Content>
            <Combobox.List>{letterItems}</Combobox.List>
          </Combobox.Content>
        </Combobox.Root>,
      );
      const user = userEvent.setup({ pointerEventsCheck: PointerEventsCheckLevel.Never });

      await user.click(screen.getByRole("button", { name: /Letter/ }));
      const sheet = await screen.findByRole("dialog");

      await waitFor(() => expect(sheet.querySelector("[aria-live='polite']")).not.toBeNull());
    });
  });
});
