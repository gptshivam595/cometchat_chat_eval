import { defineConfig, searchForWorkspaceRoot } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

/**
 * Vite replaces Create React App as this app's toolchain.
 *
 * Why: react-scripts 5 is unmaintained and its transitive `schema-utils`/`ajv` graph no longer
 * resolves — the dev server refuses to start with "Cannot find module 'ajv/dist/compile/codegen'"
 * regardless of override scoping. It is also the toolchain customers inherit when they download
 * this app, and `uikit-react/sample-app` (the source of `src/CometChat/`) is already on Vite, so
 * this aligns the two.
 *
 * Deliberately unchanged: the entry stays `src/index.tsx` (not Vite's usual `src/main.tsx`)
 * because the dashboard's export patcher finds the credentials block via
 * `path.endsWith('index.tsx')`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // The app imports the sample app as "CometChat/..." — CRA resolved this through
    // `baseUrl: ./src`, which Vite does not read, so it is declared explicitly here.
    // Mirrors the `paths` entry in tsconfig.json; keep the two in step.
    alias: [{ find: /^CometChat\/(.*)$/, replacement: resolve(__dirname, 'src/CometChat/$1') }],
    /**
     * Force a single copy of each shared package.
     *
     * Without this, a locally-linked UI Kit brings its own nested `node_modules`, and
     * `CometChatUIKit.init()` initialises a *different* SDK instance than the app later calls —
     * which surfaces as `TypeError: Cannot read properties of undefined (reading 'get')`.
     * Same list as `uikit-react/sample-app/vite.config.ts`.
     */
    dedupe: [
      '@cometchat/chat-sdk-javascript',
      '@cometchat/calls-sdk-javascript',
      'react',
      'react-dom',
    ],
  },
  server: {
    port: 3100,
    fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
  },
  build: {
    // CRA emitted to `build/`; keep that so any downstream packaging/deploy step is unaffected.
    outDir: 'build',
  },
});
