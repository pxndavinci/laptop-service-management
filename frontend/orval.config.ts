import { defineConfig } from 'orval';

export default defineConfig({
  KSTech: {
    input: {
      target: '../backend/src/openapi/openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/model',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/lib/api/mutator.ts',
          name: 'customInstance',
        },
      },
    },
  },
});
