import { Box, Stack, Text } from "@construkt-kit/ui";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showTitle?: boolean;
  logo: ReactNode;
}

export const AuthLayout = ({ children, showTitle, title, description, logo }: AuthLayoutProps) => {
  return (
    <Box
      display="flex"
      minHeight="100%"
      height="100%"
      width="100%"
      px={{ base: "4", md: "6" }}
      py={{ base: "10", md: "16" }}
      bg="bg.subtle"
      position="relative"
      justifyContent="center"
      alignItems="center"
      overflow="hidden"
    >
      <Box
        position="absolute"
        inset="0"
        pointerEvents="none"
        style={{
          background: "rgba(255, 255, 255, 0.16)",
        }}
      />
      <Box
        position="absolute"
        inset="0"
        opacity="0.42"
        pointerEvents="none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0 0, rgba(15, 23, 42, 0.09) 1.8px, transparent 1.95px), linear-gradient(rgba(15, 23, 42, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(15, 23, 42, 0.055) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <Box
        position="absolute"
        inset="0"
        pointerEvents="none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(255, 255, 255, 0.78) 0%, rgba(255, 255, 255, 0.44) 18%, rgba(255, 255, 255, 0.12) 34%, transparent 62%)",
        }}
      />
      <Box
        position="absolute"
        inset={{ base: "4", md: "6" }}
        borderWidth="1px"
        borderColor="border.default"
        borderRadius="xl"
        opacity="0.35"
        pointerEvents="none"
      />
      <Stack
        alignItems="center"
        position="relative"
        zIndex="1"
        width="100%"
        maxWidth="400px"
        gap="6"
        style={{
          transform: "translateY(clamp(-32px, -3vh, 0px))",
        }}
      >
        <Box>{logo}</Box>
        <Box
          bg="bg"
          borderRadius="xl"
          borderWidth="1px"
          borderColor="border.default"
          p={{ base: "6", md: "8" }}
          width="100%"
          style={{
            boxShadow: "0 10px 24px rgba(15, 23, 42, 0.07), 0 2px 6px rgba(15, 23, 42, 0.04)",
          }}
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
  );
};
