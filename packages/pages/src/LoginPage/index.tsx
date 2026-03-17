import { Button, Field, Input, Stack, useAutoFocus } from "@b3/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

export interface LoginPageProps {
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  onForgotPassword?: () => void;
}

export function LoginPage({ onSubmit, isLoading, logo, onForgotPassword }: LoginPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <AuthLayout logo={logo}>
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
          >
            Login
          </Button>

          {onForgotPassword && (
            <Button
              type="button"
              variant="plain"
              onClick={onForgotPassword}
            >
              Forgot your password?
            </Button>
          )}
        </Stack>
      </form>
    </AuthLayout>
  );
}
