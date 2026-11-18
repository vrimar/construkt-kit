import { Field, Input, useAutoFocus } from "@construkt-kit/ui";
import { useState } from "react";

import { AuthForm, AuthLinkButton, AuthSuccess, getEmailError } from "../AuthForm";
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
  error,
  logo,
  onBack,
  isSuccess,
  title = "Reset password",
  description = "Enter your email and we will send you a reset link.",
}: ForgotPasswordPageProps) {
  const emailInput = useAutoFocus();
  const [email, setEmail] = useState("");
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const emailError = getEmailError(email);

  const handleSubmit = () => {
    setSubmitAttempted(true);
    if (emailError) emailInput.current?.focus();
    else onSubmit(email);
  };

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
          onSubmit={handleSubmit}
          submitLabel="Send reset link"
          loading={isLoading}
          error={error}
          submitDisabled={!email}
          footer={onBack && <AuthLinkButton onClick={onBack}>Back to login</AuthLinkButton>}
        >
          <Field
            label="Email"
            invalid={submitAttempted && emailError !== undefined}
            errorText={emailError}
          >
            <Input
              ref={emailInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              autoComplete="email"
            />
          </Field>
        </AuthForm>
      )}
    </AuthLayout>
  );
}
