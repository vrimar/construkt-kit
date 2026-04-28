import "@fontsource-variable/inter";
import "./storybook.css";
import type { Preview } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { ReactElement } from "react";

const storybookBasePath = import.meta.env.BASE_URL || "/";

initialize({
  serviceWorker: {
    url: `${storybookBasePath}mockServiceWorker.js`,
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
  },
};

export default preview;
