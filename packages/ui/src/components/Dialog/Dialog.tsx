import { Box, Dialog as ChakraDialog, Portal } from "@chakra-ui/react";
import React from "react";

import { CloseButton } from "../Buttons";

export interface DialogContentProps extends ChakraDialog.ContentProps {
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  backdrop?: boolean;
}

function DialogContent({ ref, children, portalled = true, portalRef, backdrop = true, ...rest }: DialogContentProps & { ref?: React.Ref<HTMLDivElement> }) {

    return (
      <Portal
        disabled={!portalled}
        container={portalRef}
      >
        {backdrop && <ChakraDialog.Backdrop />}
        <ChakraDialog.Positioner>
          <ChakraDialog.Content
            animation="none"
            ref={ref}
            {...rest}
            asChild={false}
          >
            {children}
          </ChakraDialog.Content>
        </ChakraDialog.Positioner>
      </Portal>
    );
}

function DialogCloseTrigger({ ref, children, ...props }: ChakraDialog.CloseTriggerProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ChakraDialog.CloseTrigger
      position="absolute"
      top="2"
      {...props}
      insetEnd="2"
      asChild
    >
      <CloseButton
        size="sm"
        ref={ref}
      >
        {children}
      </CloseButton>
    </ChakraDialog.CloseTrigger>
  );
}

function DialogHeader(props: ChakraDialog.HeaderProps) {
  return (
    <Box
      asChild
      borderBottomWidth="1px"
      borderColor="border"
      boxShadow="0 5px 10px rgba(0, 0, 0, 0.035);"
    >
      <ChakraDialog.Header {...props} />
    </Box>
  );
}

export const Dialog = {
  Root: ChakraDialog.Root,
  Content: DialogContent,
  CloseTrigger: DialogCloseTrigger,
  Footer: ChakraDialog.Footer,
  Header: DialogHeader,
  Body: ChakraDialog.Body,
  Backdrop: ChakraDialog.Backdrop,
  Title: ChakraDialog.Title,
  Description: ChakraDialog.Description,
  Trigger: ChakraDialog.Trigger,
  ActionTrigger: ChakraDialog.ActionTrigger,
};
