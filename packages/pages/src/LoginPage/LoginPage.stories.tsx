import { Box } from "@b3/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { LoginPage } from "./index";

const meta: Meta<typeof LoginPage> = {
  title: "Pages/LoginPage",
  component: LoginPage,
  tags: ["autodocs"],
  args: {
    onSubmit: fn(),
    onForgotPassword: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

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

export const NoForgotPassword: Story = {
  args: {
    onForgotPassword: undefined,
  },
};
