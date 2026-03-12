import "@fontsource-variable/inter";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initialize, mswLoader } from "msw-storybook-addon";
import type { Preview } from "@storybook/react";
import { ThemeProvider, designSystem } from "@b3/ui";

initialize();

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
    (Story) => (
      <QueryClientProvider client={createTestQueryClient()}>
        <ThemeProvider value={designSystem}>
          <Story />
        </ThemeProvider>
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
