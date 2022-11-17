/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly TEST_STACKBLITZ_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
