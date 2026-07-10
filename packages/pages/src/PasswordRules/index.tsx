import { HStack, Popover, Stack, Text } from "@construkt-kit/ui";
import { CheckIcon, XIcon } from "lucide-react";
import PasswordValidator from "password-validator";
import { type ReactElement, useMemo } from "react";

const ruleLabels: Record<string, string> = {
  min: "At least 8 characters in length",
  lowercase: "Lower case letters (a-z)",
  uppercase: "Upper case letters (A-Z)",
  digits: "Numbers (i.e. 0-9)",
  symbols: "Special characters (e.g. !@#$%^&*)",
};

export const passwordRuleSchema = new PasswordValidator()
  .min(8)
  .has()
  .lowercase(1)
  .has()
  .uppercase(1)
  .has()
  .digits(1)
  .has()
  .symbols(1);

export const isPasswordValid = (password: string) =>
  passwordRuleSchema.validate(password) as boolean;

interface FailedRule {
  validation: string;
}

export interface PasswordRulesPopoverProps {
  isOpen: boolean;
  password: string;
  children: ReactElement;
}

export const PasswordRulesPopover = ({ isOpen, password, children }: PasswordRulesPopoverProps) => {
  const failedRules = useMemo(() => {
    const failed = passwordRuleSchema.validate(password, { details: true }) as FailedRule[];
    return new Set(failed.map((rule) => rule.validation));
  }, [password]);

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
            {Object.entries(ruleLabels).map(([rule, label]) => {
              const failed = failedRules.has(rule);

              return (
                <HStack
                  key={rule}
                  color={failed ? "red.600" : "green.700"}
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
