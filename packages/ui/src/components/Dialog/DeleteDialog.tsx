import { Text } from "@chakra-ui/react";

import { SubmitDialog } from ".";

interface Props {
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
}: Props) => {
  return (
    <SubmitDialog
      title={`Delete ${title}`}
      onClose={onClose}
      onSubmit={onSubmit}
      submitButtonProps={{ colorPalette: "red" }}
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
