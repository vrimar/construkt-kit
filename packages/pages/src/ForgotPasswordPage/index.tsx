import { Button, Input, Stack, Text, TextLabel, useAutoFocus } from "@b3/ui";
import { type ReactNode, useState } from "react";

import { AuthLayout } from "../AuthLayout";

export interface ForgotPasswordPageProps {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
  logo?: ReactNode;
  onBack?: () => void;
  isSuccess?: boolean;
}

export function ForgotPasswordPage({
  onSubmit,
  isLoading,
  logo,
  onBack,
  isSuccess,
}: ForgotPasswordPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title="Reset password"
      showTitle
    >
      {isSuccess ? (
        <Stack gap="4">
          <Text>Check your email for a link to reset your password.</Text>
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
            >
              Back to login
            </Button>
          )}
        </Stack>
      ) : (
        <Stack gap="4">
          <Stack>
            <TextLabel>Email</TextLabel>
            <Input
              ref={emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </Stack>

          <Button
            w="100%"
            type="submit"
            loading={isLoading}
            onClick={() => onSubmit(email)}
          >
            Send reset link
          </Button>

          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
            >
              Back to login
            </Button>
          )}
        </Stack>
      )}
    </AuthLayout>
  );
}
