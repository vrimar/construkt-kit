import { Button, Input, Stack, TextLabel, useAutoFocus } from "@b3/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

export interface ResetPasswordPageProps {
  onSubmit: (email: string, token: string, password: string, confirmPassword: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  email?: string;
  token?: string;
}

export function ResetPasswordPage({
  onSubmit,
  isLoading,
  logo,
  email = "",
  token = "",
}: ResetPasswordPageProps) {
  const passwordInput = useAutoFocus();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title="Set new password"
      showTitle
    >
      <Stack gap="4">
        <Stack>
          <TextLabel>New password</TextLabel>
          <Input
            ref={passwordInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />
        </Stack>

        <Stack>
          <TextLabel>Confirm password</TextLabel>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
          />
        </Stack>

        <Button
          w="100%"
          type="submit"
          loading={isLoading}
          onClick={() => onSubmit(email, token, password, confirmPassword)}
        >
          Reset password
        </Button>
      </Stack>
    </AuthLayout>
  );
}
