import { HStack, Stack, Text } from "@construkt-kit/ui";
import { getFailedPasswordRules, passwordRules } from "@construkt-kit/utils";
import { CheckIcon, XIcon } from "lucide-react";
import { type ReactElement, useMemo } from "react";

import { FieldHintPopover } from "../FieldHintPopover";

export const isPasswordValid = (password: string) => getFailedPasswordRules(password).length === 0;

export interface PasswordRulesPopoverProps {
  open: boolean;
  password: string;
  children: ReactElement;
}

export const PasswordRulesPopover = ({ open, password, children }: PasswordRulesPopoverProps) => {
  const failedRules = useMemo(
    () => new Set(getFailedPasswordRules(password).map((rule) => rule.id)),
    [password],
  );

  return (
    <FieldHintPopover
      open={open}
      hint={
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
      }
    >
      {children}
    </FieldHintPopover>
  );
};
