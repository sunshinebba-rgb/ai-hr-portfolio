<template>
  <div class="talent-app-root w-full">
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
            <div class="text-[10px] tracking-wide text-slate-400">人才洞察工作台</div>
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
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors"
            :class="
              view.tab === 'cases'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            "
            @click="setView('cases')"
          >
            <span class="text-base leading-none">⚙️</span>
            <span class="min-w-0 leading-tight">决策配置中心</span>
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

        <TalentList v-if="view.tab === 'detail' || view.tab === 'list'" />
        <TalentForm v-else-if="view.tab === 'add'" />
        <DecisionLab v-else-if="view.tab === 'cases'" />

        <template v-else-if="view.tab === 'dashboard'">
          <div class="space-y-6">
            <!-- 人才盘点校准会入口 -->
            <div
              class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50 to-white p-5 shadow-sm ring-1 ring-indigo-100/80"
            >
              <div class="min-w-0">
                <p class="text-sm font-bold text-indigo-950">人才盘点校准会</p>
                <p class="mt-1 text-xs text-indigo-800/85">
                  一键查看模型与人力复核分歧较大的样本，进入合议与证据复盘（分差绝对值大于 15）
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-900/20 transition hover:bg-indigo-700"
                @click="goToCalibrationMeeting"
              >
                进入争议案例列表
                <span v-if="disputedCaseCount > 0" class="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs"
                  >{{ disputedCaseCount }}</span
                >
              </button>
            </div>
        
            <div
              class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-800 to-slate-900 p-8 text-white shadow-md"
            >
              <div class="relative z-[1] max-w-2xl">
                <p class="text-xs font-medium tracking-widest text-indigo-300/90">洞察 · 策略 · 校准</p>
                <h1 class="mt-2 text-2xl font-bold tracking-tight">人才洞察 · 策略 · 校准</h1>
                <p class="mt-2 text-sm text-slate-300">
                  结构化人才洞察与策略沙盘 · 九宫格校准 · 高潜识别 · 风险预警
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
                      <p class="mt-1 text-xs text-slate-500">绩效 × 潜力 · 与内置九宫格键位顺序一致</p>
                    </div>
                  </div>
        
                  <div class="mb-2 flex justify-between px-1 text-[10px] font-medium tracking-wide text-slate-400">
                    <span>绩效：低 → 高（列）</span>
                    <span>潜力：低 → 高（行）</span>
                  </div>
        
                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="{ k, v, show, more, count } in gridCells"
                      :key="k"
                      class="group relative flex min-h-[148px] flex-col rounded-xl border-2 bg-gradient-to-br from-slate-50/95 via-indigo-50/35 to-slate-100/90 p-3 shadow-sm transition-all"
                      :style="{
                        borderColor: v.color + '55',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.65)'
                      }"
                    >
                      <div
                        class="absolute inset-x-0 top-0 h-1 rounded-t-lg opacity-90"
                        :style="{ backgroundColor: v.color }"
                      />
                      <div class="flex items-start justify-between gap-2 pt-1">
                        <div class="min-w-0">
                          <div class="text-[10px] font-bold tracking-wider text-slate-500">格位 {{ k }}</div>
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
        
            <!-- 风险看板：AI 落地挑战 + 橄榄型分布自检 -->
            <section
              class="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div class="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 class="text-lg font-bold text-slate-900">AI 落地挑战与应对路线图</h3>
                  <p class="mt-1 text-xs text-slate-500">
                    从素材语义到校准闭环；同步检视九宫格是否趋近橄榄型（中段饱满、近似正态），降低极端堆积风险。
                  </p>
                </div>
                <div
                  class="flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium"
                  :class="
                    oliveDistributionInsight.ok
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  "
                >
                  <span class="tabular-nums">{{ oliveDistributionInsight.ratioText }}</span>
                  <span class="hidden sm:inline">中段占比</span>
                </div>
              </div>
        
              <div class="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h4 class="mb-3 text-sm font-bold text-slate-800">四阶段路线图</h4>
                  <ol class="space-y-3">
                    <li
                      v-for="(row, idx) in aiLandingRoadmap"
                      :key="row.phase"
                      class="relative flex gap-3 rounded-xl border border-slate-100 bg-white/90 p-3 pl-4 shadow-sm"
                    >
                      <span
                        class="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-indigo-500/90"
                        aria-hidden="true"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="text-xs font-bold text-indigo-700">{{ row.phase }}</div>
                        <div class="mt-1 text-xs text-slate-600">
                          <span class="font-medium text-slate-700">挑战：</span>{{ row.risk }}
                        </div>
                        <div class="mt-1 text-xs text-slate-600">
                          <span class="font-medium text-slate-700">应对：</span>{{ row.action }}
                        </div>
                      </div>
                      <span
                        class="shrink-0 tabular-nums text-[10px] font-bold text-slate-400"
                        >{{ String(idx + 1).padStart(2, '0') }}</span
                      >
                    </li>
                  </ol>
                </div>
        
                <div
                  class="flex flex-col rounded-xl border border-slate-200/90 bg-white p-4 shadow-inner"
                  :class="oliveDistributionInsight.ok ? 'ring-1 ring-emerald-100' : 'ring-1 ring-amber-100'"
                >
                  <h4 class="text-sm font-bold text-slate-800">橄榄型 / 正态分布自检</h4>
                  <p class="mt-2 text-sm font-semibold" :class="oliveDistributionInsight.ok ? 'text-emerald-800' : 'text-amber-900'">
                    {{ oliveDistributionInsight.label }}
                  </p>
                  <p class="mt-2 text-xs leading-relaxed text-slate-600">{{ oliveDistributionInsight.hint }}</p>
                  <div class="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
                    <span class="rounded-md bg-slate-100 px-2 py-1">中段格：2-2、2-3、3-2、1-2、2-1、3-1、1-3</span>
                    <span class="rounded-md bg-slate-100 px-2 py-1">经验区间：中段占比约 42%–78%</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </template>
      </main>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { provide } from 'vue'
import { useTalentReviewApp } from './useTalentReviewApp'
import { talentReviewKey } from './talentReviewContext'
import TalentList from './TalentList.vue'
import TalentForm from './TalentForm.vue'
import DecisionLab from './DecisionLab.vue'

const api = useTalentReviewApp()
provide(talentReviewKey, api)

const {
  view,
  setView,
  fullData,
  highPotential,
  highPotentialPct,
  atRisk,
  deptSummary,
  statPalette,
  gridCells,
  disputedCaseCount,
  goToCalibrationMeeting,
  oliveDistributionInsight,
  aiLandingRoadmap
} = api
</script>

<style scoped>
.talent-saas :deep(table) {
  border: none;
  border-collapse: separate;
  border-spacing: 0;
}
.talent-saas :deep(thead tr) {
  background: transparent;
}

.lab-bar-fill {
  transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1);
}

.lab-grid-badge {
  transition:
    background-color 0.5s ease,
    color 0.45s ease,
    box-shadow 0.4s ease,
    transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.lab-score-num {
  transition: color 0.4s ease, transform 0.35s ease;
}
</style>
