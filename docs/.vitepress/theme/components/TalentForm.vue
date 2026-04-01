<template>
  <div class="mx-auto max-w-4xl">
    <button
      type="button"
      class="mb-4 text-sm font-medium text-indigo-600 hover:underline"
      @click="setView('list')"
    >
      ← 返回列表
    </button>

    <h2 class="mb-6 text-xl font-bold text-slate-900">新建人才档案 · 规则与表单双向绑定</h2>

    <!-- 模块一：基本信息 -->
    <section
      class="mb-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
    >
      <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">一</span>
        <h3 class="text-base font-bold text-slate-900">基本信息</h3>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">姓名 *</label>
          <input
            v-model="emp.name"
            class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="请输入"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">部门</label>
          <select
            v-model="emp.department"
            class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option v-for="d in DEPTS" :key="d" :value="d">{{ d }}</option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">当前岗位</label>
          <input
            v-model="emp.role"
            class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            placeholder="岗位名称"
          />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-700">职级层级 *</label>
          <select
            v-model="emp.jobTier"
            class="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option v-for="jt in JOB_TIER_OPTIONS" :key="jt" :value="jt">{{ jt }}</option>
          </select>
          <p class="mt-1 text-[11px] text-slate-500">与规则库基层、中层、高层能力字典一一对应，切换后素质项将重新生成。</p>
        </div>
        <div class="sm:col-span-2">
          <label class="mb-1 block text-sm font-medium text-slate-700">入职时长</label>
          <select
            v-model="emp.tenure"
            class="w-full max-w-md rounded-lg border border-slate-200 px-4 py-2.5 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option v-for="t in TENURES" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
      </div>
    </section>

    <!-- 模块二：业绩结果（横轴） -->
    <section
      class="mb-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
    >
      <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">二</span>
        <h3 class="text-base font-bold text-slate-900">业绩结果（横轴）</h3>
      </div>
      <p class="mb-4 text-sm text-slate-600">
        绩效占 70%；日常工作三项各为 1～4 分（待改进 / 合格 / 良好 / 卓越）。日常得分 = ((三项之和 − 3) / 9) × 100，横轴综合分 = 绩效 × 0.7 + 日常得分 × 0.3。
      </p>
      <div class="mb-6 rounded-xl border border-indigo-100/80 bg-indigo-50/30 px-4 py-3">
        <label class="text-sm font-medium text-slate-800">绩效得分（零至百分制）</label>
        <input
          v-model.number="emp.performanceScore"
          type="number"
          min="0"
          max="100"
          class="mt-2 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-4 py-2.5 tabular-nums focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
      <div class="space-y-4">
        <div class="text-sm font-semibold text-slate-800">日常工作评分（三成权重）</div>
        <div v-for="axis in DAILY_AXIS_META" :key="axis.key" class="rounded-xl border border-slate-200/90 bg-slate-50/40 p-4">
          <div class="mb-2 text-center text-sm font-bold text-indigo-950">【{{ axis.title }}】</div>
          <div class="flex flex-wrap gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white p-0.5 sm:flex-nowrap">
            <button
              v-for="seg in DAILY_TIER_SEGMENTS"
              :key="seg.key"
              type="button"
              class="group relative min-w-0 flex-1 px-1 py-2.5 text-center text-[11px] font-semibold transition-all sm:py-3"
              :class="
                emp.dailyTiers?.[axis.key] === seg.key
                  ? 'rounded-lg bg-indigo-800 text-white shadow-lg shadow-indigo-900/35 ring-2 ring-indigo-400/80'
                  : 'rounded-lg text-slate-500 hover:bg-slate-100'
              "
              @click="setFormDailyTier(axis.key, seg.key)"
            >
              {{ seg.segmentLabel }}
              <span
                v-if="emp.dailyTiers?.[axis.key] === seg.key"
                class="pointer-events-none absolute -bottom-1 left-1/2 z-10 -translate-x-1/2 translate-y-full rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white shadow-md opacity-0 transition-opacity group-hover:opacity-100"
                >分值 {{ seg.key }} 分</span
              >
            </button>
          </div>
          <div v-if="emp.dailyTiers?.[axis.key]" class="mt-3 space-y-1 rounded-lg border border-indigo-200/80 bg-indigo-950/5 px-3 py-2">
            <p class="text-xs font-semibold text-indigo-800">当前分值 · {{ emp.dailyTiers![axis.key] }} 分</p>
            <p class="text-sm font-semibold text-indigo-900">
              {{ DAILY_TIER_HEADLINE[axis.key][emp.dailyTiers![axis.key]!] }}
            </p>
            <p class="text-[12px] leading-relaxed text-slate-600">
              {{ DAILY_RULE_TEXT[axis.key][emp.dailyTiers![axis.key]!] }}
            </p>
          </div>
        </div>
      </div>
      <div
        class="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
      >
        <span class="text-slate-600">横轴综合分（实时）</span>
        <span class="text-lg font-bold tabular-nums text-indigo-900">
          {{ addFormXAxisTotal ?? '—' }}
        </span>
      </div>
    </section>

    <!-- 模块三：素质评价（纵轴） -->
    <section
      class="mb-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
    >
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">三</span>
          <h3 class="text-base font-bold text-slate-900">素质评价（纵轴）</h3>
        </div>
        <button
          type="button"
          class="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
          @click="fillCompetencyFromComment"
        >
          AI 智能解析
        </button>
      </div>
      <p class="mb-4 text-[13px] text-slate-600">
        与 rules.md 对齐：每项 0～7 分；纵轴百分制 = 各项得分之和 ÷ 35 × 100（五维均填满时）。悬浮「?」查看行为量表。
      </p>
      <div class="space-y-4">
        <div
          v-for="row in addFormCompetencyRows"
          :key="row.rowKey"
          class="rounded-xl border border-slate-200/90 bg-slate-50/30 p-4"
        >
          <div class="mb-2 flex flex-wrap items-center gap-2">
            <span class="font-semibold text-slate-900">{{ row.competencyName }}</span>
            <span class="rounded bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-800 ring-1 ring-indigo-100/80"
              >{{ row.dimensionLabel }}</span
            >
            <span class="group relative inline-flex">
              <span
                class="inline-flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-slate-200/80 text-xs font-bold text-slate-600 ring-1 ring-slate-300/80"
                >?</span
              >
              <span
                class="pointer-events-none invisible absolute left-0 top-full z-30 mt-2 w-[min(100vw-2rem,22rem)] max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 text-[11px] leading-relaxed text-slate-700 shadow-xl group-hover:visible"
              >
                <span class="font-semibold text-indigo-900">零至七分行为标准</span>
                <pre class="mt-0.5 whitespace-pre-wrap font-sans">{{ formatScaleTooltip(row) }}</pre>
              </span>
            </span>
            <span
              v-if="emp.competencyScores?.[row.rowKey] != null"
              class="ml-auto rounded-md bg-indigo-900 px-2 py-0.5 text-[11px] font-bold text-white"
              >已选 {{ emp.competencyScores[row.rowKey] }} 分</span
            >
          </div>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="b in COMPETENCY_BANDS"
              :key="row.rowKey + '-b-' + b"
              type="button"
              class="h-9 min-w-[2rem] rounded-lg border px-2 text-xs font-semibold tabular-nums transition-all"
              :class="
                emp.competencyScores?.[row.rowKey] === b
                  ? 'border-indigo-700 bg-indigo-800 text-white shadow-md shadow-indigo-900/30'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50'
              "
              @click="setFormCompetencyBand(row.rowKey, b)"
            >
              {{ b }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 模块四：发展洞察 -->
    <section
      class="mb-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
    >
      <div class="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">四</span>
        <h3 class="text-base font-bold text-slate-900">发展洞察</h3>
      </div>
      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium text-slate-700">绩效评语 *</label>
        <textarea
          v-model="emp.performanceComment"
          rows="4"
          class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="管理者定性评价，不少于二十字以便形成证据链"
        />
        <p v-if="addFormSemanticHitCount > 0" class="mt-2 text-xs text-indigo-800">
          AI 已为您自动识别 {{ addFormSemanticHitCount }} 项能力；点击下方条目可查看原文依据（模块三可再次「AI 智能解析」刷新）。
        </p>
        <ul v-if="emp.semanticHits?.length" class="mt-2 space-y-1 rounded-lg border border-indigo-100 bg-indigo-50/30 p-2 text-[11px] text-slate-700">
          <li v-for="(h, hi) in emp.semanticHits" :key="'hit-' + hi">
            <details class="rounded-md bg-white/80 px-2 py-1 ring-1 ring-indigo-100/80">
              <summary class="cursor-pointer font-medium text-indigo-900 marker:text-indigo-600">
                {{ h.命中项 }} · {{ h.推荐分数 }} 分
              </summary>
              <p class="mt-1 border-t border-slate-100 pt-1 text-slate-600">依据：{{ h.匹配证据 }}</p>
            </details>
          </li>
        </ul>
      </div>
      <div class="mb-4">
        <label class="mb-1 block text-sm font-medium text-slate-700">关键事件与行为证据</label>
        <textarea
          v-model="emp.keyEvents"
          rows="3"
          class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="可记录关键项目、里程碑或客户反馈等"
        />
      </div>
      <div class="mb-2">
        <label class="mb-1 block text-sm font-medium text-slate-700">下一步发展建议</label>
        <textarea
          v-model="emp.developmentFeedback"
          rows="3"
          class="mt-1 w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          placeholder="培养方向、轮岗或培训等建议"
        />
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-6 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700"
        @click="submitNewEmployee"
      >
        保存并生成洞察
      </button>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-6 py-2.5 font-medium text-slate-700 hover:bg-slate-50"
        @click="setView('list')"
      >
        取消
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTalentReview } from './talentReviewContext'

const {
  emp,
  DEPTS,
  JOB_TIER_OPTIONS,
  TENURES,
  DAILY_AXIS_META,
  DAILY_TIER_SEGMENTS,
  setFormDailyTier,
  DAILY_TIER_HEADLINE,
  DAILY_RULE_TEXT,
  addFormXAxisTotal,
  addFormCompetencyRows,
  COMPETENCY_BANDS,
  setFormCompetencyBand,
  formatScaleTooltip,
  fillCompetencyFromComment,
  addFormSemanticHitCount,
  submitNewEmployee,
  setView
} = useTalentReview()
</script>
