import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Pagination } from ".";

const pageItems = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-part="item"]'));

const pageLabels = (container: HTMLElement) => pageItems(container).map((item) => item.textContent);

const pageItem = (container: HTMLElement, label: string) => {
  const item = pageItems(container).find((candidate) => candidate.textContent === label);
  if (!item) throw new Error(`No page item ${label}`);
  return item;
};

describe("Pagination", () => {
  it("renders the controlled page", () => {
    const { container } = render(
      <Pagination.Root
        count={100}
        pageSize={10}
        page={5}
      >
        <Pagination.Items
          render={(item) => (
            <Pagination.Item
              type={item.type}
              value={item.value}
            >
              {item.value}
            </Pagination.Item>
          )}
        />
      </Pagination.Root>,
    );

    expect(pageLabels(container)).toEqual(["1", "4", "5", "6", "10"]);
    expect(pageItem(container, "5").getAttribute("data-selected")).not.toBeNull();
  });

  it("renders each page once while paging past the ellipses", async () => {
    const { container } = render(
      <Pagination.Root
        count={100}
        pageSize={10}
        defaultPage={4}
      >
        <Pagination.Items
          render={(item) => (
            <Pagination.Item
              type={item.type}
              value={item.value}
            >
              {item.value}
            </Pagination.Item>
          )}
        />
      </Pagination.Root>,
    );

    await userEvent.click(pageItem(container, "5"));
    expect(pageLabels(container)).toEqual(["1", "4", "5", "6", "10"]);

    await userEvent.click(pageItem(container, "6"));
    expect(pageLabels(container)).toEqual(["1", "5", "6", "7", "10"]);
  });
});
