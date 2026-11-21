import { atom, read, update } from 'claude-code'
import type { Register, SessionContextUsage, SessionCost, SessionRateLimit } from 'claude-code'

import type { UsageSnapshot } from '../types'

const snapshot = atom({ plugin: 'usage-band', key: 'snapshot' } as const, null)

type Figures = {
  context: SessionContextUsage
  rateLimits: SessionRateLimit[]
  cost?: SessionCost
}

const toSnapshot = (figures: Figures, model?: string): UsageSnapshot => ({
  model,
  tokens: figures.context.tokens,
  window: figures.context.window,
  percent: figures.context.percent,
  limits: figures.rateLimits.map(limit => ({ kind: limit.kind, percentUsed: limit.percentUsed, resetsAt: limit.resetsAt })),
  usd: figures.cost?.usd,
})

const compact = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M`
  }

  if (tokens >= 1_000) {
    return `${Math.round(tokens / 1_000)}k`
  }

  return String(tokens)
}

// 모델 id('claude-fable-5-2', 'claude-opus-5-5[1m]')를 'Fable 5.2'처럼 읽기 좋게 바꾼다. 모르는 모양이면 id를 그대로 쓴다.
const modelLabel = (id: string): string => {
  const match = /(fable|opus|sonnet|haiku)-(\d+)(?:-(\d{1,2}))?(?!\d)/.exec(id.toLowerCase())

  if (!match) {
    return id
  }

  const [, name = '', major = '', minor] = match
  const family = name.charAt(0).toUpperCase() + name.slice(1)

  return `${family} ${major}${minor ? `.${minor}` : ''}`
}

const MODEL_COLORS: Record<string, 'claude' | 'suggestion' | 'success' | 'permission'> = {
  Fable: 'claude',
  Opus: 'permission',
  Sonnet: 'suggestion',
  Haiku: 'success',
}

const two = (value: number): string => String(value).padStart(2, '0')

// 한도 창이 다시 열리는 시각을 이 PC의 현지 시각 'HH:MM'으로 적는다. 읽을 수 없는 값이면 표시하지 않는다.
const resetClock = (iso?: string): string | undefined => {
  if (!iso) {
    return undefined
  }

  const at = new Date(iso)

  if (Number.isNaN(at.getTime())) {
    return undefined
  }

  return `${two(at.getHours())}:${two(at.getMinutes())}`
}

const LIMIT_LABELS: Record<string, string> = {
  five_hour: '5h',
  seven_day: '7d',
  spend_limit: 'Spend',
}

const BAR_CELLS = 8
// 바가 항목의 맨 앞에 오고 이름은 퍼센트 뒤에 붙는다. 퍼센트는 3칸으로 맞춰 줄이 바뀌어도 이름이 같은 자리에서 시작한다.

// 항목마다 다른 색을 쓴다(테마 키라서 밝은·어두운 테마를 따른다). 85% 이상이면 항목과 관계없이 빨강으로 바꾼다.
const METER_COLORS: Record<string, 'suggestion' | 'claude' | 'success' | 'permission'> = {
  context: 'suggestion',
  five_hour: 'claude',
  seven_day: 'success',
  spend_limit: 'permission',
}

const meterColor = (kind: string, percent: number) => (percent >= 85 ? 'error' : METER_COLORS[kind] ?? 'suggestion')

type Meter = { kind: string; label: string; percent: number; detail?: string }

const meters = (usage: UsageSnapshot): Meter[] => {
  const list: Meter[] = []

  if (usage.tokens !== undefined) {
    const percent = usage.percent ?? Math.round((usage.tokens / usage.window) * 100)
    list.push({ kind: 'context', label: 'Context', percent, detail: `${compact(usage.tokens)}/${compact(usage.window)}` })
  }

  for (const limit of usage.limits) {
    // 5시간 한도에는 리셋 시각을 붙인다.
    const reset = limit.kind === 'five_hour' ? resetClock(limit.resetsAt) : undefined
    list.push({
      kind: limit.kind,
      label: LIMIT_LABELS[limit.kind] ?? limit.kind,
      percent: limit.percentUsed,
      detail: reset ? `Reset ${reset}` : undefined,
    })
  }

  return list
}

export const register: Register = on => {
  // 세션을 시작하거나 mod를 다시 읽을 때: 지금 수치를 한 번 가져온다.
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    const figures = await $.session.usage()
    const model = await $.session.model()
    await update($, snapshot, () => toSnapshot(figures, model))

    return result
  })

  // 턴이 끝날 때마다(그리고 한도 창이 움직일 때) 엔진이 수치를 밀어 준다.
  on('session.measure', async ($, e, next) => {
    const model = await $.session.model()
    await update($, snapshot, () => toSnapshot(e, model))

    return next(e)
  })

  // 안전망: 턴이 끝났는데 측정 이벤트가 없었더라도 최신 수치로 맞춘다.
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    const figures = await $.session.usage()
    const model = await $.session.model()
    await update($, snapshot, () => toSnapshot(figures, model))

    return result
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const usage = await read($, snapshot)

    if (e.props.hasSurvey || usage === null) {
      return next(e)
    }

    const { Box, Text } = $.ui.resolve(e)
    const list = meters(usage)
    const model = usage.model ? modelLabel(usage.model) : undefined

    // 항목 하나(이름·바·퍼센트)는 한 줄로 묶어 줄어들지 않게 하고, 폭이 모자라면 항목 단위로 다음 줄에 넘긴다.
    return (
      <Box flexDirection="row" flexWrap="wrap" columnGap={2}>
        {model ? (
          <Box flexDirection="row" flexShrink={0}>
            <Text color={MODEL_COLORS[model.split(' ')[0] ?? ''] ?? 'suggestion'} bold wrap="truncate-end">◆ {model}</Text>
          </Box>
        ) : null}
        {list.length === 0 ? <Text dimColor>Context window {compact(usage.window)} (usage appears after the first reply)</Text> : null}
        {list.map(meter => {
          const clamped = Math.max(0, Math.min(100, meter.percent))
          const filled = Math.max(clamped > 0 ? 1 : 0, Math.round((clamped / 100) * BAR_CELLS))
          const color = meterColor(meter.kind, clamped)

          return (
            <Box key={meter.kind} flexDirection="row" flexShrink={0}>
              <Text wrap="truncate-end">
                <Text color={color}>{'█'.repeat(filled)}</Text>
                <Text color="subtle">{'░'.repeat(BAR_CELLS - filled)}</Text>
                <Text color={color} bold> {String(Math.round(meter.percent)).padStart(3, ' ')}%</Text>
                <Text dimColor> {meter.label}</Text>
                {meter.detail ? <Text dimColor> {meter.detail}</Text> : null}
              </Text>
            </Box>
          )
        })}
      </Box>
    )
  })
}
