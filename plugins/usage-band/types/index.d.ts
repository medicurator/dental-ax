export type UsageLimit = { kind: string; percentUsed: number; resetsAt?: string }

export type UsageSnapshot = {
  model?: string
  tokens?: number
  window: number
  percent?: number
  limits: UsageLimit[]
  usd?: number
}

declare module 'claude-code' {
  interface PluginState {
    'usage-band': { snapshot: UsageSnapshot | null }
  }
}
