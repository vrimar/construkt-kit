import { defineConfig } from 'orval'

export default defineConfig({
  b3Api: {
    input: process.env.OPENAPI_SPEC_URL ?? './openapi.json',
    output: {
      mode: 'tags-split',
      target: './src/generated',
      client: 'react-query',
      override: {
        mutator: { path: './src/client.ts', name: 'createApiClient' },
      },
    },
  },
})
