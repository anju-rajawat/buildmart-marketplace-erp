/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WA_TOKEN?: string
  readonly VITE_WA_PHONE_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
