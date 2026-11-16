import preview from "@construkt-kit/story-kit/preview";
import { Box } from "@construkt-kit/ui";
import { fn } from "storybook/test";

import { ForgotPasswordPage } from "./index";

const meta = preview.meta({
  title: "Pages/ForgotPasswordPage",
  component: ForgotPasswordPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onBack: fn(),
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
