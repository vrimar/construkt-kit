import { Text } from "../Text";
import { SubmitDialog, type SubmitDialogProps } from "./SubmitDialog";

export interface DeleteDialogProps extends Omit<SubmitDialogProps, "children"> {
  title: string;
  name: string;
  onClose: () => unknown;
  onSubmit: () => unknown;
  confirmMessage?: string;
}

export const DeleteDialog = ({ name, title, confirmMessage, ...props }: DeleteDialogProps) => {
  return (
    <SubmitDialog
      submitLabel="Delete"
      size="sm"
      destructive
      {...props}
      title={`Delete ${title}`}
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
