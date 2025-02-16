import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

// Register the ts-node transpiler for TypeScript files
register('ts-node/register/transpile-only', pathToFileURL('./'));

