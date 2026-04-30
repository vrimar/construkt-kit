import { Button, Field, Input, Stack, useAutoFocus } from "@construkt-kit/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

export interface LoginPageProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  onForgotPassword?: () => void;
  title?: string;
  description?: string;
}

export function LoginPage({
  onSubmit,
  isLoading,
  logo,
  onForgotPassword,
  title = "Welcome back",
  description = "Sign in to continue to App.",
}: LoginPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(email, password);
        }}
      >
        <Stack gap="4">
          <Field label="Email">
            <Input
              ref={emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field label="Password">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
          </Field>

          <Button
            w="100%"
            type="submit"
            loading={isLoading}
            colorPalette="brand"
          >
            Login
          </Button>

          {onForgotPassword && (
            <Button
              type="button"
              variant="plain"
              onClick={onForgotPassword}
              colorPalette="brand"
            >
              Forgot your password?
            </Button>
          )}
        </Stack>
      </form>
    </AuthLayout>
  );
}
