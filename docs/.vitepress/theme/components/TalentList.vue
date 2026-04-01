<template>
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

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ring-1 ring-slate-100/80">
          <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-600">原始输入</p>
          <h3 class="mt-1 text-base font-bold text-slate-900">结构化档案复盘</h3>
          <div class="mt-4 space-y-4 text-sm">
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p class="mb-2 text-xs font-semibold text-slate-700">一、基本信息</p>
              <dl class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div><span class="text-slate-500">姓名</span> · {{ selectedRecord.employee.name }}</div>
                <div><span class="text-slate-500">部门/岗位</span> · {{ selectedRecord.employee.department }} {{ selectedRecord.employee.role }}</div>
                <div><span class="text-slate-500">职级层级</span> · {{ selectedRecord.employee.jobTier ?? selectedRecord.employee.level }}</div>
                <div><span class="text-slate-500">入职时长</span> · {{ selectedRecord.employee.tenure }}</div>
              </dl>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p class="mb-2 text-xs font-semibold text-slate-700">二、业绩结果（横轴）</p>
              <p class="text-slate-600">
                绩效分（百分制）<b class="text-slate-900">{{ selectedRecord.employee.performanceScore ?? '—' }}</b>
              </p>
              <div v-if="selectedRecord.employee.dailyTiers" class="mt-2 space-y-2">
                <p
                  v-for="axis in DAILY_AXIS_META"
                  :key="'d-' + axis.key"
                  class="text-xs leading-relaxed text-slate-600"
                >
                  <span class="font-medium text-indigo-900">{{ axis.title }}</span>
                  <template v-if="selectedRecord.employee.dailyTiers[axis.key]">
                    · {{ DAILY_TIER_HEADLINE[axis.key][selectedRecord.employee.dailyTiers[axis.key]!] }}
                  </template>
                  <template v-else> · 未录入</template>
                </p>
              </div>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p class="mb-2 text-xs font-semibold text-slate-700">三、素质评价（纵轴 · 各 0–7 分）</p>
              <ul class="space-y-1.5">
                <li
                  v-for="row in COMPETENCY_SOURCES[jobTierToOrg(selectedRecord.employee.jobTier ?? '基层')]"
                  :key="'cmp-' + row.rowKey"
                  class="flex flex-wrap justify-between gap-2 text-xs text-slate-700"
                >
                  <span>{{ row.competencyName }}</span>
                  <span class="tabular-nums font-semibold text-indigo-900">{{
                    selectedRecord.employee.competencyScores?.[row.rowKey] ?? '—'
                  }}</span>
                </li>
              </ul>
            </div>
            <div class="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <p class="mb-2 text-xs font-semibold text-slate-700">四、发展洞察原文</p>
              <p class="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                {{ selectedRecord.employee.performanceComment || '—' }}
              </p>
              <p v-if="selectedRecord.employee.keyEvents" class="mt-2 whitespace-pre-wrap text-xs text-slate-600">
                <span class="font-medium text-slate-700">关键事件</span> · {{ selectedRecord.employee.keyEvents }}
              </p>
              <p v-if="selectedRecord.employee.developmentFeedback" class="mt-2 whitespace-pre-wrap text-xs text-slate-600">
                <span class="font-medium text-slate-700">发展反馈</span> · {{ selectedRecord.employee.developmentFeedback }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-indigo-200/80 bg-gradient-to-b from-indigo-50/40 to-white p-6 shadow-sm">
          <p class="text-[10px] font-bold uppercase tracking-wider text-indigo-600">AI 结论</p>
          <h3 class="mt-1 text-base font-bold text-slate-900">智能分析卡片</h3>
          <p class="mt-0.5 text-xs text-slate-500">
            置信 · 绩效 {{ selectedRecord.aiAnalysis.modelJudgment.confidence.performance }} · 潜力
            {{ selectedRecord.aiAnalysis.modelJudgment.confidence.potential }}
          </p>
          <div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
              <p class="text-[11px] font-bold text-indigo-900">人才画像</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(tag, i) in selectedRecord.finalResult?.talentTags ?? selectedRecord.aiAnalysis.suggestion.talentTags"
                  :key="'a-t-' + i"
                  class="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-900"
                  >{{ tag }}</span
                >
              </div>
              <p v-if="selectedRecord.aiAnalysis.semanticHits?.length" class="mt-3 text-[11px] text-slate-600">
                规则库语义命中 {{ selectedRecord.aiAnalysis.semanticHits.length }} 项素质维度
              </p>
            </div>
            <div class="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
              <p class="text-[11px] font-bold text-emerald-800">优势 · 证据</p>
              <ul class="mt-2 list-inside list-disc space-y-1 text-xs text-slate-700">
                <li v-for="(w, i) in selectedRecord.aiAnalysis.featureExtraction.abilityWords" :key="'adv-' + i">{{ w }}</li>
                <li v-for="(s, k) in selectedRecord.aiAnalysis.classification" :key="'cl-' + k">
                  {{ k }}（{{ s.strength }}）
                </li>
              </ul>
            </div>
            <div class="rounded-xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm md:col-span-2">
              <p class="text-[11px] font-bold text-amber-900">风险与关注点</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="(w, i) in selectedRecord.aiAnalysis.featureExtraction.emotionWords"
                  :key="'emo-' + i"
                  class="rounded bg-white px-2 py-0.5 text-xs text-amber-900 ring-1 ring-amber-200"
                  >{{ w }}</span
                >
                <span
                  v-for="(w, i) in selectedRecord.aiAnalysis.featureExtraction.improvementPoints"
                  :key="'imp-' + i"
                  class="rounded bg-white px-2 py-0.5 text-xs text-slate-800 ring-1 ring-slate-200"
                  >{{ w }}</span
                >
              </div>
              <p v-if="selectedRecord.aiAnalysis.suggestion.riskTip" class="mt-3 text-sm text-amber-950">
                {{ selectedRecord.aiAnalysis.suggestion.riskTip }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
              <p class="text-[11px] font-bold text-slate-800">发展建议</p>
              <ul class="mt-2 list-inside list-disc space-y-1 text-sm text-slate-700">
                <li v-for="(t, i) in selectedRecord.finalResult?.developmentSuggestions ?? selectedRecord.aiAnalysis.suggestion.developmentSuggestions ?? []" :key="'sg-' + i">
                  {{ t }}
                </li>
              </ul>
              <p class="mt-2 text-xs text-slate-500">证据摘录</p>
              <ul class="mt-1 list-inside list-disc text-xs text-slate-600">
                <li v-for="(s, i) in selectedRecord.aiAnalysis.evidenceSnippets" :key="'ev-' + i">{{ s }}</li>
              </ul>
            </div>
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
      </div>
    </div>
  </div>
  </template>

  <template v-else-if="view.tab === 'list'">
    <!-- 商务简约：白底 #333 字；风险/评估结果保持高饱和标签色 -->
    <div class="talent-list-panel rounded-2xl border border-[#E4E7ED] bg-[#FFFFFF] p-6 shadow-sm [color-scheme:light]">
      <div class="mb-6 flex flex-wrap gap-4">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="搜索姓名或部门"
          class="talent-list-search w-full max-w-xs rounded-lg border border-[#E4E7ED] bg-[#F5F7FA] px-4 py-2.5 text-[#333333] placeholder:text-[#909399] focus:border-[#409EFF] focus:outline-none focus:ring-2 focus:ring-[#409EFF]/20 sm:w-64"
          autocomplete="off"
        />
      </div>
      <div class="talent-list-table-wrap overflow-x-auto rounded-lg border border-[#E4E7ED] bg-[#FFFFFF]">
        <table class="talent-list-table w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr>
              <th>姓名</th>
              <th>部门</th>
              <th>职级</th>
              <th>绩效分</th>
              <th>潜力分</th>
              <th>风险</th>
              <th>评估结果</th>
              <th>人才记录</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="r in filteredList"
              :key="r.employee.id"
              class="talent-list-row"
            >
              <td class="text-[#333333]">{{ r.employee.name }}</td>
              <td class="text-[#333333]">{{ r.employee.department }}</td>
              <td class="text-[#333333]">{{ r.employee.level }} {{ r.employee.role }}</td>
              <td class="tabular-nums text-[#333333]">{{ r.perf }}</td>
              <td class="tabular-nums text-[#333333]">{{ r.pot }}</td>
              <td>
                <span v-if="!r.finalResult?.riskLevel" class="text-[#909399]">-</span>
                <span v-else class="talent-tag" :class="listRiskTagClass(r.finalResult.riskLevel)">{{
                  r.finalResult.riskLevel
                }}</span>
              </td>
              <td>
                <span class="font-semibold tabular-nums text-[#333333]">{{ r.pos }}</span>
                <span class="mx-1 text-[#909399]">·</span>
                <span class="font-semibold" :style="{ color: gridLabelBright(r.pos) }">{{ r.grid.label }}</span>
              </td>
              <td>
                <button
                  type="button"
                  class="talent-list-link text-sm font-semibold"
                  @click="setView('detail', r.employee.id)"
                >
                  打开档案
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import { GRID_MAP } from './types'
import { useTalentReview } from './talentReviewContext'

const {
  view,
  setView,
  selectedRecord,
  detailGrid,
  riskBadgeCls,
  handleDeleteRecord,
  DAILY_AXIS_META,
  DAILY_TIER_HEADLINE,
  COMPETENCY_SOURCES,
  jobTierToOrg,
  perfAdj,
  potAdj,
  hrNotes,
  handleSaveCalibration,
  searchQuery,
  filteredList
} = useTalentReview()

/** 列表专用风险标签：白底上保持高饱和红/琥珀/绿，类 Element danger / warning / success */
function listRiskTagClass(level: '高' | '中' | '低') {
  if (level === '高') return 'talent-tag--danger'
  if (level === '中') return 'talent-tag--warning'
  return 'talent-tag--success'
}

/** 评估结果：在白底上略提高九宫格语义色饱和度，避免发灰 */
const gridLabelHex: Record<string, string> = {
  '3-3': '#16a34a',
  '2-3': '#0284c7',
  '3-2': '#0284c7',
  '2-2': '#7c3aed',
  '1-3': '#d97706',
  '3-1': '#d97706',
  '2-1': '#ea580c',
  '1-2': '#ea580c',
  '1-1': '#dc2626'
}

function gridLabelBright(pos: string) {
  return gridLabelHex[pos] ?? GRID_MAP[pos]?.color ?? '#333333'
}
</script>

<style scoped>
/* 覆盖父级 .talent-saas 对 table 的全局去边框规则 */
.talent-list-panel :deep(table),
.talent-list-table {
  border-collapse: collapse;
  background: #ffffff !important;
  color: #333333;
}

.talent-list-table-wrap {
  background: #ffffff;
}

.talent-list-table thead th {
  background: #f5f7fa !important;
  color: #000000;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.02em;
  padding: 14px 16px;
  border: 1px solid #e4e7ed;
  border-bottom: 1px solid #e4e7ed;
  vertical-align: middle;
}

.talent-list-table tbody td {
  background: #ffffff !important;
  color: #333333 !important;
  padding: 16px;
  border: 1px solid #e4e7ed;
  vertical-align: middle;
}

.talent-list-row:hover td {
  background: #f0f9ff !important;
}

/* 风险标签：保持鲜艳，不被单元格 #333 继承 */
.talent-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  border: 1px solid transparent;
}

.talent-tag--danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.talent-tag--warning {
  background: #fffbeb;
  color: #d97706;
  border-color: #fde68a;
}

.talent-tag--success {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
}

.talent-list-link {
  color: #2563eb;
  text-decoration: none;
}
.talent-list-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.talent-list-search:focus {
  outline: none;
}
</style>
