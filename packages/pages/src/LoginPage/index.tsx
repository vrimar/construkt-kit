import { Input, Link, useAutoFocus } from "@construkt-kit/ui";
import { type ReactNode, useRef, useState } from "react";

import { AuthEmailField, AuthField, AuthForm, getEmailError } from "../AuthForm";
import { AuthLayout } from "../AuthLayout";
import type { AuthPageProps } from "../types";

export interface LoginPageProps extends AuthPageProps {
  onSubmit: (email: string, password: string) => void;
  onForgotPassword?: () => void;
  /** Rendered between the fields and the submit button, such as a captcha. */
  beforeSubmit?: ReactNode;
}

export function LoginPage({
  onSubmit,
  isLoading,
  error,
  logo,
  onForgotPassword,
  beforeSubmit,
  title = "Welcome back",
  description = "Sign in to continue to App.",
}: LoginPageProps) {
  const emailInput = useAutoFocus();
  const passwordInput = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordError = password ? undefined : "Password is required.";

  const handleSubmit = () => {
    if (getEmailError(email)) emailInput.current?.focus();
    else if (passwordError) passwordInput.current?.focus();
    else onSubmit(email, password);
  };

  return (
    <AuthLayout
      logo={logo}
      title={title}
      description={description}
      showTitle
    >
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Sign in"
        loading={isLoading}
        error={error}
        beforeSubmit={beforeSubmit}
      >
        <AuthEmailField
          ref={emailInput}
          value={email}
          onValueChange={setEmail}
          autoComplete="username"
        />

        <AuthField
          label="Password"
          error={passwordError}
          labelAction={
            onForgotPassword && (
              <Link
                render={
                  <button
                    type="button"
                    onClick={onForgotPassword}
                  />
                }
                variant="plain"
                colorPalette="brand"
                color="colorPalette.plain.fg"
              >
                Forgot password?
              </Link>
            )
          }
        >
          <Input
            ref={passwordInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
          />
        </AuthField>
      </AuthForm>
    </AuthLayout>
  );
}
