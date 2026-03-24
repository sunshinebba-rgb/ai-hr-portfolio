<script setup lang="ts">
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

function scoreToGrade(s: number): 1 | 2 | 3 {
  if (s >= 80) return 3
  if (s >= 60) return 2
  return 1
}

function getGridPos(perf: number, pot: number): string {
  return `${scoreToGrade(perf)}-${scoreToGrade(pot)}`
}

function riskLevelFromGrid(g: GridInfo): '高' | '中' | '低' {
  return (g.id === '5' ? '高' : g.id === '4' || g.id === '3' ? '中' : '低') as '高' | '中' | '低'
}

function cleanRecord(r: FullRow): TalentRecord {
  return {
    employee: r.employee,
    aiAnalysis: r.aiAnalysis,
    hrCalibration: r.hrCalibration,
    finalResult: r.finalResult,
    version: r.version
  }
}

function riskBadgeClass(level: '高' | '中' | '低'): string {
  return level === '高'
    ? 'bg-red-100 text-red-700'
    : level === '中'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-green-100 text-green-700'
}

const statColors: Record<string, string> = {
  blue: '#1890ff',
  green: '#52c41a',
  red: '#f5222d',
  purple: '#722ed1'
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

const fullData = computed<FullRow[]>(() => {
  return records.value.map(r => {
    const perf = r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore
    const pot = r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore
    const pos = r.finalResult?.gridPosition ?? r.aiAnalysis.suggestion.gridPosition
    const grid = GRID_MAP[pos] || GRID_MAP['1-1']
    return { ...r, perf, pot, pos, grid }
  })
})

const highPotential = computed(() =>
  fullData.value.filter(d => d.pos === '3-3' || d.pos === '2-3' || d.pos === '3-2')
)

const atRisk = computed(() =>
  fullData.value.filter(d => d.finalResult?.riskLevel === '高' || d.pos === '1-1')
)

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

const filteredList = computed(() =>
  fullData.value.filter(
    d => d.employee.name.includes(searchQuery.value) || d.employee.department.includes(searchQuery.value)
  )
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
  const riskLevel = riskLevelFromGrid(grid)
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
  const riskLevel = riskLevelFromGrid(g)
  const oldPerf = record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore
  const oldPot = record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore
  const adjusted = [...(record.hrCalibration?.adjusted ?? [])]
  if (perf !== oldPerf)
    adjusted.push({ field: '绩效', from: String(oldPerf), to: String(perf), reason: hrNotes.value || 'HR校准' })
  if (pot !== oldPot)
    adjusted.push({ field: '潜力', from: String(oldPot), to: String(pot), reason: hrNotes.value || 'HR校准' })

  const updated: TalentRecord = {
    ...cleanRecord(record),
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
    }
  }
  handleSaveRecord(updated)
}

function submitNewEmployee() {
  if (!emp.value.name || !emp.value.performanceComment) {
    alert('请填写姓名和绩效评语')
    return
  }
  const copy = { ...emp.value, id: 'emp-' + Date.now() }
  handleRunAI(copy)
}

const gridEntries = computed(() => Object.entries(GRID_MAP) as [string, GridInfo][])
</script>

<template>
  <div class="talent-app min-h-screen flex bg-slate-50 font-sans text-slate-900">
    <nav class="w-56 bg-slate-900 text-white p-6 shrink-0">
      <h2 class="text-lg font-bold mb-10">人才盘点系统</h2>
      <div class="space-y-2">
        <button
          type="button"
          class="w-full text-left px-4 py-3 rounded-lg transition-colors"
          :class="
            view.tab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          "
          @click="setView('dashboard')"
        >
          📊 仪表盘总览
        </button>
        <button
          type="button"
          class="w-full text-left px-4 py-3 rounded-lg transition-colors"
          :class="view.tab === 'list' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
          @click="setView('list')"
        >
          👥 人才信息列表
        </button>
        <button
          type="button"
          class="w-full text-left px-4 py-3 rounded-lg transition-colors"
          :class="view.tab === 'add' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'"
          @click="setView('add')"
        >
          ➕ 新建人才档案
        </button>
      </div>
      <div class="mt-12 text-xs text-slate-400">AI 驱动 · 绩效校准</div>
    </nav>

    <main class="flex-1 p-8 overflow-y-auto">
      <!-- 详情 -->
      <template v-if="view.tab === 'detail' && selectedRecord">
        <div class="max-w-5xl mx-auto">
          <button type="button" class="text-blue-600 hover:underline mb-4" @click="setView('list')">← 返回列表</button>

          <div class="flex gap-6">
            <div class="w-80 shrink-0 bg-white rounded-2xl p-6 shadow-sm text-center">
              <div
                class="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold mx-auto"
              >
                {{ selectedRecord.employee.name.slice(0, 1) }}
              </div>
              <h2 class="text-xl font-bold mt-4">{{ selectedRecord.employee.name }}</h2>
              <p class="text-slate-500 text-sm">
                {{ selectedRecord.employee.department }} · {{ selectedRecord.employee.role }}
              </p>
              <div
                class="mt-4 p-3 rounded-xl text-sm font-medium"
                :style="{ backgroundColor: selectedRecord.grid.bg, color: selectedRecord.grid.color }"
              >
                {{ selectedRecord.grid.label }} · {{ selectedRecord.grid.category }}
              </div>
              <div class="mt-4">
                <div class="flex justify-between text-sm mb-1">
                  <span>绩效</span>
                  <b
                    >{{
                      selectedRecord.finalResult?.performanceScore ??
                      selectedRecord.aiAnalysis.modelJudgment.performanceScore
                    }}/100</b
                  >
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500 rounded-full"
                    :style="{
                      width: `${
                        selectedRecord.finalResult?.performanceScore ??
                        selectedRecord.aiAnalysis.modelJudgment.performanceScore
                      }%`
                    }"
                  />
                </div>
              </div>
              <div class="mt-3">
                <div class="flex justify-between text-sm mb-1">
                  <span>潜力</span>
                  <b
                    >{{
                      selectedRecord.finalResult?.potentialScore ??
                      selectedRecord.aiAnalysis.modelJudgment.potentialScore
                    }}/100</b
                  >
                </div>
                <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-purple-500 rounded-full"
                    :style="{
                      width: `${
                        selectedRecord.finalResult?.potentialScore ??
                        selectedRecord.aiAnalysis.modelJudgment.potentialScore
                      }%`
                    }"
                  />
                </div>
              </div>
              <div class="mt-3 flex justify-center">
                <span v-if="!selectedRecord.finalResult?.riskLevel" class="text-slate-300">-</span>
                <span
                  v-else
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="riskBadgeClass(selectedRecord.finalResult.riskLevel)"
                  >{{ selectedRecord.finalResult.riskLevel }}</span
                >
              </div>
            </div>

            <div class="flex-1 space-y-4">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  class="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                  @click="handleDeleteRecord(selectedRecord.employee.id)"
                >
                  删除档案
                </button>
              </div>

              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="font-bold">AI 分析结果</h3>
                  <span class="text-xs text-slate-400"
                    >置信度 绩效:{{ selectedRecord.aiAnalysis.modelJudgment.confidence.performance }} 潜力:{{
                      selectedRecord.aiAnalysis.modelJudgment.confidence.potential
                    }}</span
                  >
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div class="text-slate-500 mb-1">能力词提取</div>
                    <div class="flex flex-wrap gap-2">
                      <span
                        v-for="(w, i) in selectedRecord.aiAnalysis.featureExtraction.abilityWords"
                        :key="'aw-' + i"
                        class="px-2 py-1 bg-blue-50 text-blue-700 rounded"
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
                    <div class="text-slate-500 mb-1">改进点 / 风险信号</div>
                    <div class="flex flex-wrap gap-2">
                      <template
                        v-for="(w, i) in [
                          ...selectedRecord.aiAnalysis.featureExtraction.emotionWords,
                          ...selectedRecord.aiAnalysis.featureExtraction.improvementPoints
                        ]"
                        :key="'im-' + i"
                      >
                        <span class="px-2 py-1 bg-amber-50 text-amber-700 rounded">{{ w }}</span>
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
                  <div class="text-slate-500 mb-1">证据片段</div>
                  <ul class="text-sm text-slate-700 list-disc list-inside">
                    <li v-for="(s, i) in selectedRecord.aiAnalysis.evidenceSnippets" :key="'ev-' + i">{{ s }}</li>
                  </ul>
                </div>
                <div
                  v-if="selectedRecord.aiAnalysis.suggestion.riskTip"
                  class="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
                >
                  {{ selectedRecord.aiAnalysis.suggestion.riskTip }}
                </div>
              </div>

              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h3 class="font-bold mb-4">HR 校准</h3>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label class="text-sm text-slate-500">绩效评分</label>
                    <input
                      v-model="perfAdj"
                      type="number"
                      min="0"
                      max="100"
                      class="w-full px-3 py-2 border rounded-lg mt-1"
                    />
                  </div>
                  <div>
                    <label class="text-sm text-slate-500">潜力评分</label>
                    <input
                      v-model="potAdj"
                      type="number"
                      min="0"
                      max="100"
                      class="w-full px-3 py-2 border rounded-lg mt-1"
                    />
                  </div>
                </div>
                <div class="mb-4">
                  <label class="text-sm text-slate-500">校准理由/决策依据</label>
                  <textarea
                    v-model="hrNotes"
                    rows="2"
                    class="w-full px-3 py-2 border rounded-lg mt-1"
                    placeholder="记录 HR 调整原因..."
                  />
                </div>
                <button
                  type="button"
                  class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
                  @click="handleSaveCalibration"
                >
                  保存校准结果
                </button>
              </div>

              <div class="bg-white rounded-2xl p-6 shadow-sm">
                <h3 class="font-bold mb-3">人才标签与发展建议</h3>
                <div class="flex flex-wrap gap-2 mb-4">
                  <span
                    v-for="(tag, i) in selectedRecord.finalResult?.talentTags ??
                    selectedRecord.aiAnalysis.suggestion.talentTags"
                    :key="'tag-' + i"
                    class="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >{{ tag }}</span
                  >
                </div>
                <ul
                  v-if="
                    selectedRecord.finalResult?.developmentSuggestions &&
                    selectedRecord.finalResult.developmentSuggestions.length > 0
                  "
                  class="text-sm space-y-1 list-disc list-inside text-slate-600"
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
        <div class="max-w-3xl mx-auto">
          <button type="button" class="text-blue-600 hover:underline mb-4" @click="setView('list')">← 返回列表</button>
          <div class="bg-white rounded-2xl p-8 shadow-sm">
            <h2 class="text-xl font-bold mb-6">新建人才档案 · 输入数据后由 AI 分析</h2>

            <div class="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">姓名 *</label>
                <input
                  v-model="emp.name"
                  class="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="张三"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">部门</label>
                <select v-model="emp.department" class="w-full px-4 py-2 border border-slate-200 rounded-lg">
                  <option v-for="d in DEPTS" :key="d" :value="d">{{ d }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">岗位</label>
                <input
                  v-model="emp.role"
                  class="w-full px-4 py-2 border border-slate-200 rounded-lg"
                  placeholder="产品经理"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">职级</label>
                <select v-model="emp.level" class="w-full px-4 py-2 border border-slate-200 rounded-lg">
                  <option v-for="l in LEVELS" :key="l" :value="l">{{ l }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">入职时长</label>
                <select v-model="emp.tenure" class="w-full px-4 py-2 border border-slate-200 rounded-lg">
                  <option v-for="t in TENURES" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-600 mb-1">绩效评分 (0-100)</label>
                <input
                  v-model.number="emp.performanceScore"
                  type="number"
                  min="0"
                  max="100"
                  class="w-full px-4 py-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-1">绩效评语 *（管理者撰写的定性评价）</label>
              <textarea
                v-model="emp.performanceComment"
                rows="4"
                class="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1"
                placeholder="例：该员工执行力强，能独立推进复杂项目..."
              />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-600 mb-1">关键事件</label>
              <textarea
                v-model="emp.keyEvents"
                rows="2"
                class="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1"
                placeholder="例：Q3独立完成XX项目，获得客户好评"
              />
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-slate-600 mb-1">发展反馈（同事/下属匿名反馈）</label>
              <textarea
                v-model="emp.developmentFeedback"
                rows="2"
                class="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1"
                placeholder="例：乐于分享，帮助团队解决问题"
              />
            </div>

            <div class="flex gap-3">
              <button
                type="button"
                class="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                @click="submitNewEmployee"
              >
                🤖 AI 分析并保存
              </button>
              <button type="button" class="px-6 py-2.5 border border-slate-200 rounded-lg" @click="setView('list')">
                取消
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- 列表 -->
      <template v-else-if="view.tab === 'list'">
        <div class="bg-white rounded-2xl p-6 shadow-sm">
          <div class="flex gap-4 mb-6">
            <input
              v-model="searchQuery"
              placeholder="搜索姓名或部门"
              class="px-4 py-2.5 rounded-lg border border-slate-200 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <table class="w-full text-left">
            <thead>
              <tr class="text-slate-500 text-sm border-b-2 border-slate-100">
                <th class="py-3 px-3">姓名</th>
                <th class="py-3 px-3">部门</th>
                <th class="py-3 px-3">职级</th>
                <th class="py-3 px-3">绩效分</th>
                <th class="py-3 px-3">潜力分</th>
                <th class="py-3 px-3">九宫格</th>
                <th class="py-3 px-3">风险</th>
                <th class="py-3 px-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in filteredList"
                :key="r.employee.id"
                class="border-b border-slate-50 hover:bg-slate-50/50"
              >
                <td class="py-4 px-3 font-medium">{{ r.employee.name }}</td>
                <td class="py-4 px-3">{{ r.employee.department }}</td>
                <td class="py-4 px-3">{{ r.employee.level }} {{ r.employee.role }}</td>
                <td class="py-4 px-3">{{ r.perf }}</td>
                <td class="py-4 px-3">{{ r.pot }}</td>
                <td class="py-4 px-3">
                  <span class="text-sm font-medium" :style="{ color: r.grid.color }">{{ r.grid.label }}</span>
                </td>
                <td class="py-4 px-3">
                  <span v-if="!r.finalResult?.riskLevel" class="text-slate-300">-</span>
                  <span v-else class="px-2 py-0.5 rounded text-xs font-medium" :class="riskBadgeClass(r.finalResult.riskLevel)">{{
                    r.finalResult.riskLevel
                  }}</span>
                </td>
                <td class="py-4 px-3">
                  <button
                    type="button"
                    class="text-blue-600 hover:underline text-sm"
                    @click="setView('detail', r.employee.id)"
                  >
                    查看详情
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- 仪表盘 -->
      <template v-else>
        <div class="space-y-8">
          <div class="h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 flex flex-col justify-center">
            <h1 class="text-2xl font-bold">AI 驱动人才盘点与绩效校准系统</h1>
            <p class="text-slate-300 mt-1">将主观评价变成结构化决策 · 九宫格定位 · 高潜识别 · 风险预警</p>
          </div>

          <div class="grid grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <div class="text-slate-500 text-sm">总人数</div>
                <div class="text-2xl font-bold mt-1">{{ fullData.length }}</div>
                <div class="text-slate-400 text-xs mt-0.5">已盘点</div>
              </div>
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                :style="{ backgroundColor: statColors.blue + '20', color: statColors.blue }"
              >
                👥
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <div class="text-slate-500 text-sm">高潜/明星</div>
                <div class="text-2xl font-bold mt-1">{{ highPotential.length }}</div>
                <div class="text-slate-400 text-xs mt-0.5">重点培养</div>
              </div>
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                :style="{ backgroundColor: statColors.green + '20', color: statColors.green }"
              >
                ⭐
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <div class="text-slate-500 text-sm">风险预警</div>
                <div class="text-2xl font-bold mt-1">{{ atRisk.length }}</div>
                <div class="text-slate-400 text-xs mt-0.5">需关注</div>
              </div>
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                :style="{ backgroundColor: statColors.red + '20', color: statColors.red }"
              >
                ⚠️
              </div>
            </div>
            <div class="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
              <div>
                <div class="text-slate-500 text-sm">部门数</div>
                <div class="text-2xl font-bold mt-1">{{ deptSummary.length }}</div>
                <div class="text-slate-400 text-xs mt-0.5">覆盖</div>
              </div>
              <div
                class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                :style="{ backgroundColor: statColors.purple + '20', color: statColors.purple }"
              >
                🏢
              </div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-6">
            <div class="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
              <h3 class="font-bold text-lg mb-4">九宫格人才矩阵</h3>
              <div class="grid grid-cols-3 gap-3">
                <div
                  v-for="[k, v] in gridEntries"
                  :key="k"
                  class="p-4 rounded-xl border min-h-[140px]"
                  :style="{ backgroundColor: v.bg, borderColor: v.color + '40' }"
                >
                  <div class="flex justify-between items-center" :style="{ color: v.color }">
                    <span class="font-bold text-sm">{{ v.id }} {{ v.label }}</span>
                    <span class="font-bold">{{ fullData.filter(d => d.pos === k).length }}人</span>
                  </div>
                  <div class="flex flex-wrap gap-1 mt-3">
                    <button
                      v-for="e in fullData.filter(d => d.pos === k)"
                      :key="e.employee.id"
                      type="button"
                      class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-medium hover:ring-2 hover:ring-blue-400 cursor-pointer"
                      @click="setView('detail', e.employee.id)"
                    >
                      {{ e.employee.name.slice(0, 1) }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="bg-white rounded-2xl p-5 shadow-sm">
                <h4 class="font-bold text-slate-800 mb-3">🏢 部门人才分布</h4>
                <div v-for="d in deptSummary" :key="d.name" class="mb-4">
                  <div class="flex justify-between text-sm">
                    <span>{{ d.name }}</span><b>{{ d.count }}人</b>
                  </div>
                  <div class="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                    <div
                      class="h-full bg-slate-700 rounded-full"
                      :style="{ width: fullData.length ? `${(d.count / fullData.length) * 100}%` : '0%' }"
                    />
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-2xl p-5 shadow-sm">
                <h4 class="font-bold text-slate-800 mb-3">⚠️ 风险预警 ({{ atRisk.length }})</h4>
                <div class="space-y-2">
                  <button
                    v-for="r in atRisk.slice(0, 5)"
                    :key="r.employee.id"
                    type="button"
                    class="block w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm"
                    @click="setView('detail', r.employee.id)"
                  >
                    <span class="font-medium">{{ r.employee.name }}</span>
                    <span class="text-slate-500 ml-2">{{ r.employee.department }}</span>
                  </button>
                </div>
              </div>

              <div class="bg-white rounded-2xl p-5 shadow-sm">
                <h4 class="font-bold text-slate-800 mb-3">⭐ 高潜人才 ({{ highPotential.length }})</h4>
                <div class="space-y-2">
                  <button
                    v-for="r in highPotential.slice(0, 5)"
                    :key="r.employee.id"
                    type="button"
                    class="block w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm"
                    @click="setView('detail', r.employee.id)"
                  >
                    <span class="font-medium">{{ r.employee.name }}</span>
                    <span class="text-slate-500 ml-2">{{ r.employee.department }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
