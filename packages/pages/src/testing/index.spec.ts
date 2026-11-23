import { expect, storyTest } from "@construkt-kit/story-kit/test";

import { authFieldError, authFormError, signIn } from "./index";

storyTest(
  ["pages-loginpage--default"],
  "signIn submits the username and password",
  async ({ gallery, page }) => {
    await signIn(page, { username: "ada@example.com", password: "correct horse" });

    await expect
      .poll(() => gallery.calls("onSubmit"))
      .toEqual([["ada@example.com", "correct horse"]]);
  },
);

storyTest(
  ["pages-loginpage--default"],
  "an empty sign-in shows each field's error under that field",
  async ({ page }) => {
    await signIn(page, { username: "", password: "" });

    await expect(authFieldError(page, "Email")).toHaveText("Email is required.");
    await expect(authFieldError(page, "Password")).toHaveText("Password is required.");
  },
);

storyTest(
  ["pages-loginpage--with-error"],
  "a rejected sign-in shows as the form's error",
  async ({ page }) => {
    await signIn(page, { username: "ada@example.com", password: "wrong" });

    await expect(authFormError(page)).toHaveText("Incorrect email or password.");
  },
);
