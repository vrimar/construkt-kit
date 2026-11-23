import { act } from "@testing-library/react";

export const resetForm = async (form: HTMLFormElement | null) => {
  act(() => form?.reset());
  await act(() => new Promise(requestAnimationFrame));
};
