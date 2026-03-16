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
      <div style={{ fontWeight: 700, fontSize: "1.5rem", marginBottom: "1rem" }}>B3 Portal</div>
    ),
  },
};

export const NoForgotPassword: Story = {
  args: {
    onForgotPassword: undefined,
  },
};
