import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { AuthProvider } from "../types";
import { LoginPage } from "./index";

const mockAuthProvider: AuthProvider = {
  getToken: fn().mockResolvedValue("mock-token"),
  login: fn().mockResolvedValue(undefined),
  logout: fn().mockResolvedValue(undefined),
  isAuthenticated: fn().mockResolvedValue(false),
  getUser: fn().mockResolvedValue(null),
};

const meta: Meta<typeof LoginPage> = {
  title: "Pages/LoginPage",
  component: LoginPage,
  tags: ["autodocs"],
  args: {
    authProvider: mockAuthProvider,
    onSuccess: fn(),
    onForgotPassword: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LoginPage>;

export const Default: Story = {};

export const WithLogo: Story = {
  args: {
    logo: (
      <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>B3 Portal</div>
    ),
  },
};

export const NoForgotPassword: Story = {
  args: {
    onForgotPassword: undefined,
  },
};
