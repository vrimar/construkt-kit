import { Box, Stack, Text } from "@construkt-kit/ui";
import type { ReactNode } from "react";

export interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showTitle?: boolean;
  logo: ReactNode;
}

export const AuthLayout = ({ children, showTitle, title, description, logo }: AuthLayoutProps) => {
  return (
    <Box
      minHeight="100%"
      height="100%"
      width="100%"
      bg="bg.subtle"
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        opacity="0.55"
        pointerEvents="none"
        backgroundImage="linear-gradient(token(colors.border) 1px, transparent 1px), linear-gradient(90deg, token(colors.border) 1px, transparent 1px)"
        backgroundSize="40px 40px"
        backgroundPosition="center"
        maskImage="radial-gradient(ellipse 62% 68% at 50% 46%, token(colors.black) 12%, transparent 74%)"
      />
      <Box
        position="relative"
        zIndex="1"
        display="flex"
        height="100%"
        overflowY="auto"
        px={{ base: "4", md: "6" }}
        py={{ base: "10", md: "16" }}
      >
        <Stack
          alignItems="center"
          width="100%"
          maxWidth="400px"
          gap="6"
          m="auto"
          style={{
            transform: "translateY(clamp(-32px, -3vh, 0px))",
          }}
        >
          <Box>{logo}</Box>
          <Box
            bg="bg"
            borderRadius="xl"
            borderWidth="1px"
            borderColor="border"
            p={{ base: "6", md: "8" }}
            width="100%"
            boxShadow="sm"
          >
            <Stack gap="6">
              {showTitle && title && (
                <Stack
                  gap="2"
                  alignItems="center"
                >
                  <Text
                    fontSize="2xl"
                    fontWeight="semibold"
                    textAlign="center"
                  >
                    {title}
                  </Text>
                  {description && (
                    <Text
                      color="fg.muted"
                      textAlign="center"
                    >
                      {description}
                    </Text>
                  )}
                </Stack>
              )}
              {children}
            </Stack>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};
