import { Button, Input, Stack, TextLabel, useAutoFocus } from "@b3/ui";
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
      <Stack gap="4">
        <Stack>
          <TextLabel>Email</TextLabel>
          <Input
            ref={emailInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Stack>

        <Stack>
          <TextLabel>Password</TextLabel>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </Stack>

        {onForgotPassword && (
          <Button
            type="button"
            variant="ghost"
            onClick={onForgotPassword}
          >
            Forgot your password?
          </Button>
        )}

        <Button
          w="100%"
          type="submit"
          loading={isLoading}
          onClick={() => onSubmit(email, password)}
        >
          Login
        </Button>
      </Stack>
    </AuthLayout>
  );
}
