
import { Alert } from "./Alert";

interface Props {
  error?: any;
}

export const ApiErrorAlert = ({ error }: Props) => {
  const message =
    error?.Message ||
    error?.message ||
    error?.description ||
    error?.error_description ||
    "An error has occurred";

  return (
    <Alert
      status="error"
      title={message}
    />
  );
};
