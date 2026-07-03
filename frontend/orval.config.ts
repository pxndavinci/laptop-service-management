import { defineConfig } from 'orval';

export default defineConfig({
  KSTech: {
    input: {
      target: '../backend/src/doc/swaggerdoc.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/api/model',
      client: 'react-query',
      baseUrl: 'http://localhost:3000'
    },
  },
});