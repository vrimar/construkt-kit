import "@fontsource-variable/inter";
import "./storybook.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { ReactElement } from "react";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

initialize({
  serviceWorker: {
    url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
  },
});

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

const preview: Preview = {
  loaders: [mswLoader],
  decorators: [
    (Story: () => ReactElement) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <Story />
      </QueryClientProvider>
    ),
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
