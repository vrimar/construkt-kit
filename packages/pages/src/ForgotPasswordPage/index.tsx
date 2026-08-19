import { Field, Input, useAutoFocus } from "@construkt-kit/ui";
import { useState } from "react";

import { AuthForm, AuthLinkButton, AuthSuccess } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import type { AuthPageProps } from "../types";

export interface ForgotPasswordPageProps extends AuthPageProps {
  onSubmit: (email: string) => void;
  onBack?: () => void;
  isSuccess?: boolean;
}

export function ForgotPasswordPage({
  onSubmit,
  isLoading,
  logo,
  onBack,
  isSuccess,
  title = "Reset password",
  description = "Enter your email and we will send you a reset link.",
}: ForgotPasswordPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      {isSuccess ? (
        <AuthSuccess
          title="Check your email for a link to reset your password."
          onBack={onBack}
        />
      ) : (
        <AuthForm
          onSubmit={() => onSubmit(email)}
          submitLabel="Send reset link"
          isLoading={isLoading}
          isSubmitDisabled={!email}
          footer={onBack && <AuthLinkButton onClick={onBack}>Back to login</AuthLinkButton>}
        >
          <Field label="Email">
            <Input
              ref={emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </Field>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
