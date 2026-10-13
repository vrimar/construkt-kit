import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { describe, expect, expectTypeOf, it } from "vitest";

import { DisplayValue, type DisplayValueProps } from ".";

const text = (element: ReactElement) => render(element).container.textContent;

const placeholder = "—No value available";

describe("DisplayValue", () => {
  it("renders primitives and primitive arrays", () => {
    expect(text(<DisplayValue value={42} />)).toBe("42");
    expect(text(<DisplayValue value={false} />)).toBe("false");
    expect(text(<DisplayValue value={["a", "b"]} />)).toBe("a,b");
  });

  it("shows the placeholder for empty values", () => {
    expect(text(<DisplayValue value={null} />)).toBe(placeholder);
    expect(text(<DisplayValue value="" />)).toBe(placeholder);
    expect(text(<DisplayValue value={[]} />)).toBe(placeholder);
    expect(text(<DisplayValue />)).toBe(placeholder);
  });

  it.each([null, undefined, ""])("shows the placeholder when formatValue returns %j", (result) => {
    expect(
      text(
        <DisplayValue
          value={1}
          formatValue={() => result}
        />,
      ),
    ).toBe(placeholder);
  });

  it("renders the formatted value", () => {
    const date = new Date(Date.UTC(2026, 0, 2));
    expect(
      text(
        <DisplayValue
          value={date}
          formatValue={(value) => value.toISOString().slice(0, 10)}
        />,
      ),
    ).toBe("2026-01-02");
    expect(
      text(
        <DisplayValue
          value={{ name: "Ada" }}
          formatValue={(value) => value.name}
        />,
      ),
    ).toBe("Ada");
  });

  it("requires formatValue for values that do not stringify", () => {
    expectTypeOf<Pick<DisplayValueProps<number | null>, "formatValue">>().toEqualTypeOf<{
      formatValue?: (value: number) => string | null | undefined;
    }>();
    expectTypeOf<Pick<DisplayValueProps<Date>, "formatValue">>().toEqualTypeOf<{
      formatValue: (value: Date) => string | null | undefined;
    }>();
    expectTypeOf<Pick<DisplayValueProps<readonly { a: number }[]>, "formatValue">>().toEqualTypeOf<{
      formatValue: (value: readonly { a: number }[]) => string | null | undefined;
    }>();

    const elements = [
      <DisplayValue
        key="string"
        value="x"
      />,
      <DisplayValue
        key="array"
        value={["a"]}
      />,
      // @ts-expect-error objects need formatValue
      <DisplayValue
        key="object"
        value={{ a: 1 }}
      />,
      // @ts-expect-error dates need formatValue
      <DisplayValue
        key="date"
        value={new Date()}
      />,
    ];
    expect(elements).toHaveLength(4);
  });
});
