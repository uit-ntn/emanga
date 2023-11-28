import { defineFunction } from '@aws-amplify/backend';

export const readerApi = defineFunction({
  name: 'reader-api',
  entry: './handler.ts',
  runtime: 20,
  timeoutSeconds: 25,
  memoryMB: 512,
});
