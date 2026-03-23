/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 项目 Settings → API → Project URL */
  readonly VITE_SUPABASE_URL: string
  /** 项目 Settings → API → anon public key */
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
