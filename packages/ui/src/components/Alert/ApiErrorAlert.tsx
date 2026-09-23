import { Alert } from "./Alert";

interface ApiErrorAlertProps {
  error?: unknown;
}

export const ApiErrorAlert = ({ error }: ApiErrorAlertProps) => (
  <Alert
    status="error"
    title={error instanceof Error && error.message ? error.message : "An error has occurred."}
  />
);
