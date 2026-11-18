import preview from "@construkt-kit/story-kit/preview";
import { Box } from "@construkt-kit/ui";
import { fn } from "storybook/test";

import { LoginPage } from "./index";

const meta = preview.meta({
  title: "Pages/LoginPage",
  component: LoginPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onForgotPassword: fn(),
  },
});

export const Default = meta.story();

export const WithLogo = meta.story({
  args: {
    logo: (
      <Box
        fontWeight="bold"
        fontSize="2xl"
        mb="4"
      >
        Construkt Kit Portal
      </Box>
    ),
  },
});

export const WithError = meta.story({
  args: {
    error: "Incorrect email or password.",
  },
});

export const NoForgotPassword = meta.story({
  args: {
    onForgotPassword: undefined,
  },
});

export const ShortViewport = meta.story({
  decorators: [
    (Story) => (
      <Box height="360px">
        <Story />
      </Box>
    ),
  ],
});
