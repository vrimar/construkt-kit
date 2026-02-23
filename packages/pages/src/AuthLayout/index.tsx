import { Box, Logo, Stack, Text } from "@b3/ui";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  showTitle?: boolean;
  logo?: ReactNode;
}

export const AuthLayout = ({ children, showTitle, title, logo }: AuthLayoutProps) => {
  const logoEl = logo ?? <Logo width={200} />;

  return (
    <Box
      display="flex"
      height="100%"
      width="100%"
      bg="bg.subtle"
      justifyContent="center"
      alignItems="center"
    >
      <Stack>
        {logoEl}
        <Stack gap="5">
          {showTitle && title && (
            <Text
              fontSize="2xl"
              mb="5"
              textAlign="center"
            >
              {title}
            </Text>
          )}
          <Box
            width="320px"
            maxWidth="320px"
          >
            {children}
          </Box>
        </Stack>
      </Stack>
    </Box>
  );
};
