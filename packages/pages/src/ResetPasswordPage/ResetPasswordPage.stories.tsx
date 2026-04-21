import { Box } from "@b3/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ResetPasswordPage } from "./index";

const meta: Meta<typeof ResetPasswordPage> = {
  title: "Pages/ResetPasswordPage",
  component: ResetPasswordPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onBack: fn(),
    email: "user@example.com",
    token: "mock-token",
  },
};

export default meta;
type Story = StoryObj<typeof ResetPasswordPage>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Success: Story = {
  args: {
    isSuccess: true,
  },
};

export const WithLogo: Story = {
  args: {
    logo: (
      <Box
        fontWeight="bold"
        fontSize="2xl"
        mb="4"
      >
        B3 Portal
      </Box>
    ),
  },
};
