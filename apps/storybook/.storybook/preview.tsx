import "@fontsource-variable/inter";
import "./storybook.css";
import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const preview: Preview = {
  decorators: [
    (Story: () => ReactElement) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
    // Toolbar toggle adds the `dark` class to the preview <html> (matches the preset's `.dark &` condition).
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
      parentSelector: "html",
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    viewport: { options: INITIAL_VIEWPORTS },
  },
  initialGlobals: {
    // Fluid/responsive canvas by default; the toolbar lets you pick a device.
    viewport: { value: undefined, isRotated: false },
  },
};

export default preview;
