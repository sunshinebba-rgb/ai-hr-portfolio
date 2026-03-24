<script setup lang="ts">
/**
 * 业务逻辑对齐 `src/App.tsx`（与仓库内人才盘点 React 应用一致）。
 */
import { ref, computed, watch, onMounted } from 'vue'
import type { TalentRecord, EmployeeInput } from './types'
import { GRID_MAP } from './types'
import { loadRecords, saveRecords, addRecord, deleteRecord } from './lib/storage'
import { runAIAnalysis } from './lib/aiEngine'
import { SEED_RECORDS } from './data/seedData'

type Tab = 'dashboard' | 'list' | 'add' | 'detail'
type View = { tab: Tab; id?: string }
type GridInfo = (typeof GRID_MAP)[string]
type FullRow = TalentRecord & { perf: number; pot: number; pos: string; grid: GridInfo }

const DEPTS = ['产品部', '研发部', '技术部', '市场部', '运营部', '人力行政部', '业务部'] as const
const LEVELS = ['P4', 'P5', 'P6', 'M1', 'M2', '基层', '中层', '高层'] as const
const TENURES = ['1年', '2年', '3年', '5年+'] as const

const statPalette: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#a855f7',
  amber: '#f59e0b'
}

function scoreToGrade(s: number): 1 | 2 | 3 {
  if (s >= 80) return 3
  if (s >= 60) return 2
  return 1
}

function getGridPos(perf: number, pot: number): string {
  return `${scoreToGrade(perf)}-${scoreToGrade(pot)}`
}

function riskFromGrid(g: GridInfo): '高' | '中' | '低' {
  return (g.id === '5' ? '高' : g.id === '4' || g.id === '3' ? '中' : '低') as '高' | '中' | '低'
}

function riskBadgeCls(level?: '高' | '中' | '低') {
  if (!level) return 'text-slate-300'
  return level === '高'
    ? 'bg-red-100 text-red-700'
    : level === '中'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700'
}

const records = ref<TalentRecord[]>([])
const view = ref<View>({ tab: 'dashboard' })
const searchQuery = ref('')
const hrNotes = ref('')
const perfAdj = ref('')
const potAdj = ref('')

const emp = ref<EmployeeInput>({
  id: 'emp-' + Date.now(),
  name: '',
  department: '产品部',
  role: '',
  level: 'P5',
  tenure: '2年',
  performanceScore: 75,
  performanceComment: '',
  keyEvents: '',
  developmentFeedback: ''
})

onMounted(() => {
  const loaded = loadRecords()
  if (loaded.length === 0) {
    saveRecords(SEED_RECORDS)
    records.value = SEED_RECORDS
  } else {
    records.value = loaded
  }
})

const fullData = computed<FullRow[]>(() =>
  records.value.map(r => {
    const perf = r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore
    const pot = r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore
    const pos = r.finalResult?.gridPosition ?? r.aiAnalysis.suggestion.gridPosition
    const grid = GRID_MAP[pos] || GRID_MAP['1-1']
    return { ...r, perf, pot, pos, grid }
  })
)

const highPotential = computed(() =>
  fullData.value.filter(d => d.pos === '3-3' || d.pos === '2-3' || d.pos === '3-2')
)

const atRisk = computed(() =>
  fullData.value.filter(d => d.finalResult?.riskLevel === '高' || d.pos === '1-1')
)

const highPotentialPct = computed(() => {
  const n = fullData.value.length
  if (!n) return '0.0'
  return ((highPotential.value.length / n) * 100).toFixed(1)
})

const deptSummary = computed(() => {
  const depts = [...new Set(records.value.map(r => r.employee.department))]
  return depts.map(name => {
    const members = fullData.value.filter(d => d.employee.department === name)
    const avgP = members.length ? Math.round(members.reduce((a, b) => a + b.perf, 0) / members.length) : 0
    const avgPot = members.length
      ? (members.reduce((a, b) => a + b.pot, 0) / members.length).toFixed(1)
      : '0'
    return { name, members, count: members.length, avgP, avgPot }
  })
})

const selectedRecord = computed<FullRow | null>(() => {
  if (view.value.tab !== 'detail' || !view.value.id) return null
  return fullData.value.find(r => r.employee.id === view.value.id) ?? null
})

const detailGrid = computed(() => {
  const r = selectedRecord.value
  if (!r) return GRID_MAP['2-2']
  return r.grid || GRID_MAP[r.finalResult?.gridPosition ?? '2-2'] || GRID_MAP['2-2']
})

const filteredList = computed(() =>
  fullData.value.filter(
    d => d.employee.name.includes(searchQuery.value) || d.employee.department.includes(searchQuery.value)
  )
)

const gridEntries = computed(() => Object.entries(GRID_MAP) as [string, GridInfo][])

const gridCells = computed(() =>
  gridEntries.value.map(([k, v]) => {
    const list = fullData.value.filter(d => d.pos === k)
    return {
      k,
      v,
      show: list.slice(0, 5),
      more: Math.max(0, list.length - 5),
      count: list.length
    }
  })
)

watch(
  selectedRecord,
  r => {
    if (r) {
      perfAdj.value = String(r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore)
      potAdj.value = String(r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore)
      hrNotes.value = ''
    }
  },
  { immediate: true }
)

watch(
  () => view.value.tab,
  t => {
    if (t === 'add') {
      emp.value = {
        id: 'emp-' + Date.now(),
        name: '',
        department: '产品部',
        role: '',
        level: 'P5',
        tenure: '2年',
        performanceScore: 75,
        performanceComment: '',
        keyEvents: '',
        developmentFeedback: ''
      }
    }
  }
)

function setView(tab: Tab, id = '') {
  view.value = id ? { tab, id } : { tab }
}

function handleSaveRecord(record: TalentRecord) {
  records.value = addRecord(record)
  setView('list')
}

function handleDeleteRecord(id: string) {
  if (typeof window !== 'undefined' && window.confirm('确定删除该人才档案？')) {
    records.value = deleteRecord(id)
    setView('list')
  }
}

function handleRunAI(employee: EmployeeInput) {
  const analysis = runAIAnalysis(employee)
  const pos = getGridPos(analysis.modelJudgment.performanceScore, analysis.modelJudgment.potentialScore)
  const grid = GRID_MAP[pos] || GRID_MAP['1-1']
  const riskLevel = riskFromGrid(grid)
  const record: TalentRecord = {
    employee,
    aiAnalysis: analysis,
    finalResult: {
      performanceScore: analysis.modelJudgment.performanceScore,
      potentialScore: analysis.modelJudgment.potentialScore,
      gridPosition: pos,
      talentTags: analysis.suggestion.talentTags,
      developmentSuggestions: analysis.suggestion.developmentSuggestions ?? [],
      riskLevel,
      evidence: analysis.evidenceSnippets
    }
  }
  records.value = addRecord(record)
  setView('detail', employee.id)
}

function handleSaveCalibration() {
  const record = selectedRecord.value
  if (!record) return

  const perf = Math.max(0, Math.min(100, +perfAdj.value)) || 0
  const pot = Math.max(0, Math.min(100, +potAdj.value)) || 0
  const pos = getGridPos(perf, pot)
  const g = GRID_MAP[pos] || GRID_MAP['1-1']
  const riskLevel = riskFromGrid(g)
  const oldPerf = record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore
  const oldPot = record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore
  const adjusted = [...(record.hrCalibration?.adjusted ?? [])]
  if (perf !== oldPerf)
    adjusted.push({ field: '绩效', from: String(oldPerf), to: String(perf), reason: hrNotes.value || 'HR校准' })
  if (pot !== oldPot)
    adjusted.push({ field: '潜力', from: String(oldPot), to: String(pot), reason: hrNotes.value || 'HR校准' })

  const updated: TalentRecord = {
    employee: record.employee,
    aiAnalysis: record.aiAnalysis,
    hrCalibration: {
      confirmed: record.hrCalibration?.confirmed ?? [],
      adjusted,
      supplements: record.hrCalibration?.supplements ?? [],
      finalDecision: hrNotes.value || record.hrCalibration?.finalDecision || ''
    },
    finalResult: {
      performanceScore: perf,
      potentialScore: pot,
      gridPosition: pos,
      talentTags: record.finalResult?.talentTags ?? record.aiAnalysis.suggestion.talentTags,
      developmentSuggestions:
        record.finalResult?.developmentSuggestions ?? record.aiAnalysis.suggestion.developmentSuggestions ?? [],
      riskLevel,
      evidence: record.finalResult?.evidence ?? record.aiAnalysis.evidenceSnippets
    },
    version: record.version
  }
  handleSaveRecord(updated)
}

function submitNewEmployee() {
  if (!emp.value.name || !emp.value.performanceComment) {
    alert('请填写姓名和绩效评语')
    return
  }
  handleRunAI({ ...emp.value, id: 'emp-' + Date.now() })
}

</script>

<template>
  <div
    class="talent-saas not-prose min-h-[560px] w-full overflow-x-auto rounded-xl border border-slate-200/80 bg-slate-100 text-left shadow-sm"
  >
    <!-- 侧栏 #0f172a -->
    <div class="flex min-h-[560px] font-sans text-slate-800">
      <aside
        class="flex w-56 shrink-0 flex-col border-r border-slate-800/80 bg-[#0f172a] px-4 pb-4 pt-6 text-slate-100"
      >
        <div class="mb-8 flex items-center gap-2 px-1">
          <div
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-sm font-bold text-white shadow-inner"
          >
            HR
          </div>
          <div class="min-w-0">
            <div class="truncate text-sm font-semibold tracking-tight">人才盘点</div>
            <div class="text-[10px] uppercase tracking-wider text-slate-400">Talent Review</div>
          </div>
        </div>

        <nav class="flex flex-1 flex-col gap-1">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              view.tab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
            @click="setView('dashboard')"
          >
            <span class="text-base">📊</span> 仪表盘总览
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              view.tab === 'list'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
            @click="setView('list')"
          >
            <span class="text-base">👥</span> 人才信息列表
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              view.tab === 'add'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
            @click="setView('add')"
          >
            <span class="text-base">➕</span> 新建人才档案
          </button>
        </nav>

        <div class="mt-auto border-t border-slate-700/80 pt-4">
          <div class="flex items-center gap-3 px-1">
            <div
              class="h-9 w-9 max-h-10 max-w-[2.5rem] shrink-0 overflow-hidden rounded-full border-2 border-slate-600 bg-gradient-to-br from-indigo-400 to-violet-600 text-center text-xs font-bold leading-9 text-white"
              style="min-width: 32px; min-height: 32px; max-width: 40px; max-height: 40px"
            >
              朱
            </div>
            <div class="min-w-0 flex-1">
              <div class="truncate text-sm font-medium">朱雅曼</div>
              <div class="truncate text-[11px] text-slate-400">HR 管理员</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- 主内容 -->
      <main class="min-w-0 flex-1 overflow-y-auto bg-slate-100 p-6 lg:p-8">
        <!-- 详情 -->
        <template v-if="view.tab === 'detail' && selectedRecord">
          <div class="mx-auto max-w-5xl">
            <button
              type="button"
              class="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              @click="setView('list')"
            >
              ← 返回列表
            </button>

            <div class="flex flex-col gap-6 lg:flex-row">
              <div
                class="w-full shrink-0 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm lg:w-80"
              >
                <div
                  class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-2xl font-bold text-white shadow-md"
                >
                  {{ selectedRecord.employee.name.slice(0, 1) }}
                </div>
                <h2 class="mt-4 text-xl font-bold text-slate-900">{{ selectedRecord.employee.name }}</h2>
                <p class="text-sm text-slate-500">
                  {{ selectedRecord.employee.department }} · {{ selectedRecord.employee.role }}
                </p>
                <div
                  class="mt-4 rounded-xl p-3 text-sm font-semibold shadow-inner"
                  :style="{ backgroundColor: detailGrid.bg, color: detailGrid.color }"
                >
                  {{ detailGrid.label }} · {{ detailGrid.category }}
                </div>
                <div class="mt-4 text-left">
                  <div class="mb-1 flex justify-between text-sm">
                    <span class="text-slate-500">绩效</span>
                    <b>{{
                      selectedRecord.finalResult?.performanceScore ??
                      selectedRecord.aiAnalysis.modelJudgment.performanceScore
                    }}/100</b>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full bg-blue-500 transition-all"
                      :style="{
                        width: `${
                          selectedRecord.finalResult?.performanceScore ??
                          selectedRecord.aiAnalysis.modelJudgment.performanceScore
                        }%`
                      }"
                    />
                  </div>
                </div>
                <div class="mt-3 text-left">
                  <div class="mb-1 flex justify-between text-sm">
                    <span class="text-slate-500">潜力</span>
                    <b>{{
                      selectedRecord.finalResult?.potentialScore ??
                      selectedRecord.aiAnalysis.modelJudgment.potentialScore
                    }}/100</b>
                  </div>
                  <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      class="h-full rounded-full bg-violet-500 transition-all"
                      :style="{
                        width: `${
                          selectedRecord.finalResult?.potentialScore ??
                          selectedRecord.aiAnalysis.modelJudgment.potentialScore
                        }%`
                      }"
                    />
                  </div>
                </div>
                <div class="mt-4">
                  <span v-if="!selectedRecord.finalResult?.riskLevel" class="text-slate-300">-</span>
                  <span
                    v-else
                    class="inline-block rounded px-2 py-0.5 text-xs font-medium"
                    :class="riskBadgeCls(selectedRecord.finalResult.riskLevel)"
                    >{{ selectedRecord.finalResult.riskLevel }}</span
                  >
                </div>
              </div>

              <div class="min-w-0 flex-1 space-y-4">
                <div class="flex justify-end">
                  <button
                    type="button"
                    class="rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    @click="handleDeleteRecord(selectedRecord.employee.id)"
                  >
                    删除档案
                  </button>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
                    <h3 class="text-base font-bold text-slate-900">AI 分析结果</h3>
                    <span class="text-xs text-slate-400"
                      >置信度 绩效:{{ selectedRecord.aiAnalysis.modelJudgment.confidence.performance }} 潜力:{{
                        selectedRecord.aiAnalysis.modelJudgment.confidence.potential
                      }}</span
                    >
                  </div>
                  <div class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <div class="mb-1 text-slate-500">能力词提取</div>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="(w, i) in selectedRecord.aiAnalysis.featureExtraction.abilityWords"
                          :key="'aw-' + i"
                          class="rounded bg-blue-50 px-2 py-1 text-blue-700"
                          >{{ w }}</span
                        >
                        <span
                          v-if="selectedRecord.aiAnalysis.featureExtraction.abilityWords.length === 0"
                          class="text-slate-300"
                          >-</span
                        >
                      </div>
                    </div>
                    <div>
                      <div class="mb-1 text-slate-500">改进点 / 风险信号</div>
                      <div class="flex flex-wrap gap-2">
                        <template
                          v-for="(w, i) in [
                            ...selectedRecord.aiAnalysis.featureExtraction.emotionWords,
                            ...selectedRecord.aiAnalysis.featureExtraction.improvementPoints
                          ]"
                          :key="'im-' + i"
                        >
                          <span class="rounded bg-amber-50 px-2 py-1 text-amber-800">{{ w }}</span>
                        </template>
                        <span
                          v-if="
                            selectedRecord.aiAnalysis.featureExtraction.emotionWords.length === 0 &&
                            selectedRecord.aiAnalysis.featureExtraction.improvementPoints.length === 0
                          "
                          class="text-slate-300"
                          >-</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="mt-4">
                    <div class="mb-1 text-slate-500">证据片段</div>
                    <ul class="list-inside list-disc text-sm text-slate-700">
                      <li v-for="(s, i) in selectedRecord.aiAnalysis.evidenceSnippets" :key="'ev-' + i">{{ s }}</li>
                    </ul>
                  </div>
                  <div
                    v-if="selectedRecord.aiAnalysis.suggestion.riskTip"
                    class="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
                  >
                    {{ selectedRecord.aiAnalysis.suggestion.riskTip }}
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="mb-4 text-base font-bold text-slate-900">HR 校准</h3>
                  <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label class="text-sm text-slate-500">绩效评分</label>
                      <input
                        v-model="perfAdj"
                        type="number"
                        min="0"
                        max="100"
                        class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div>
                      <label class="text-sm text-slate-500">潜力评分</label>
                      <input
                        v-model="potAdj"
                        type="number"
                        min="0"
                        max="100"
                        class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>
                  <div class="mb-4">
                    <label class="text-sm text-slate-500">校准理由/决策依据</label>
                    <textarea
                      v-model="hrNotes"
                      rows="2"
                      class="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="记录 HR 调整原因..."
                    />
                  </div>
                  <button
                    type="button"
                    class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                    @click="handleSaveCalibration"
                  >
                    保存校准结果
                  </button>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 class="mb-3 text-base font-bold text-slate-900">人才标签与发展建议</h3>
                  <div class="mb-4 flex flex-wrap gap-2">
                    <span
                      v-for="(tag, i) in selectedRecord.finalResult?.talentTags ??
                      selectedRecord.aiAnalysis.suggestion.talentTags"
                      :key="'tag-' + i"
                      class="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700"
                      >{{ tag }}</span
                    >
                  </div>
                  <ul
                    v-if="
                      selectedRecord.finalResult?.developmentSuggestions &&
                      selectedRecord.finalResult.developmentSuggestions.length > 0
                    "
                    class="list-inside list-disc space-y-1 text-sm text-slate-600"
                  >
                    <li v-for="(s, i) in selectedRecord.finalResult.developmentSuggestions" :key="'dev-' + i">{{ s }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 新建 -->
        <template v-else-if="view.tab === 'add'">
          <div class="mx-auto max-w-3xl">
            <button
              type="button"
              class="mb-4 text-sm font-medium text-indigo-600 hover:underline"
              @click="setView('list')"
            >
              ← 返回列表
            </button>
            <div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <h2 class="mb-6 text-xl font-bold text-slate-900">新建人才档案 · 输入数据后由 AI 分析</h2>

              <div class="mb-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">姓名 *</label>
                  <input
                    v-model="emp.name"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="张三"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">部门</label>
                  <select
                    v-model="emp.department"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option v-for="d in DEPTS" :key="d" :value="d">{{ d }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">岗位</label>
                  <input
                    v-model="emp.role"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="产品经理"
                  />
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">职级</label>
                  <select
                    v-model="emp.level"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option v-for="l in LEVELS" :key="l" :value="l">{{ l }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">入职时长</label>
                  <select
                    v-model="emp.tenure"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option v-for="t in TENURES" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div>
                  <label class="mb-1 block text-sm font-medium text-slate-600">绩效评分 (0-100)</label>
                  <input
                    v-model.number="emp.performanceScore"
                    type="number"
                    min="0"
                    max="100"
                    class="w-full rounded-lg border border-slate-200 px-4 py-2 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label class="mb-1 block text-sm font-medium text-slate-600">绩效评语 *</label>
                <textarea
                  v-model="emp.performanceComment"
                  rows="4"
                  class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="管理者撰写的定性评价…"
                />
              </div>
              <div class="mb-4">
                <label class="mb-1 block text-sm font-medium text-slate-600">关键事件</label>
                <textarea
                  v-model="emp.keyEvents"
                  rows="2"
                  class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <div class="mb-6">
                <label class="mb-1 block text-sm font-medium text-slate-600">发展反馈</label>
                <textarea
                  v-model="emp.developmentFeedback"
                  rows="2"
                  class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  class="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700"
                  @click="submitNewEmployee"
                >
                  🤖 AI 分析并保存
                </button>
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 px-6 py-2.5 font-medium hover:bg-slate-50"
                  @click="setView('list')"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- 列表 -->
        <template v-else-if="view.tab === 'list'">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-6 flex flex-wrap gap-4">
              <input
                v-model="searchQuery"
                placeholder="搜索姓名或部门"
                class="w-full max-w-xs rounded-lg border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-64"
              />
            </div>
            <div class="overflow-x-auto">
              <table class="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr class="border-b-2 border-slate-100 text-slate-500">
                    <th class="px-3 py-3 font-medium">姓名</th>
                    <th class="px-3 py-3 font-medium">部门</th>
                    <th class="px-3 py-3 font-medium">职级</th>
                    <th class="px-3 py-3 font-medium">绩效分</th>
                    <th class="px-3 py-3 font-medium">潜力分</th>
                    <th class="px-3 py-3 font-medium">九宫格</th>
                    <th class="px-3 py-3 font-medium">风险</th>
                    <th class="px-3 py-3 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="r in filteredList"
                    :key="r.employee.id"
                    class="border-b border-slate-50 transition-colors hover:bg-slate-50/80"
                  >
                    <td class="px-3 py-4 font-medium text-slate-900">{{ r.employee.name }}</td>
                    <td class="px-3 py-4 text-slate-600">{{ r.employee.department }}</td>
                    <td class="px-3 py-4 text-slate-600">{{ r.employee.level }} {{ r.employee.role }}</td>
                    <td class="px-3 py-4">{{ r.perf }}</td>
                    <td class="px-3 py-4">{{ r.pot }}</td>
                    <td class="px-3 py-4">
                      <span class="font-medium" :style="{ color: r.grid.color }">{{ r.grid.label }}</span>
                    </td>
                    <td class="px-3 py-4">
                      <span v-if="!r.finalResult?.riskLevel" class="text-slate-300">-</span>
                      <span
                        v-else
                        class="rounded px-2 py-0.5 text-xs font-medium"
                        :class="riskBadgeCls(r.finalResult.riskLevel)"
                        >{{ r.finalResult.riskLevel }}</span
                      >
                    </td>
                    <td class="px-3 py-4">
                      <button
                        type="button"
                        class="text-sm font-medium text-indigo-600 hover:underline"
                        @click="setView('detail', r.employee.id)"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <!-- 仪表盘 -->
        <template v-else>
          <div class="space-y-6">
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white shadow-md"
            >
              <div class="relative z-[1] max-w-2xl">
                <p class="text-xs font-medium uppercase tracking-widest text-indigo-300/90">Dashboard</p>
                <h1 class="mt-2 text-2xl font-bold tracking-tight">AI 驱动人才盘点与绩效校准</h1>
                <p class="mt-2 text-sm text-slate-300">
                  将主观评价变成结构化决策 · 九宫格定位 · 高潜识别 · 风险预警
                </p>
              </div>
              <div
                class="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-indigo-500/20 blur-3xl"
              />
            </div>

            <!-- 统计卡片：含高潜占比 -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div>
                  <div class="text-sm text-slate-500">总人数</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ fullData.length }}</div>
                  <div class="mt-0.5 text-xs text-slate-400">已盘点</div>
                </div>
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  :style="{ backgroundColor: statPalette.blue + '22', color: statPalette.blue }"
                >
                  👥
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div>
                  <div class="text-sm text-slate-500">高潜人数</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ highPotential.length }}</div>
                  <div class="mt-0.5 text-xs text-slate-400">明星 / 骨干格</div>
                </div>
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  :style="{ backgroundColor: statPalette.green + '22', color: statPalette.green }"
                >
                  ⭐
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div>
                  <div class="text-sm text-slate-500">高潜占比</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ highPotentialPct }}%</div>
                  <div class="mt-0.5 text-xs text-slate-400">占盘点总人数</div>
                </div>
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  :style="{ backgroundColor: statPalette.amber + '22', color: statPalette.amber }"
                >
                  📈
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div>
                  <div class="text-sm text-slate-500">风险预警</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ atRisk.length }}</div>
                  <div class="mt-0.5 text-xs text-slate-400">需关注</div>
                </div>
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  :style="{ backgroundColor: statPalette.red + '22', color: statPalette.red }"
                >
                  ⚠️
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm"
              >
                <div>
                  <div class="text-sm text-slate-500">部门数</div>
                  <div class="mt-1 text-2xl font-bold text-slate-900">{{ deptSummary.length }}</div>
                  <div class="mt-0.5 text-xs text-slate-400">覆盖</div>
                </div>
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-2xl"
                  :style="{ backgroundColor: statPalette.purple + '22', color: statPalette.purple }"
                >
                  🏢
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <!-- 9-Box 矩阵 -->
              <div class="xl:col-span-2">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div class="mb-4 flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <h3 class="text-lg font-bold text-slate-900">九宫格人才矩阵</h3>
                      <p class="mt-1 text-xs text-slate-500">绩效 × 潜力 · 与 GRID_MAP 键顺序一致（与 React 版相同）</p>
                    </div>
                  </div>

                  <div class="mb-2 flex justify-between px-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    <span>绩效：低 → 高（列）</span>
                    <span>潜力：低 → 高（行）</span>
                  </div>

                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="{ k, v, show, more, count } in gridCells"
                      :key="k"
                      class="group relative flex min-h-[148px] flex-col rounded-xl border-2 bg-white p-3 shadow-sm transition-all"
                      :style="{
                        backgroundColor: v.bg,
                        borderColor: v.color + '55',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
                      }"
                    >
                      <div
                        class="absolute inset-x-0 top-0 h-1 rounded-t-lg opacity-90"
                        :style="{ backgroundColor: v.color }"
                      />
                      <div class="flex items-start justify-between gap-2 pt-1">
                        <div class="min-w-0">
                          <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Cell {{ k }}</div>
                          <div class="truncate text-sm font-bold leading-tight" :style="{ color: v.color }">
                            {{ v.id }} {{ v.label }}
                          </div>
                          <div class="mt-0.5 truncate text-[11px] text-slate-600">{{ v.category }}</div>
                        </div>
                        <span
                          class="shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums text-white shadow-sm"
                          :style="{ backgroundColor: v.color }"
                          >{{ count }}</span
                        >
                      </div>

                      <div class="mt-auto flex min-h-[40px] items-center pt-3">
                        <div v-if="count === 0" class="text-[11px] text-slate-400">暂无人员</div>
                        <div v-else class="flex w-full items-center pl-1">
                          <div class="flex -space-x-2">
                            <button
                              v-for="e in show"
                              :key="e.employee.id"
                              type="button"
                              class="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white text-xs font-bold text-slate-700 shadow-md ring-2 ring-white transition hover:z-20 hover:ring-2 hover:ring-indigo-400"
                              :title="e.employee.name"
                              :style="{ borderColor: v.color + '66' }"
                              @click="setView('detail', e.employee.id)"
                            >
                              {{ e.employee.name.slice(0, 1) }}
                            </button>
                            <div
                              v-if="more > 0"
                              class="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 ring-2 ring-white"
                            >
                              +{{ more }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 class="mb-3 font-bold text-slate-800">🏢 部门人才分布</h4>
                  <div v-for="d in deptSummary" :key="d.name" class="mb-4 last:mb-0">
                    <div class="flex justify-between text-sm">
                      <span class="text-slate-600">{{ d.name }}</span><b class="text-slate-900">{{ d.count }} 人</b>
                    </div>
                    <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        class="h-full rounded-full bg-slate-700 transition-all"
                        :style="{ width: fullData.length ? `${(d.count / fullData.length) * 100}%` : '0%' }"
                      />
                    </div>
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 class="mb-3 font-bold text-slate-800">⚠️ 风险预警 ({{ atRisk.length }})</h4>
                  <div class="space-y-2">
                    <button
                      v-for="r in atRisk.slice(0, 5)"
                      :key="r.employee.id"
                      type="button"
                      class="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-red-50"
                      @click="setView('detail', r.employee.id)"
                    >
                      <span class="font-medium text-slate-900">{{ r.employee.name }}</span>
                      <span class="ml-2 text-slate-500">{{ r.employee.department }}</span>
                    </button>
                  </div>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h4 class="mb-3 font-bold text-slate-800">⭐ 高潜人才 ({{ highPotential.length }})</h4>
                  <div class="space-y-2">
                    <button
                      v-for="r in highPotential.slice(0, 5)"
                      :key="r.employee.id"
                      type="button"
                      class="block w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-emerald-50"
                      @click="setView('detail', r.employee.id)"
                    >
                      <span class="font-medium text-slate-900">{{ r.employee.name }}</span>
                      <span class="ml-2 text-slate-500">{{ r.employee.department }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.talent-saas :deep(table) {
  border: none;
  border-collapse: separate;
  border-spacing: 0;
}
.talent-saas :deep(thead tr) {
  background: transparent;
}
</style>
