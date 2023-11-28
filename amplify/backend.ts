import { defineBackend } from '@aws-amplify/backend';
import { FunctionUrlAuthType, HttpMethod } from 'aws-cdk-lib/aws-lambda';
import { readerApi } from './functions/reader-api/resource';

const backend = defineBackend({ readerApi });

// Public, read-only HTTPS endpoint for the reader API.
const url = backend.readerApi.resources.lambda.addFunctionUrl({
  authType: FunctionUrlAuthType.NONE,
  cors: {
    allowedOrigins: ['*'],
    allowedMethods: [HttpMethod.GET],
    allowedHeaders: ['*'],
  },
});

// Exposed in amplify_outputs.json -> read at build time as VITE_READER_API
backend.addOutput({
  custom: { readerApiUrl: url.url },
});
