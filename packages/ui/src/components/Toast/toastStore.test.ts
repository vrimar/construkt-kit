import { describe, expect, it } from "vitest";

import { createToastStore } from "./toastStore";

const titles = (store: ReturnType<typeof createToastStore>) =>
  store.getSnapshot().toasts.map((toast) => toast.title);

describe("createToastStore", () => {
  it("shows the queued toast with the highest priority once a shown one is removed", () => {
    const store = createToastStore({ max: 2 });
    const first = store.info({ title: "first" });
    store.info({ title: "second" });
    store.success({ title: "saved" });
    store.error({ title: "failed" });

    expect(titles(store)).toEqual(["second", "first"]);
    store.remove(first);

    expect(titles(store)).toEqual(["failed", "second"]);
  });

  it("turns the loading toast into the error toast in place when the promise rejects", async () => {
    const store = createToastStore({ max: 5 });
    const { id, unwrap } = store.promise(Promise.reject(new Error("offline")), {
      loading: { title: "Saving" },
      error: (error) => ({ title: (error as Error).message }),
    });

    await expect(unwrap()).rejects.toThrow("offline");

    expect(store.getSnapshot().toasts).toEqual([
      expect.objectContaining({ id, type: "error", title: "offline" }),
    ]);
  });

  it("shows the error toast for a response that isn't ok", async () => {
    const store = createToastStore({ max: 5 });
    const { unwrap } = store.promise(Promise.resolve(new Response(null, { status: 500 })), {
      loading: { title: "Saving" },
      success: { title: "Saved" },
      error: { title: "Not saved" },
    });

    await unwrap();

    expect(store.getSnapshot().toasts).toEqual([
      expect.objectContaining({ type: "error", title: "Not saved" }),
    ]);
  });
});
