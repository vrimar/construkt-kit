import { Alert } from "./Alert";

interface ApiErrorAlertProps {
  error?: unknown;
}

export const ApiErrorAlert = ({ error }: ApiErrorAlertProps) => {
  const err = error as Record<string, unknown> | undefined;
  const message =
    [err?.Message, err?.message, err?.description, err?.error_description].find(
      (candidate): candidate is string => typeof candidate === "string" && candidate.length > 0,
    ) ?? "An error has occurred.";

  return (
    <Alert
      status="error"
      title={message}
    />
  );
};
