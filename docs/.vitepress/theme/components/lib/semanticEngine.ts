/**
 * 规则硬绑定语义引擎：扫描评语与 rules.md 能力字典关键词，输出结构化命中（模拟服务端返回）
 */
import type { CompetencySemanticHit } from '../types'
import { COMPETENCY_SOURCES, parseScaleBands, type CompetencySourceRow, type OrgLevel } from '../competencyRules'

/** 额外短语 → 能力 rowKey（与 competencyRules 中 rowKey 一致） */
function pickEvidence(text: string, needle: string): string {
  const i = text.indexOf(needle)
  if (i < 0) return needle
  const start = Math.max(0, i - 20)
  const end = Math.min(text.length, i + needle.length + 40)
  const s = text.slice(start, end).replace(/\s+/g, ' ').trim()
  return s.length > 80 ? s.slice(0, 79) + '…' : s
}

function bandLabelForScore(s: number): string {
  if (s <= 1) return '0-1'
  if (s <= 3) return '2-3'
  if (s <= 5) return '4-5'
  return '6-7'
}

function applyPhraseHints(text: string, row: CompetencySourceRow, s: number): number {
  let x = s
  if (row.rowKey === 'junior-zeren') {
    if (/担责|不推诿|勇于负责|主动承担/.test(text)) x += 1
    if (/推卸责任|消极应对|回避问题|推诿/.test(text)) x -= 2
  }
  if (row.rowKey === 'junior-xuexi') {
    if (/主动学习|快速掌握|应用实践/.test(text)) x += 1
    if (/安于现状|学用脱节|学习缓慢/.test(text)) x -= 2
  }
  if (row.rowKey === 'mid-chuangxin') {
    if (/创新|迭代|试点|新观点/.test(text)) x += 1
    if (/墨守成规|抗拒变化|缺乏创新/.test(text)) x -= 2
  }
  if (row.rowKey === 'sen-juece') {
    if (/果断决策|风险评估|战略/.test(text)) x += 1
    if (/犹豫不决|短视/.test(text)) x -= 1
  }
  return x
}

function scoreOneRow(text: string, row: CompetencySourceRow): { score: number; evidence: string; matched: boolean } {
  const s0 = 3
  let s = s0
  let evidence = ''
  let matched =
    row.positive.some(p => p && text.includes(p)) || row.negative.some(n => n && text.includes(n))
  for (const p of row.positive) {
    if (p && text.includes(p)) {
      s += 1
      if (!evidence) evidence = pickEvidence(text, p)
    }
  }
  for (const n of row.negative) {
    if (n && text.includes(n)) {
      s -= 2
      if (!evidence) evidence = pickEvidence(text, n)
    }
  }
  const beforePhrase = s
  s = applyPhraseHints(text, row, s)
  if (s !== beforePhrase) matched = true
  const score = Math.max(0, Math.min(7, Math.round(s)))
  if (!evidence && score !== 3) {
    const bands = parseScaleBands(row.scaleText)
    evidence = bands.find(b => b.label === bandLabelForScore(score))?.text.slice(0, 60) ?? ''
  }
  return { score, evidence: evidence || '—', matched }
}

/** 返回可序列化的「类接口」结构 + rowKey→推荐分 */
export function semanticScanComment(text: string, org: OrgLevel): {
  hits: CompetencySemanticHit[]
  scores: Record<string, number>
  jsonRows: Record<string, unknown>[]
} {
  const raw = text || ''
  const rows = COMPETENCY_SOURCES[org]
  const hits: CompetencySemanticHit[] = []
  const scores: Record<string, number> = {}

  for (const row of rows) {
    const { score, evidence, matched } = scoreOneRow(raw, row)
    scores[row.rowKey] = score
    if (raw.length >= 8 && matched) {
      hits.push({
        rowKey: row.rowKey,
        competencyName: row.competencyName,
        命中项: row.competencyName,
        匹配证据: evidence,
        推荐分数: score,
        档位标签: bandLabelForScore(score)
      })
    }
  }

  const jsonRows = hits.map(h => ({
    命中项: h.命中项,
    rowKey: h.rowKey,
    匹配证据: h.匹配证据,
    推荐分数: h.推荐分数,
    档位标签: h.档位标签
  }))

  return { hits, scores, jsonRows }
}

export function semanticScanToPromptPayload(text: string, org: OrgLevel) {
  const rows = COMPETENCY_SOURCES[org].map(r => ({
    rowKey: r.rowKey,
    能力项: r.competencyName,
    定义: r.definition,
    正向指标: r.positive,
    负向指标: r.negative
  }))
  return { 评语: text, 能力项定义: rows }
}
