import { HStack, Popover, Stack, Text } from "@construkt-kit/ui";
import { passwordRules, passwordSchema } from "@construkt-kit/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { type ReactElement, useMemo } from "react";

export const isPasswordValid = (password: string) => passwordSchema.safeParse(password).success;

export interface PasswordRulesPopoverProps {
  isOpen: boolean;
  password: string;
  children: ReactElement;
}

export const PasswordRulesPopover = ({ isOpen, password, children }: PasswordRulesPopoverProps) => {
  const failedRules = useMemo(
    () => new Set(passwordRules.filter((rule) => !rule.test(password)).map((rule) => rule.id)),
    [password],
  );

  return (
    <Popover.Root
      autoFocus={false}
      lazyMount
      unmountOnExit
      modal={false}
      open={isOpen}
      placement="right"
    >
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content p="4">
        <Stack gap="4">
          <Text>Password Rules</Text>
          <Stack>
            {passwordRules.map(({ id, label }) => {
              const failed = failedRules.has(id);

              return (
                <HStack
                  key={id}
                  color={failed ? "fg.error" : "fg.success"}
                >
                  {failed ? <XIcon size={16} /> : <CheckIcon size={16} />}
                  <Text fontSize="sm">{label}</Text>
                </HStack>
              );
            })}
          </Stack>
        </Stack>
      </Popover.Content>
    </Popover.Root>
  );
};
