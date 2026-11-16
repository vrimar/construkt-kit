import preview from "@construkt-kit/story-kit/preview";
import { Box } from "@construkt-kit/ui";
import { fn } from "storybook/test";

import { ResetPasswordPage } from "./index";

const meta = preview.meta({
  title: "Pages/ResetPasswordPage",
  component: ResetPasswordPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onBack: fn(),
    email: "user@example.com",
    token: "mock-token",
  },
});

export const Default = meta.story();

export const Loading = meta.story({
  args: {
    isLoading: true,
  },
});

export const Success = meta.story({
  args: {
    isSuccess: true,
  },
});

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
