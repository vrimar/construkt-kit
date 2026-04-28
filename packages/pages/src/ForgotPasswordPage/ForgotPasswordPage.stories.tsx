import { Box } from "@construkt-kit/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { ForgotPasswordPage } from "./index";

const meta: Meta<typeof ForgotPasswordPage> = {
  title: "Pages/ForgotPasswordPage",
  component: ForgotPasswordPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onBack: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ForgotPasswordPage>;

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
        Construkt Kit Portal
      </Box>
    ),
  },
};
