import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Editable } from ".";

function ControlledEditable({ onValueCommit }: { onValueCommit: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <Editable.Root
      defaultValue="Draft"
      activationMode="click"
      editing={editing}
      onEditingChange={setEditing}
      onValueCommit={onValueCommit}
    >
      <Editable.Area>
        <Editable.Input aria-label="Title" />
        <Editable.Preview />
      </Editable.Area>
    </Editable.Root>
  );
}

describe("Editable", () => {
  it("points its label and input at each other by the ids they are given", () => {
    render(
      <Editable.Root
        defaultValue="Draft"
        defaultEditing
      >
        <Editable.Label id="title-label">Title</Editable.Label>
        <Editable.Area>
          <Editable.Input id="title-input" />
          <Editable.Preview />
        </Editable.Area>
      </Editable.Root>,
    );

    expect(screen.getByRole("textbox", { name: "Title" }).id).toBe("title-input");
    expect(screen.getByText("Title").closest("label")?.htmlFor).toBe("title-input");
  });

  it("commits a submit once a controlled `editing` turns off", async () => {
    const user = userEvent.setup();
    const onValueCommit = vi.fn();
    render(<ControlledEditable onValueCommit={onValueCommit} />);

    await user.click(screen.getByText("Draft"));
    const input = screen.getByRole("textbox", { name: "Title" });
    await user.clear(input);
    await user.type(input, "Final{Enter}");

    expect(onValueCommit).toHaveBeenCalledWith(
      "Final",
      expect.objectContaining({ reason: "enter-key" }),
    );
    expect(screen.getByText("Final")).not.toBeNull();
  });
});
