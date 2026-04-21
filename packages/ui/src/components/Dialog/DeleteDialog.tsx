import { Text } from "../Text";
import { SubmitDialog } from "./SubmitDialog";

interface DeleteDialogProps {
  title: string;
  name: string;
  onClose: () => unknown;
  onSubmit: () => unknown;
  loading: boolean;
  confirmMessage?: string;
}

export const DeleteDialog = ({
  name,
  title,
  onClose,
  onSubmit,
  loading,
  confirmMessage,
}: DeleteDialogProps) => {
  return (
    <SubmitDialog
      title={`Delete ${title}`}
      onClose={onClose}
      onSubmit={onSubmit}
      isSubmitLoading={loading}
      autoFocusButton
    >
      <Text>
        {confirmMessage ?? (
          <>
            Are you sure you want to delete <b>{name}</b>?
          </>
        )}
      </Text>
    </SubmitDialog>
  );
};
