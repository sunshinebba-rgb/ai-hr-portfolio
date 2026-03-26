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

        <!-- 新建 -->
        <template v-else-if="view.tab === 'add'">
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
                    <th class="px-3 py-3 font-medium">风险</th>
                    <th class="px-3 py-3 font-medium">评估结果</th>
                    <th class="px-3 py-3 font-medium">人才记录</th>
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
                      <span v-if="!r.finalResult?.riskLevel" class="text-slate-300">-</span>
                      <span
                        v-else
                        class="rounded px-2 py-0.5 text-xs font-medium"
                        :class="riskBadgeCls(r.finalResult.riskLevel)"
                        >{{ r.finalResult.riskLevel }}</span
                      >
                    </td>
                    <td class="px-3 py-4">
                      <span class="font-medium tabular-nums text-slate-600">{{ r.pos }}</span>
                      <span class="mx-1 text-slate-300">·</span>
                      <span class="font-medium" :style="{ color: r.grid.color }">{{ r.grid.label }}</span>
                    </td>
                    <td class="px-3 py-4">
                      <button
                        type="button"
                        class="text-sm font-medium text-indigo-600 hover:underline"
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

        <!-- 决策配置中心：判定规则 + 决策实验室 -->
        <template v-else-if="view.tab === 'cases'">
          <div class="mx-auto max-w-6xl space-y-6">
            <header
              class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-100/80"
            >
              <p class="text-xs font-semibold tracking-wide text-indigo-600">策略与校准中枢</p>
              <h1 class="mt-1 text-2xl font-bold tracking-tight text-slate-900">决策配置中心</h1>
              <p class="mt-2 max-w-2xl text-sm text-slate-600">
                人才洞察 · 策略 · 证据溯源 — 统一配置判定逻辑与沙箱推演，支撑可追溯、可校准的 HR 决策
              </p>
            </header>

            <!-- Tabs -->
            <div
              class="flex w-full flex-col gap-3 sm:inline-flex sm:w-auto sm:flex-row sm:items-stretch sm:gap-4 sm:rounded-2xl sm:border sm:border-slate-200/90 sm:bg-slate-50/90 sm:p-2 sm:shadow-sm"
            >
              <button
                type="button"
                class="flex min-h-[3rem] flex-1 items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide transition-all sm:min-w-[11rem]"
                :class="
                  strategyCenterTab === 'rules'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 ring-2 ring-indigo-400/40'
                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                "
                @click="strategyCenterTab = 'rules'"
              >
                【判定规则】
              </button>
              <button
                type="button"
                class="flex min-h-[3rem] flex-1 items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold tracking-wide transition-all sm:min-w-[11rem]"
                :class="
                  strategyCenterTab === 'lab'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30 ring-2 ring-indigo-400/40'
                    : 'bg-white text-slate-600 shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
                "
                @click="strategyCenterTab = 'lab'"
              >
                【决策实验室】
              </button>
            </div>

            <!-- Tab 1：判定规则 -->
            <section
              v-show="strategyCenterTab === 'rules'"
              class="space-y-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm ring-1 ring-slate-50"
            >
              <p class="text-sm leading-relaxed text-slate-600">
                与《结构化规则库》对齐：按组织层级配置能力维度权重；评语信号与正向、负向行为指标对齐后，加权形成潜力侧推断，并实时同步至【决策实验室】。
              </p>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="opt in orgLevelOptions"
                  :key="opt.value"
                  type="button"
                  class="rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
                  :class="
                    ruleOrgLevel === opt.value
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/25 ring-2 ring-indigo-300/50'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40'
                  "
                  @click="setOrgLevel(opt.value)"
                >
                  {{ opt.label }}
                </button>
              </div>
              <div
                class="flex flex-wrap items-center gap-4 rounded-xl border border-indigo-100/80 bg-indigo-50/30 px-4 py-3 text-sm"
              >
                <span class="font-medium text-slate-700">最低字数阈值（置信度）</span>
                <input
                  v-model.number="ruleConfig.minChars"
                  type="range"
                  min="5"
                  max="120"
                  step="1"
                  class="h-2 w-40 max-w-full accent-indigo-600"
                />
                <span class="tabular-nums text-indigo-800"
                  >{{ ruleConfig.minChars }} 字 · 低于此值将标记为低置信度输入</span
                >
              </div>
              <div class="overflow-x-auto rounded-xl border border-slate-200/80">
                <table class="w-full min-w-[960px] border-collapse text-left text-sm">
                  <thead>
                    <tr class="border-b border-slate-200 bg-slate-50/95">
                      <th class="whitespace-nowrap px-3 py-3 font-semibold text-slate-800">能力维度</th>
                      <th class="min-w-[200px] px-3 py-3 font-semibold text-slate-800">行为定义（原文）</th>
                      <th class="min-w-[200px] px-3 py-3 font-semibold text-slate-800">抓取逻辑（正向 / 负向）</th>
                      <th class="min-w-[260px] px-3 py-3 font-semibold text-slate-800">零至七分评分量表</th>
                      <th class="min-w-[140px] px-3 py-3 font-semibold text-slate-800">维度权重</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="row in competencyRowsForLevel" :key="row.rowKey">
                      <tr class="border-b border-slate-100 transition-colors hover:bg-indigo-50/25">
                        <td
                          v-if="row._showDimCell"
                          class="align-top border-r border-slate-100/80 bg-slate-50/40 px-3 py-3 font-medium text-slate-800"
                          :rowspan="row._dimRowspan"
                        >
                          <span
                            class="inline-flex flex-col gap-1 rounded-lg bg-indigo-50 px-2 py-1.5 text-xs font-bold text-indigo-900 ring-1 ring-indigo-100"
                          >
                            <span>{{ row.dimensionLabel }}</span>
                            <span class="font-normal text-indigo-700/90">{{ row.competencyName }}</span>
                          </span>
                        </td>
                        <td class="align-top px-3 py-3 text-slate-700 leading-relaxed">{{ row.definition }}</td>
                        <td class="align-top px-3 py-3 text-slate-700 leading-relaxed">{{ row.logicLine }}</td>
                        <td
                          class="align-top whitespace-pre-wrap px-3 py-3 text-xs leading-relaxed text-slate-600"
                        >
                          {{ row.scaleText }}
                        </td>
                        <td
                          v-if="row._showWeightCell"
                          class="align-top border-l border-slate-100/80 px-3 py-3"
                          :rowspan="row._dimRowspan"
                        >
                          <div class="flex flex-col gap-2">
                            <input
                              v-model.number="ruleConfig.dimensionWeights[row.dimensionKey]"
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              class="h-2 w-full max-w-[160px] accent-indigo-600"
                            />
                            <span class="tabular-nums text-xs font-bold text-indigo-800"
                              >{{ ruleConfig.dimensionWeights[row.dimensionKey] }}%</span
                            >
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Tab 2：决策实验室（左-输入 / 中-解析 / 右-行动） -->
            <section
              v-show="strategyCenterTab === 'lab'"
              class="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-50"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 class="text-lg font-bold text-slate-900">决策实验室</h2>
                  <p class="text-xs text-slate-500">
                    载入标准样例集；人工与模型分值差绝对值大于 15 的样本可一键筛选
                    <span v-if="importedCases.length" class="text-indigo-600"
                      >· 当前争议 {{ disputedCaseCount }} 条</span
                    >
                  </p>
                </div>
                <div class="flex flex-wrap items-center gap-2">
                  <button
                    v-if="importedCases.length"
                    type="button"
                    class="rounded-lg border px-3 py-2 text-xs font-medium transition-colors"
                    :class="
                      labDisputedFilter
                        ? 'border-indigo-300 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    "
                    @click="labDisputedFilter = !labDisputedFilter"
                  >
                    {{ labDisputedFilter ? '显示全部案例' : '仅看争议案例' }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="importLoading"
                    @click="loadTestCases"
                  >
                    <span v-if="importLoading">加载中…</span>
                    <span v-else>导入标准样例集</span>
                  </button>
                </div>
              </div>
              <p v-if="importError" class="text-sm text-red-600">{{ importError }}</p>
              <ul
                v-if="labVisibleCases.length > 0"
                class="grid list-none grid-cols-1 gap-6 p-0"
              >
                <li
                  v-for="c in labVisibleCases"
                  :key="c.id"
                  class="group grid grid-cols-1 gap-4 rounded-xl border bg-white p-4 shadow-sm transition-all lg:grid-cols-12"
                  :class="
                    isHighDisputeCase(c.id)
                      ? 'border-rose-400 ring-2 ring-rose-300/60 shadow-lg shadow-rose-100/50'
                      : 'border-slate-100 ring-1 ring-slate-50 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-indigo-500/40'
                  "
                >
                  <!-- 左：业绩矩阵 + 评语 + 提示词 -->
                  <div class="flex flex-col gap-4 lg:col-span-4">
                    <div class="flex items-start justify-between gap-2">
                      <div class="min-w-0">
                        <h3 class="truncate font-bold text-slate-900">{{ c.name }}</h3>
                        <p class="text-[11px] text-slate-500">{{ c.department }} · {{ c.level }}</p>
                        <button
                          type="button"
                          class="mt-1 text-[11px] font-semibold text-indigo-600 hover:underline"
                          @click="openLabCaseRecord(c.id)"
                        >
                          查看结构化人才记录
                        </button>
                      </div>
                      <span
                        class="lab-grid-badge shrink-0 rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide ring-1"
                        :class="expectedBoxBadgeClass(labGridKey(c.id))"
                      >
                        {{ labGridKey(c.id) }}
                      </span>
                    </div>

                    <div
                      class="rounded-xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/80 p-4 shadow-inner ring-1 ring-slate-100/80"
                    >
                      <p class="text-xs font-bold text-indigo-950">基准对比 · 横轴输入与模拟</p>
                      <p class="mt-1 text-[10px] leading-relaxed text-slate-500">
                        七成为绩效得分，三成为日常工作 1～4 分项；日常得分 = ((Σ−3)/9)×100，业绩综合分 = 绩效×0.7 + 日常得分×0.3。右栏滑块为决策推演，可与下方「实时结论」联动。
                      </p>
                      <div class="mt-3 rounded-lg border border-indigo-200/60 bg-white/80 px-3 py-2 text-[10px] text-slate-600">
                        <span class="font-semibold text-indigo-900">七成绩效区 · </span>
                        <label class="font-medium text-slate-700">平均绩效得分（零至百分制）</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/15"
                          placeholder="留空则业绩侧七成采用评语信号估计"
                          :value="labPerfInputs[c.id]?.averagePerformanceScore ?? ''"
                          @input="onLabAvgPerfInput(c.id, $event)"
                        />
                      </div>

                      <div class="mt-4 rounded-lg border border-slate-200/80 bg-white/90 p-3">
                        <p class="text-[11px] font-semibold text-slate-800">三成日常工作区 · 横向档位</p>
                        <p class="mt-0.5 text-[10px] text-slate-500">点选 1～4 分档后展示规则库原文，并计入日常得分。</p>
                        <div class="mt-3 space-y-4">
                          <div v-for="axis in DAILY_AXIS_META" :key="axis.key" class="space-y-2">
                            <div class="text-center text-[11px] font-bold text-indigo-950">
                              【{{ axis.title }}】
                            </div>
                            <div
                              class="flex w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 shadow-inner divide-x divide-slate-200/90"
                            >
                              <button
                                v-for="seg in DAILY_TIER_SEGMENTS"
                                :key="seg.key"
                                type="button"
                                class="min-w-0 flex-1 px-1 py-2.5 text-center text-[10px] font-semibold transition-all sm:py-3 sm:text-[11px]"
                                :class="
                                  labPerfInputs[c.id]?.dailyTiers[axis.key] === seg.key
                                    ? 'bg-indigo-800 text-white shadow-md shadow-indigo-900/25 ring-2 ring-indigo-400/60'
                                    : 'bg-white text-slate-700 hover:bg-indigo-50'
                                "
                                :title="dailyRuleLine(axis.key, seg.key)"
                                @click="setDailyTier(c.id, axis.key, seg.key)"
                              >
                                {{ seg.segmentLabel }}
                              </button>
                            </div>
                            <p
                              v-if="labPerfInputs[c.id]?.dailyTiers[axis.key]"
                              class="rounded-lg border border-indigo-100/80 bg-indigo-50/40 px-2.5 py-2 text-[10px] leading-relaxed text-slate-700"
                            >
                              <span class="font-semibold text-indigo-900">所选档位标准 · </span>
                              {{ dailyRuleLine(axis.key, labPerfInputs[c.id]!.dailyTiers[axis.key]) }}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        class="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-slate-200/80 bg-slate-50/60 px-3 py-2 text-[10px] text-slate-700 sm:grid-cols-3"
                      >
                        <div>
                          <span class="text-slate-500">日常得分（百分制）</span>
                          <div class="font-bold tabular-nums text-indigo-900">
                            {{
                              labDailyBreakdown(c.id).dailyPct != null
                                ? Math.round(labDailyBreakdown(c.id).dailyPct as number)
                                : '—'
                            }}
                          </div>
                        </div>
                        <div>
                          <span class="text-slate-500">七成项 + 三成项</span>
                          <div class="tabular-nums text-slate-800">
                            {{ labDailyBreakdown(c.id).term1 }} + {{ labDailyBreakdown(c.id).term2 }}
                            <span v-if="labDailyBreakdown(c.id).dailyPct != null" class="text-indigo-700">
                              ≈ {{ labDailyBreakdown(c.id).totalComposite }}</span
                            >
                          </div>
                        </div>
                        <div>
                          <span class="text-slate-500">矩阵业绩分（AI）</span>
                          <div class="font-bold tabular-nums text-indigo-900">
                            {{ labDailyBreakdown(c.id).totalPerf }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label class="text-[10px] font-medium text-slate-500">评语输入区（修改后实时重算潜力侧）</label>
                      <textarea
                        :value="labReviewDrafts[c.id] ?? c.raw_review"
                        rows="5"
                        class="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        placeholder="粘贴或编辑管理者评语…"
                        @input="setLabDraftFromEvent(c.id, $event)"
                      />
                    </div>

                    <div class="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                      <p class="text-[10px] font-bold text-slate-800">职级指引 · 能力维度与行为关键词</p>
                      <p class="mt-1 text-[10px] text-slate-500">
                        当前职级与【判定规则】一致：{{ orgLevelOptions.find(o => o.value === ruleOrgLevel)?.label }}
                      </p>
                      <div class="mt-2 flex flex-wrap gap-1.5">
                        <span
                          v-for="dim in orgLevelGuidanceKeywords.dims"
                          :key="'dim-' + dim"
                          class="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-900 ring-1 ring-indigo-100"
                          >{{ dim }}</span
                        >
                      </div>
                      <div class="mt-2 flex flex-wrap gap-1">
                        <span
                          v-for="(w, wi) in orgLevelGuidanceKeywords.words.slice(0, 24)"
                          :key="'kw-' + wi"
                          class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-700"
                          >{{ w }}</span
                        >
                      </div>
                    </div>

                    <div
                      class="rounded-lg border border-dashed border-indigo-200/80 bg-indigo-50/20 px-3 py-2 text-[11px] leading-relaxed text-slate-600"
                    >
                      <span class="font-semibold text-indigo-900">行为助手提示 · </span>
                      <span>{{ smartPromptForCase(c.id) }}</span>
                    </div>

                    <div
                      v-if="labAnalysisByCaseId[c.id]?.lowConfidence"
                      class="inline-flex w-fit items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 ring-1 ring-amber-200"
                    >
                      ⚠️ 低置信度
                    </div>
                    <div
                      v-if="labAnalysisByCaseId[c.id]?.timelinessConflict"
                      class="rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-[10px] font-medium text-amber-950"
                    >
                      ⚠️ 口径冲突：【及时性】选了高分档，但评语出现延期类表述，已标为高争议案例。
                    </div>
                    <div
                      v-if="isHighDisputeCase(c.id)"
                      class="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-medium text-rose-800"
                    >
                      ⚠️ 高争议案例，建议进入校准会讨论（分值差绝对值大于 15 或口径冲突）
                    </div>
                  </div>
                  <!-- 中：结构化结果与解析 -->
                  <div class="flex flex-col border-t border-slate-100 pt-3 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <div class="mb-3 rounded-lg border border-slate-200/90 bg-slate-50/60 p-3 text-[11px]">
                      <p class="mb-2 font-semibold text-slate-800">结构化映射 · 元信息</p>
                      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label class="text-[10px] text-slate-500">评估季度</label>
                          <select
                            class="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            :value="labCaseMeta[c.id]?.quarter ?? ''"
                            @change="setLabQuarterFromEvent(c.id, $event)"
                          >
                            <option value="">请选择</option>
                            <option v-for="q in quarterOptions" :key="q" :value="q">{{ q }}</option>
                          </select>
                        </div>
                        <div>
                          <label class="text-[10px] text-slate-500">反馈场景</label>
                          <select
                            class="mt-0.5 w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs"
                            :value="labCaseMeta[c.id]?.scenario ?? ''"
                            @change="setLabScenarioFromEvent(c.id, $event)"
                          >
                            <option value="">请选择</option>
                            <option v-for="s in feedbackScenarioOptions" :key="s" :value="s">{{ s }}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div class="mb-3 rounded-lg border border-indigo-100/80 bg-white p-3 text-[11px] leading-relaxed text-slate-600">
                      <p class="mb-1 font-semibold text-indigo-900">净稿预览（模拟脱敏）</p>
                      <p class="whitespace-pre-wrap break-words text-slate-700">
                        {{ desensitizeLabText(c.id) || '—' }}
                      </p>
                    </div>
                    <details class="group/details rounded-lg border border-slate-100 bg-slate-50/50">
                      <summary
                        class="cursor-pointer list-none px-3 py-2 text-xs font-semibold text-indigo-800 marker:content-none [&::-webkit-details-marker]:hidden"
                      >
                        <span class="inline-flex items-center gap-1">
                          🔍 证据溯源链路
                          <span class="text-[10px] font-normal text-slate-500">（默认折叠 · 命中与加权过程）</span>
                        </span>
                      </summary>
                      <div class="space-y-2 border-t border-slate-100 px-3 py-2 text-[11px] text-slate-600">
                        <p>
                          <span class="font-medium text-slate-700">命中词片段：</span>
                          {{
                            (labAnalysisByCaseId[c.id]?.matchedKeywords || []).join('、') || '—'
                          }}
                        </p>
                        <div class="overflow-x-auto">
                          <table class="w-full min-w-[260px] border-collapse text-left text-[10px]">
                            <thead>
                              <tr class="border-b border-slate-200 text-slate-500">
                                <th class="py-1 pr-2">能力维度</th>
                                <th class="py-1 pr-2">维度均分</th>
                                <th class="py-1 pr-2">权重</th>
                                <th class="py-1">潜力贡献</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr
                                v-for="row in dimensionContributions(c.id)"
                                :key="row.dimensionKey"
                                class="border-b border-slate-100/80"
                              >
                                <td class="py-1 pr-2 font-medium text-slate-700">{{ row.dimension }}</td>
                                <td class="tabular-nums">{{ row.dimScore }}</td>
                                <td class="tabular-nums">{{ row.weight }}%</td>
                                <td class="tabular-nums text-indigo-700">{{ row.toPotential }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p class="text-[10px] text-slate-500">
                          潜力侧：各能力维度均分按【判定规则】当前权重加权汇总；业绩侧：优先采用矩阵区复合结果，缺省时回退至评语中的结果类表述估计。
                        </p>
                        <div
                          v-if="(labAnalysisByCaseId[c.id]?.scaleHighlights || []).length"
                          class="mt-3 space-y-2 rounded-lg border border-indigo-100/90 bg-white p-2"
                        >
                          <p class="text-[10px] font-bold text-indigo-900">零至七分档 · 评语命中</p>
                          <div
                            v-for="(h, hi) in labAnalysisByCaseId[c.id]!.scaleHighlights"
                            :key="'sh-' + hi"
                            class="rounded-md border px-2 py-1.5 text-[10px] leading-relaxed"
                            :class="
                              h.bandLabel === '4-5'
                                ? 'border-indigo-400 bg-indigo-50/80 text-slate-800 ring-1 ring-indigo-200/80'
                                : 'border-slate-100 bg-slate-50/80 text-slate-700'
                            "
                          >
                            <span class="font-semibold text-indigo-950"
                              >{{ h.competencyName }} · {{ h.bandLabel.replace('-', '～') }}分档</span
                            >
                            <p class="mt-0.5 text-slate-600">{{ h.lineText }}</p>
                          </div>
                        </div>
                      </div>
                    </details>
                    <div class="mt-3 rounded-xl border border-slate-200/90 bg-gradient-to-br from-slate-50/90 to-indigo-50/30 p-3 text-[11px] shadow-inner">
                      <p class="mb-2 text-[10px] font-bold text-slate-900">输出报告预览 · 六大板块</p>
                      <ul class="space-y-2 text-slate-700">
                        <li>
                          <span class="font-semibold text-indigo-900">① 坐标定位 · </span>
                          {{ labSixReport(c.id).coord }}
                        </li>
                        <li>
                          <span class="font-semibold text-indigo-900">② 画像标签 · </span>
                          {{ labSixReport(c.id).tags }}
                        </li>
                        <li>
                          <span class="font-semibold text-indigo-900">③ 证据溯源 · </span>
                          {{ labSixReport(c.id).evidence }}
                        </li>
                        <li>
                          <span class="font-semibold text-indigo-900">④ 待改进点 · </span>
                          {{ labSixReport(c.id).improve }}
                        </li>
                        <li>
                          <span class="font-semibold text-indigo-900">⑤ 发展建议 · </span>
                          {{ labSixReport(c.id).idp }}
                        </li>
                        <li>
                          <span class="font-semibold text-indigo-900">⑥ 置信度 · </span>
                          {{ labSixReport(c.id).conf }}
                        </li>
                      </ul>
                    </div>
                    <div class="mt-3 space-y-2 rounded-lg border border-indigo-100/80 bg-white/90 p-3">
                      <p class="text-[10px] font-bold text-indigo-900">实时结论 · 与右栏滑块联动</p>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="rounded-md border border-slate-100 bg-slate-50/80 p-2">
                          <div class="text-[9px] text-slate-500">人评价（初始模型）</div>
                          <div class="text-xs tabular-nums text-slate-700">
                            业绩 {{ labAnalysisByCaseId[c.id]?.performanceScore ?? 0 }} · 潜力
                            {{ labAnalysisByCaseId[c.id]?.potentialScore ?? 0 }}
                          </div>
                        </div>
                        <div class="rounded-md border border-indigo-200 bg-indigo-50/50 p-2">
                          <div class="text-[9px] font-semibold text-indigo-800">决策推演（当前）</div>
                          <div class="text-xs font-bold tabular-nums text-indigo-950">
                            业绩 {{ displayLabPerf(c.id) }} · 潜力 {{ displayLabPot(c.id) }}
                          </div>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-2">
                        <div class="rounded-lg border border-slate-100 bg-white p-2">
                          <div class="text-[9px] text-slate-500">业绩刻度</div>
                          <div class="text-lg font-bold tabular-nums text-slate-900">
                            {{ displayLabPerf(c.id) }}
                          </div>
                          <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              class="lab-bar-fill h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                              :style="{
                                width: `${Math.min(100, Math.max(0, displayLabPerf(c.id)))}%`
                              }"
                            />
                          </div>
                        </div>
                        <div class="rounded-lg border border-slate-100 bg-white p-2">
                          <div class="text-[9px] text-slate-500">潜力刻度</div>
                          <div class="text-lg font-bold tabular-nums text-slate-900">
                            {{ displayLabPot(c.id) }}
                          </div>
                          <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
                            <div
                              class="lab-bar-fill h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                              :style="{
                                width: `${Math.min(100, Math.max(0, displayLabPot(c.id)))}%`
                              }"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 右：行动建议 + HR 校准 -->
                  <div class="flex flex-col border-t border-slate-100 pt-3 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-4 lg:pt-0">
                    <div class="rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-[11px] leading-relaxed text-slate-700">
                      <p class="mb-1 text-[10px] font-bold tracking-wide text-emerald-800">行动建议</p>
                      <p>{{ gridActionSuggestion(labGridKey(c.id)) }}</p>
                    </div>
                    <div class="mt-3 space-y-2 rounded-lg border border-indigo-100/80 bg-indigo-50/20 p-3">
                      <p class="text-[10px] font-semibold tracking-wide text-indigo-700">人力复核 · 手动分值</p>
                      <div class="grid grid-cols-2 gap-2">
                        <div>
                          <label class="text-[10px] text-slate-500">绩效 0–100</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            class="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-sm tabular-nums"
                            :value="hrOverride[c.id]?.hrPerf ?? ''"
                            placeholder="与滑块同步"
                            @input="hrNumberInputPerf(c.id, $event)"
                          />
                        </div>
                        <div>
                          <label class="text-[10px] text-slate-500">潜力 0–100</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            class="mt-0.5 w-full rounded border border-slate-200 px-2 py-1 text-sm tabular-nums"
                            :value="hrOverride[c.id]?.hrPot ?? ''"
                            placeholder="与滑块同步"
                            @input="hrNumberInputPot(c.id, $event)"
                          />
                        </div>
                      </div>
                      <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label class="text-[10px] text-slate-500">滑块 · 绩效</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            class="mt-1 h-2 w-full accent-indigo-600"
                            :value="displayLabPerf(c.id)"
                            @input="setHrPerfFromEvent(c.id, $event)"
                          />
                        </div>
                        <div>
                          <label class="text-[10px] text-slate-500">滑块 · 潜力</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            class="mt-1 h-2 w-full accent-indigo-600"
                            :value="displayLabPot(c.id)"
                            @input="setHrPotFromEvent(c.id, $event)"
                          />
                        </div>
                      </div>
                      <div
                        v-if="gapPerf(c.id) != null || gapPot(c.id) != null"
                        class="flex flex-wrap gap-2 border-t border-indigo-100/60 pt-2 text-[10px] text-slate-600"
                      >
                        <span v-if="gapPerf(c.id) != null" class="rounded bg-white px-2 py-0.5 ring-1 ring-slate-100">
                          业绩分差：<b
                            :class="(gapPerf(c.id) as number) > 0 ? 'text-emerald-600' : 'text-rose-600'"
                            >{{ gapPerf(c.id) }}</b
                          >
                        </span>
                        <span v-if="gapPot(c.id) != null" class="rounded bg-white px-2 py-0.5 ring-1 ring-slate-100">
                          潜力分差：<b
                            :class="(gapPot(c.id) as number) > 0 ? 'text-emerald-600' : 'text-rose-600'"
                            >{{ gapPot(c.id) }}</b
                          >
                        </span>
                      </div>
                      <div class="grid grid-cols-2 gap-2 border-t border-indigo-100/50 pt-2 text-center">
                        <div>
                          <div class="text-[9px] text-slate-400">展示业绩</div>
                          <div class="lab-score-num text-lg font-bold tabular-nums text-slate-900">
                            {{ displayLabPerf(c.id) }}
                          </div>
                        </div>
                        <div>
                          <div class="text-[9px] text-slate-400">展示潜力</div>
                          <div class="lab-score-num text-lg font-bold tabular-nums text-slate-900">
                            {{ displayLabPot(c.id) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
              <p
                v-else-if="importedCases.length === 0"
                class="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-sm text-slate-500"
              >
                暂无样本，请先导入标准样例集；导入后将同步至仪表盘人才池，便于策略校准。
              </p>
              <p
                v-else
                class="rounded-xl border border-dashed border-amber-200 bg-amber-50/40 p-6 text-center text-sm text-amber-900"
              >
                当前筛选下无争议案例（需先为样本填写人力复核分值并产生大于 15 的分差），可关闭「仅看争议案例」查看全部。
              </p>
            </section>
          </div>
        </template>

        <!-- 仪表盘 -->
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
/**
 * 业务逻辑对齐 `src/App.tsx`（与仓库内人才盘点 React 应用一致）。
 */
import { ref, reactive, computed, watch, onMounted } from 'vue'
import type { TalentRecord, EmployeeInput, AIAnalysis, JobTier } from './types'
import { GRID_MAP } from './types'
import { loadRecords, saveRecords, addRecord, deleteRecord } from './lib/storage'
import { runAIAnalysis } from './lib/aiEngine'
import { SEED_RECORDS } from './data/seedData'
import {
  PRESET_WEIGHTS,
  COMPETENCY_SOURCES,
  buildTableRows,
  parseScaleBands,
  type CompetencySourceRow,
  type OrgLevel,
  type ScaleBandLine
} from './competencyRules'
import {
  DAILY_AXIS_META,
  DAILY_RULE_TEXT,
  DAILY_TIER_SEGMENTS,
  DAILY_TIER_HEADLINE,
  computeDailyWorkPercent,
  computeXAxisTotal,
  BAND_TO_POINT,
  type DailyAxisKey,
  type DailyPointLevel,
  type PerfBand
} from './dailyWorkRules'
import { semanticScanComment } from './lib/semanticEngine'

/** 与 public/data/test_cases.json 对齐 */
interface TestCaseJson {
  id: string
  name: string
  level: string
  department: string
  raw_review: string
  manual_tags: string[]
  expected_box: string
  pred_performance?: number
  pred_potential?: number
}

const importedCases = ref<TestCaseJson[]>([])
const importLoading = ref(false)
const importError = ref('')

type Tab = 'dashboard' | 'list' | 'add' | 'detail' | 'cases'
type View = { tab: Tab; id?: string }
type GridInfo = (typeof GRID_MAP)[string]
type FullRow = TalentRecord & { perf: number; pot: number; pos: string; grid: GridInfo }

const DEPTS = ['产品部', '研发部', '技术部', '市场部', '运营部', '人力行政部', '业务部'] as const
const TENURES = ['1年', '2年', '3年', '5年+'] as const

const JOB_TIER_OPTIONS: JobTier[] = ['基层', '中层', '高层']

function jobTierToOrg(jt: JobTier): 'junior' | 'middle' | 'senior' {
  return jt === '基层' ? 'junior' : jt === '中层' ? 'middle' : 'senior'
}

function emptyScoresForTier(jt: JobTier): Record<string, number | null> {
  const org = jobTierToOrg(jt)
  const o: Record<string, number | null> = {}
  for (const r of COMPETENCY_SOURCES[org]) o[r.rowKey] = null
  return o
}

const statPalette: Record<string, string> = {
  blue: '#3b82f6',
  green: '#22c55e',
  red: '#ef4444',
  purple: '#a855f7',
  amber: '#f59e0b'
}

/** 策略中心：最低字数 + 当前层级下的维度权重（与 Tab2 实时联动） */
interface RuleConfigShape {
  minChars: number
  dimensionWeights: Record<string, number>
}

const strategyCenterTab = ref<'rules' | 'lab'>('rules')
const labDisputedFilter = ref(false)
const labReviewDrafts = reactive<Record<string, string>>({})

const ruleOrgLevel = ref<OrgLevel>('junior')

const orgLevelOptions: { value: OrgLevel; label: string }[] = [
  { value: 'junior', label: '基层员工' },
  { value: 'middle', label: '中层管理者' },
  { value: 'senior', label: '高层管理者' }
]

function clonePresetWeights(level: OrgLevel): Record<string, number> {
  return { ...PRESET_WEIGHTS[level] }
}

const ruleConfig = reactive<RuleConfigShape>({
  minChars: 20,
  dimensionWeights: clonePresetWeights('junior')
})

const competencyRowsForLevel = computed(() => buildTableRows(ruleOrgLevel.value))

function setOrgLevel(level: OrgLevel) {
  ruleOrgLevel.value = level
  const next = clonePresetWeights(level)
  for (const k of Object.keys(ruleConfig.dimensionWeights)) delete ruleConfig.dimensionWeights[k]
  for (const [k, v] of Object.entries(next)) {
    ruleConfig.dimensionWeights[k] = v
  }
}

interface LabDailyTiers {
  contribution: DailyPointLevel | null
  quality: DailyPointLevel | null
  timeliness: DailyPointLevel | null
}

interface LabPerfInput {
  averagePerformanceScore: number | null
  dailyTiers: LabDailyTiers
}

const labPerfInputs = reactive<Record<string, LabPerfInput>>({})
const labCaseMeta = reactive<Record<string, { quarter: string; scenario: string }>>({})

const quarterOptions = [
  '二〇二六年第一季度',
  '二〇二六年第二季度',
  '二〇二六年第三季度',
  '二〇二六年第四季度'
]
const feedbackScenarioOptions = ['季度考核', '三百六十度反馈', '项目总结'] as const

function dailyRuleLine(axisKey: DailyAxisKey, tier: DailyPointLevel | null | undefined): string {
  if (!tier) return ''
  return DAILY_RULE_TEXT[axisKey][tier]
}

function ensureLabPerfRow(id: string) {
  if (!labPerfInputs[id]) {
    labPerfInputs[id] = {
      averagePerformanceScore: null,
      dailyTiers: { contribution: null, quality: null, timeliness: null }
    }
  }
}

function ensureLabMetaRow(id: string) {
  if (!labCaseMeta[id]) labCaseMeta[id] = { quarter: '', scenario: '' }
}

function setDailyTier(caseId: string, axis: keyof LabDailyTiers, tier: DailyPointLevel) {
  ensureLabPerfRow(caseId)
  const cur = labPerfInputs[caseId].dailyTiers[axis]
  labPerfInputs[caseId].dailyTiers[axis] = cur === tier ? null : tier
}

function onLabAvgPerfInput(caseId: string, e: Event) {
  ensureLabPerfRow(caseId)
  const raw = (e.target as HTMLInputElement).value.trim()
  if (raw === '') {
    labPerfInputs[caseId].averagePerformanceScore = null
    return
  }
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  labPerfInputs[caseId].averagePerformanceScore = n
}

function setLabQuarterFromEvent(caseId: string, e: Event) {
  ensureLabMetaRow(caseId)
  labCaseMeta[caseId].quarter = (e.target as HTMLSelectElement).value
}

function setLabScenarioFromEvent(caseId: string, e: Event) {
  ensureLabMetaRow(caseId)
  labCaseMeta[caseId].scenario = (e.target as HTMLSelectElement).value
}

function desensitizeText(raw: string): string {
  let t = raw || ''
  t = t.replace(/\d{4,}/g, '【数值已掩码】')
  t = t.replace(
    /[\u4e00-\u9fa5]{2,4}(省|市|区|县|路|街|道|号|室)/g,
    '【地址已掩码】'
  )
  t = t.replace(
    /(?:张|李|王|刘|陈|杨|赵|黄|周|吴|徐|孙|胡|朱|高|林|何|郭|马|罗|梁|宋|郑|谢|韩|唐|冯|于|董|萧|程|曹|袁|邓|许|傅|沈|曾|彭|吕|苏|卢|蒋|蔡|贾|丁|魏|薛|叶|阎|余|潘|杜|戴|夏|锺|汪|田|任|姜|范|方|石|姚|谭|廖|邹|熊|金|陆|郝|孔|白|崔|康|毛|邱|秦|江|史|顾|侯|邵|孟|龙|万|段|漕|钱|汤|尹|黎|易|常|武|乔|贺|赖|龚|文)[\u4e00-\u9fa5]{1,2}/g,
    '【姓名占位】'
  )
  return t
}

function desensitizeLabText(caseId: string): string {
  const c = importedCases.value.find(x => x.id === caseId)
  const raw = labReviewDrafts[caseId] ?? c?.raw_review ?? ''
  return desensitizeText(raw)
}

function smartPromptForCase(caseId: string): string {
  ensureLabPerfRow(caseId)
  const inp = labPerfInputs[caseId]
  const parts: string[] = []
  parts.push('请结合已选日常工作档位与平均绩效得分，在评语中补充可核验的行为事例，便于证据溯源与策略校准。')
  if (inp.averagePerformanceScore != null) {
    parts.push(`已录入平均绩效得分 ${inp.averagePerformanceScore} 分。`)
  } else {
    parts.push('平均绩效得分尚未填写，业绩侧将更多依赖评语中的结果类表述估计。')
  }
  const labels: Record<keyof LabDailyTiers, string> = {
    contribution: '【工作贡献】',
    quality: '【工作质量】',
    timeliness: '【及时性】'
  }
  ;(['contribution', 'quality', 'timeliness'] as const).forEach(k => {
    const t = inp.dailyTiers[k]
    if (t) parts.push(`${labels[k]}已选 ${t} 分档。`)
  })
  return parts.join('')
}

const orgLevelGuidanceKeywords = computed(() => {
  const rows = COMPETENCY_SOURCES[ruleOrgLevel.value]
  const dims = [...new Set(rows.map(r => r.dimensionLabel))]
  const words = rows.flatMap(r => [...r.positive, ...r.negative])
  const uniq = [...new Set(words)]
  return { dims, words: uniq }
})

interface ScaleBandHighlight {
  competencyName: string
  dimensionKey: string
  bandLabel: string
  lineText: string
}

function computeScaleHighlights(text: string, orgLevel: OrgLevel): ScaleBandHighlight[] {
  const rows = COMPETENCY_SOURCES[orgLevel]
  const out: ScaleBandHighlight[] = []
  for (const row of rows) {
    const bands = parseScaleBands(row.scaleText)
    if (bands.length === 0) continue
    let hit: ScaleBandLine | null = null
    outer: for (const neg of row.negative) {
      if (neg && text.includes(neg)) {
        for (const b of bands) {
          if (b.text.includes(neg)) {
            hit = b
            break outer
          }
        }
        hit = bands.find(b => b.label === '0-1') ?? bands[0]
        break
      }
    }
    if (!hit) {
      for (const pos of row.positive) {
        if (pos && text.includes(pos)) {
          for (const b of bands) {
            if (b.text.includes(pos)) {
              hit = b
              break
            }
          }
          if (!hit) {
            const b45 = bands.find(b => b.label === '4-5')
            hit = b45 ?? bands[Math.min(2, bands.length - 1)]
          }
          break
        }
      }
    }
    if (hit) {
      out.push({
        competencyName: row.competencyName,
        dimensionKey: row.dimensionKey,
        bandLabel: hit.label,
        lineText: hit.text
      })
    }
  }
  return out
}

function matchedNegativesInText(text: string, orgLevel: OrgLevel): string[] {
  const rows = COMPETENCY_SOURCES[orgLevel]
  const out: string[] = []
  for (const r of rows) {
    for (const n of r.negative) {
      if (n && text.includes(n) && !out.includes(n)) out.push(n)
    }
  }
  return out
}

function detectTimelinessConflict(text: string, labInput?: LabPerfInput): boolean {
  if (!labInput?.dailyTiers.timeliness) return false
  const t = labInput.dailyTiers.timeliness
  if (t !== 4) return false
  const cues = ['经常延期', '延期', '拖延', '不能按期', '未按时', '拖期', '延误', '屡次延期']
  return cues.some(c => text.includes(c))
}

function buildConfidence(
  low: boolean,
  len: number,
  conflict: boolean
): { level: string; detail: string } {
  if (conflict) return { level: '低', detail: '及时性档位与评语表述存在冲突，需人工复核' }
  if (low) return { level: '低', detail: '评语字数低于阈值，置信偏低' }
  if (len > 50) return { level: '高', detail: '文本较充分，证据链可支撑推断' }
  return { level: '中', detail: '建议结合实例与关键事件再复核' }
}

function labDailyBreakdown(caseId: string) {
  ensureLabPerfRow(caseId)
  const inp = labPerfInputs[caseId]
  const d = inp.dailyTiers
  const dailyPct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  const a = labAnalysisByCaseId.value[caseId]
  const hasAvg =
    inp.averagePerformanceScore !== null && !Number.isNaN(Number(inp.averagePerformanceScore))
  const effPerf = hasAvg
    ? Math.max(0, Math.min(100, Number(inp.averagePerformanceScore)))
    : (a?.keywordPerfEstimate ?? 0)
  const term1 = effPerf * 0.7
  const term2 = dailyPct !== null ? dailyPct * 0.3 : 0
  const totalComposite =
    dailyPct !== null ? computeXAxisTotal(effPerf, dailyPct) : Math.round(Math.min(100, Math.max(0, effPerf)))
  return {
    dailyPct,
    term1: Math.round(term1 * 10) / 10,
    term2: Math.round(term2 * 10) / 10,
    totalPerf: a?.performanceScore ?? 0,
    effPerf,
    hasAvg,
    totalComposite
  }
}

function labSixReport(caseId: string) {
  const a = labAnalysisByCaseId.value[caseId]
  const text = labReviewDrafts[caseId] ?? importedCases.value.find(x => x.id === caseId)?.raw_review ?? ''
  const grid = labGridKey(caseId)
  const perf = a?.performanceScore ?? 0
  const pot = a?.potentialScore ?? 0
  const perfBand = perf >= 86 ? '高' : perf >= 61 ? '中' : '低'
  const potBand = pot >= 86 ? '高' : pot >= 61 ? '中' : '低'
  const ev = desensitizeText(text)
  const snippet = ev.length > 120 ? ev.slice(0, 120) + '…' : ev || '—'
  const neg = matchedNegativesInText(text, ruleOrgLevel.value)
  return {
    coord: `九宫格坐标 ${grid}（业绩：${perfBand}、潜力：${potBand}）`,
    tags: (a?.matchedKeywords ?? []).slice(0, 8).join('、') || '—',
    evidence: snippet,
    improve: neg.length ? neg.join('、') : '—',
    idp: gridActionSuggestion(grid),
    conf: `${a?.confidenceLevel ?? '—'} · ${a?.confidenceDetail ?? ''}`
  }
}

/** 绩效侧关键词（结果与交付导向） */
const PERFORMANCE_KEYWORDS = ['达成', '指标', '超额', '完成', '质量', '交付', '成果', '领先', '达标', '业绩']

interface TalentAnalysisResult {
  dimensionScores: Record<string, number>
  performanceScore: number
  potentialScore: number
  lowConfidence: boolean
  matchedKeywords: string[]
  keywordPerfEstimate: number
  scaleHighlights: ScaleBandHighlight[]
  confidenceLevel: string
  confidenceDetail: string
  timelinessConflict: boolean
}

function keywordPerformanceEstimate(text: string, matchedKeywords: string[]): number {
  let perfHits = 0
  for (const kw of PERFORMANCE_KEYWORDS) {
    if (text.includes(kw)) {
      perfHits += 1
      if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw)
    }
  }
  return Math.min(100, Math.round(38 + perfHits * 9))
}

/** 业绩综合分（百分制）= 绩效得分×0.7 + 日常得分×0.3；日常得分 = ((Σ三项−3)/9)×100 */
function compositePerformanceScore(
  keywordPerf: number,
  labInput: LabPerfInput | undefined
): number {
  if (!labInput) return keywordPerf
  const d = labInput.dailyTiers
  const dailyPct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  const anyDaily = dailyPct !== null
  const avg = labInput.averagePerformanceScore
  const hasAvg = avg !== null && avg !== undefined && !Number.isNaN(Number(avg))

  if (!hasAvg && !anyDaily) return keywordPerf
  const perfPart = hasAvg ? Math.max(0, Math.min(100, Number(avg))) : keywordPerf
  if (dailyPct === null) return Math.round(perfPart)
  return computeXAxisTotal(perfPart, dailyPct)
}

function analyzeTalentLogic(
  rawReview: string,
  cfg: RuleConfigShape,
  orgLevel: OrgLevel,
  labInput?: LabPerfInput
): TalentAnalysisResult {
  const text = rawReview || ''
  const len = text.replace(/\s/g, '').length
  const lowConfidence = len < cfg.minChars

  const matchedKeywords: string[] = []
  const rows = COMPETENCY_SOURCES[orgLevel]
  const { scores: semScores } = semanticScanComment(text, orgLevel)
  const byDim: Record<string, number[]> = {}

  for (const r of rows) {
    const s7 = Math.max(0, Math.min(7, semScores[r.rowKey] ?? 3))
    const s100 = (s7 / 7) * 100
    if (!byDim[r.dimensionKey]) byDim[r.dimensionKey] = []
    byDim[r.dimensionKey].push(s100)
    for (const w of r.positive) {
      if (w && text.includes(w) && !matchedKeywords.includes(w)) matchedKeywords.push(w)
    }
    for (const w of r.negative) {
      if (w && text.includes(w) && !matchedKeywords.includes(w)) matchedKeywords.push(w)
    }
  }

  const dimensionScores: Record<string, number> = {}
  for (const [dk, arr] of Object.entries(byDim)) {
    dimensionScores[dk] = Math.round(arr.reduce((s, x) => s + x, 0) / arr.length)
  }

  const keywordPerf = keywordPerformanceEstimate(text, matchedKeywords)
  const performanceScore = compositePerformanceScore(keywordPerf, labInput)
  const scaleHighlights = computeScaleHighlights(text, orgLevel)
  const timelinessConflict = detectTimelinessConflict(text, labInput)
  const conf = buildConfidence(lowConfidence, text.replace(/\s/g, '').length, timelinessConflict)

  const w = cfg.dimensionWeights
  const wSum = Object.values(w).reduce((s, x) => s + x, 0) || 100
  let potAcc = 0
  for (const [dk, dimScore] of Object.entries(dimensionScores)) {
    const wt = w[dk] ?? 0
    potAcc += dimScore * (wt / wSum)
  }
  const potentialScore = Math.round(potAcc)

  return {
    dimensionScores,
    performanceScore,
    potentialScore,
    lowConfidence,
    matchedKeywords,
    keywordPerfEstimate: keywordPerf,
    scaleHighlights,
    confidenceLevel: conf.level,
    confidenceDetail: conf.detail,
    timelinessConflict
  }
}

const labAnalysisByCaseId = computed(() => {
  const map: Record<string, TalentAnalysisResult> = {}
  for (const c of importedCases.value) {
    const text = labReviewDrafts[c.id] ?? c.raw_review
    ensureLabPerfRow(c.id)
    map[c.id] = analyzeTalentLogic(text, ruleConfig, ruleOrgLevel.value, labPerfInputs[c.id])
  }
  return map
})

const labVisibleCases = computed(() => {
  const list = importedCases.value
  if (!labDisputedFilter.value) return list
  return list.filter(c => isHighDisputeCase(c.id))
})

const disputedCaseCount = computed(
  () => importedCases.value.filter(c => isHighDisputeCase(c.id)).length
)

/** 九宫格 → 行动建议（右栏） */
const GRID_ACTION_COPY: Record<string, string> = {
  '3-3':
    '建议纳入继任计划与关键岗位梯队，配置高潜加速培养、股权激励或项目负责制。',
  '1-1':
    '建议启动绩效改进计划或转岗、退出访谈，明确改进窗口、证据链与人力业务伙伴陪跑。',
  '3-1':
    '建议作为专家型、资源池储备，强化技术或业务深度，减少纯管理负荷，匹配导师制。',
  '2-3':
    '建议授权挑战性项目与跨部门轮岗，纳入骨干池并定期复盘成长速度。',
  '3-2':
    '建议结果激励与潜力投资并举，关注倦怠风险，配置弹性目标与休假。',
  '2-2':
    '建议作为中坚力量稳定输出，配套标准化培养与适度轮岗，巩固团队基本盘。',
  '1-3':
    '建议设定清晰改进里程碑与辅导资源，观察期后复核是否调岗或降级使用。',
  '2-1':
    '建议强化基本功培训与过程管理，设定可量化的小步目标与周频反馈。',
  '1-2':
    '建议关注动机与岗位匹配度，结合全周期反馈与校准会讨论是否转岗或降级。'
}

function gridActionSuggestion(gridKey: string): string {
  return GRID_ACTION_COPY[gridKey] ?? '建议结合部门目标与校准会结论，制定个性化发展、风险与激励组合预案。'
}

function dimensionContributions(caseId: string) {
  const a = labAnalysisByCaseId.value[caseId]
  if (!a) return []
  const wSum = Object.values(ruleConfig.dimensionWeights).reduce((s, w) => s + w, 0) || 1
  return Object.keys(a.dimensionScores).map(dimensionKey => {
    const w = ruleConfig.dimensionWeights[dimensionKey] ?? 0
    const ds = a.dimensionScores[dimensionKey] ?? 0
    const toPot = wSum > 0 ? (ds * w) / wSum : 0
    return {
      dimensionKey,
      dimension: dimensionKey,
      dimScore: ds,
      weight: w,
      toPotential: Math.round(toPot * 10) / 10
    }
  })
}

function hasTimelinessConflictCase(caseId: string): boolean {
  const text = labReviewDrafts[caseId] ?? importedCases.value.find(c => c.id === caseId)?.raw_review ?? ''
  ensureLabPerfRow(caseId)
  return detectTimelinessConflict(text, labPerfInputs[caseId])
}

function isHighDisputeCase(caseId: string): boolean {
  if (hasTimelinessConflictCase(caseId)) return true
  const gp = gapPerf(caseId)
  const gt = gapPot(caseId)
  const hitP = gp !== null && Math.abs(gp) > 15
  const hitT = gt !== null && Math.abs(gt) > 15
  return hitP || hitT
}

function goToCalibrationMeeting() {
  labDisputedFilter.value = true
  strategyCenterTab.value = 'lab'
  setView('cases')
}

function setLabDraftFromEvent(caseId: string, e: Event) {
  labReviewDrafts[caseId] = (e.target as HTMLInputElement).value
}

function hrNumberInputPerf(caseId: string, e: Event) {
  setHrPerfNumber(caseId, (e.target as HTMLInputElement).value)
}

function hrNumberInputPot(caseId: string, e: Event) {
  setHrPotNumber(caseId, (e.target as HTMLInputElement).value)
}

/** 橄榄型：中段九宫格占比接近正态中部；用于管理看板提示 */
const oliveDistributionInsight = computed(() => {
  const n = fullData.value.length
  if (n === 0) {
    return {
      label: '暂无大盘样本',
      ratioText: '—',
      ok: true,
      hint: '导入或录入人才后，将自动评估分布形态。'
    }
  }
  const midBand = new Set(['2-2', '2-3', '3-2', '1-2', '2-1', '3-1', '1-3'])
  const mid = fullData.value.filter(d => midBand.has(d.pos)).length
  const ratio = mid / n
  const ok = ratio >= 0.42 && ratio <= 0.78
  return {
    label: ok ? '趋近橄榄型（中段饱满）' : '分布偏斜',
    ratioText: `${Math.round(ratio * 100)}%`,
    ok,
    hint: ok
      ? '中段格子占比合理，利于组织韧性与梯队厚度；可继续观察两端极端格比例。'
      : '中段占比偏离经验区间，建议结合校准会与外部市场对标，检查评分松紧与采样偏差。'
  }
})

const aiLandingRoadmap = [
  {
    phase: '1. 素材与语义',
    risk: '评语质量参差、脱敏不彻底',
    action: '统一采集模板、最低字数门槛与敏感信息清洗'
  },
  {
    phase: '2. 模型与规则',
    risk: '权重与业务语境脱节',
    action: '季度回溯争议案例，滚动更新关键词与权重配置'
  },
  {
    phase: '3. 人机协同',
    risk: '人力与模型推断分歧积累信任成本',
    action: '固定校准会机制，分差超阈自动上会'
  },
  {
    phase: '4. 运营闭环',
    risk: '结果未回灌业务系统',
    action: '九宫格结果对接继任、激励与培训工单'
  }
] as const

/** HR 校准覆盖：caseId → 人工分（未设置则沿用 AI） */
const hrOverride = reactive<Record<string, { hrPerf?: number; hrPot?: number }>>({})

function ensureHrOverrideRow(id: string) {
  if (!hrOverride[id]) hrOverride[id] = {}
}

function setHrPerfFromEvent(caseId: string, e: Event) {
  const t = e.target as HTMLInputElement
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPerf = +t.value
}

function setHrPotFromEvent(caseId: string, e: Event) {
  const t = e.target as HTMLInputElement
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPot = +t.value
}

function setHrPerfNumber(caseId: string, raw: string) {
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPerf = n
}

function setHrPotNumber(caseId: string, raw: string) {
  const n = Math.max(0, Math.min(100, Math.round(parseFloat(raw) || 0)))
  ensureHrOverrideRow(caseId)
  hrOverride[caseId].hrPot = n
}

function displayLabPerf(caseId: string): number {
  const ai = labAnalysisByCaseId.value[caseId]?.performanceScore ?? 0
  const hr = hrOverride[caseId]?.hrPerf
  return hr !== undefined && hr !== null ? hr : ai
}

function displayLabPot(caseId: string): number {
  const ai = labAnalysisByCaseId.value[caseId]?.potentialScore ?? 0
  const hr = hrOverride[caseId]?.hrPot
  return hr !== undefined && hr !== null ? hr : ai
}

function labGridKey(caseId: string): string {
  return getGridPos(displayLabPerf(caseId), displayLabPot(caseId))
}

function gapPerf(caseId: string): number | null {
  const ai = labAnalysisByCaseId.value[caseId]?.performanceScore
  if (ai === undefined) return null
  if (!hrOverride[caseId] || hrOverride[caseId].hrPerf === undefined) return null
  const hr = hrOverride[caseId].hrPerf as number
  return Math.round((hr - ai) * 10) / 10
}

function gapPot(caseId: string): number | null {
  const ai = labAnalysisByCaseId.value[caseId]?.potentialScore
  if (ai === undefined) return null
  if (!hrOverride[caseId] || hrOverride[caseId].hrPot === undefined) return null
  const hr = hrOverride[caseId].hrPot as number
  return Math.round((hr - ai) * 10) / 10
}

watch(
  () => importedCases.value.map(c => c.id),
  ids => {
    for (const id of Object.keys(hrOverride)) {
      if (!ids.includes(id)) delete hrOverride[id]
    }
    for (const id of Object.keys(labPerfInputs)) {
      if (!ids.includes(id)) delete labPerfInputs[id]
    }
    for (const id of Object.keys(labCaseMeta)) {
      if (!ids.includes(id)) delete labCaseMeta[id]
    }
  }
)

watch(
  labPerfInputs,
  () => {
    if (importedCases.value.length === 0) return
    records.value = records.value.map(r => {
      if (!r.employee.id.startsWith('testcase-')) return r
      const shortId = r.employee.id.replace(/^testcase-/, '')
      const c = importedCases.value.find(x => x.id === shortId)
      if (!c) return r
      return testCaseJsonToRecord(c)
    })
    saveRecords(records.value)
  },
  { deep: true }
)

function expectedBoxBadgeClass(box: string): string {
  const map: Record<string, string> = {
    '3-3': 'bg-emerald-100 text-emerald-800 ring-emerald-200/80',
    '2-3': 'bg-sky-100 text-sky-800 ring-sky-200/80',
    '3-2': 'bg-sky-100 text-sky-800 ring-sky-200/80',
    '2-2': 'bg-violet-100 text-violet-800 ring-violet-200/80',
    '1-3': 'bg-amber-100 text-amber-800 ring-amber-200/80',
    '3-1': 'bg-amber-100 text-amber-800 ring-amber-200/80',
    '2-1': 'bg-orange-100 text-orange-800 ring-orange-200/80',
    '1-2': 'bg-orange-100 text-orange-800 ring-orange-200/80',
    '1-1': 'bg-rose-100 text-rose-800 ring-rose-200/80'
  }
  return map[box] ?? 'bg-slate-100 text-slate-700 ring-slate-200/80'
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

/** 将测试集单条转为 TalentRecord；分数由 analyzeTalentLogic 与当前 ruleConfig、层级与实验室矩阵输入驱动 */
function testCaseJsonToRecord(c: TestCaseJson): TalentRecord {
  ensureLabPerfRow(c.id)
  const inferred = analyzeTalentLogic(
    c.raw_review,
    ruleConfig,
    ruleOrgLevel.value,
    labPerfInputs[c.id]
  )
  const perf = inferred.performanceScore
  const pot = inferred.potentialScore
  const gridPosition = getGridPos(perf, pot)
  const grid = GRID_MAP[gridPosition] || GRID_MAP['2-2']
  const riskLevel = riskFromGrid(grid)
  const jt: JobTier =
    c.level === 'senior' ? '高层' : c.level === 'middle' ? '中层' : c.level === 'junior' ? '基层' : '基层'
  const org = jobTierToOrg(jt)
  const { scores: semScores, hits: semHits } = semanticScanComment(c.raw_review, org)
  const competencyScores: Record<string, number | null> = {}
  for (const r of COMPETENCY_SOURCES[org]) {
    competencyScores[r.rowKey] = Math.max(0, Math.min(7, Math.round(semScores[r.rowKey] ?? 3)))
  }

  const employee: EmployeeInput = {
    id: `testcase-${c.id}`,
    name: c.name,
    department: c.department,
    role: '实验室样本',
    level: jt,
    jobTier: jt,
    tenure: '2年',
    performanceScore: perf,
    dailyTiers: { contribution: 3, quality: 3, timeliness: 3 },
    competencyScores,
    performanceComment: c.raw_review,
    keyEvents: '',
    developmentFeedback: ''
  }

  const tags = c.manual_tags.length ? c.manual_tags : ['模拟导入']
  const snippet = c.raw_review.length > 160 ? c.raw_review.slice(0, 160) + '…' : c.raw_review

  const confLevel = inferred.lowConfidence ? '低' : '中'
  const aiAnalysis: AIAnalysis = {
    featureExtraction: {
      abilityWords: tags.slice(0, 8),
      emotionWords: [],
      improvementPoints: []
    },
    classification: {},
    semanticHits: semHits,
    modelJudgment: {
      performanceScore: perf,
      potentialScore: pot,
      confidence: { performance: confLevel, potential: confLevel }
    },
    suggestion: {
      gridPosition,
      talentTags: tags,
      developmentSuggestions: []
    },
    evidenceSnippets: [snippet]
  }

  return {
    employee,
    aiAnalysis,
    finalResult: {
      performanceScore: perf,
      potentialScore: pot,
      gridPosition,
      talentTags: tags,
      developmentSuggestions: [],
      riskLevel,
      evidence: [snippet]
    },
    version: 'test_cases.json'
  }
}

const records = ref<TalentRecord[]>([])

async function loadTestCases() {
  importLoading.value = true
  importError.value = ''
  try {
    const url = `${import.meta.env.BASE_URL || '/'}data/test_cases.json`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data: unknown = await res.json()
    const list = Array.isArray(data) ? (data as TestCaseJson[]) : []
    importedCases.value = list
    for (const c of list) {
      if (labReviewDrafts[c.id] === undefined) labReviewDrafts[c.id] = c.raw_review
      ensureLabPerfRow(c.id)
      ensureLabMetaRow(c.id)
    }

    const existingIds = new Set(records.value.map(r => r.employee.id))
    const appended = list.map(testCaseJsonToRecord).filter(r => !existingIds.has(r.employee.id))
    if (appended.length > 0) {
      records.value = [...records.value, ...appended]
      saveRecords(records.value)
    }
  } catch (e) {
    importError.value = e instanceof Error ? e.message : '加载失败'
    importedCases.value = []
  } finally {
    importLoading.value = false
  }
}

/** ruleConfig 深度变化时，重算已导入测试集对应的人才档案，使仪表盘与实验室同源联动 */
watch(
  ruleConfig,
  () => {
    if (importedCases.value.length === 0) return
    records.value = records.value.map(r => {
      if (!r.employee.id.startsWith('testcase-')) return r
      const shortId = r.employee.id.replace(/^testcase-/, '')
      const c = importedCases.value.find(x => x.id === shortId)
      if (!c) return r
      return testCaseJsonToRecord(c)
    })
    saveRecords(records.value)
  },
  { deep: true }
)

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
  level: '基层',
  jobTier: '基层',
  tenure: '2年',
  performanceScore: 75,
  dailyTiers: { contribution: null, quality: null, timeliness: null },
  competencyScores: emptyScoresForTier('基层'),
  performanceComment: '',
  keyEvents: '',
  developmentFeedback: ''
})

const addFormCompetencyRows = computed(() => {
  const jt = emp.value.jobTier ?? '基层'
  return COMPETENCY_SOURCES[jobTierToOrg(jt)]
})

const addFormXAxisTotal = computed(() => {
  const e = emp.value
  const p = e.performanceScore
  if (p === undefined || p === null) return null
  const d = e.dailyTiers
  if (!d || d.contribution == null || d.quality == null || d.timeliness == null) return null
  const pct = computeDailyWorkPercent({
    contribution: d.contribution,
    quality: d.quality,
    timeliness: d.timeliness
  })
  if (pct === null) return null
  return computeXAxisTotal(p, pct)
})

const COMPETENCY_BANDS: readonly number[] = [0, 1, 2, 3, 4, 5, 6, 7]

function setFormDailyTier(axis: DailyAxisKey, tier: DailyPointLevel) {
  if (!emp.value.dailyTiers) {
    emp.value.dailyTiers = { contribution: null, quality: null, timeliness: null }
  }
  const cur = emp.value.dailyTiers[axis]
  emp.value.dailyTiers[axis] = cur === tier ? null : tier
}

function setFormCompetencyBand(rowKey: string, band: number) {
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  const cur = emp.value.competencyScores[rowKey]
  const v = Math.max(0, Math.min(7, band))
  emp.value.competencyScores[rowKey] = cur === v ? null : v
}

function setFormCompetencyScore(rowKey: string, e: Event) {
  const raw = (e.target as HTMLInputElement).value.trim()
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  if (raw === '') {
    emp.value.competencyScores[rowKey] = null
    return
  }
  const n = Math.max(0, Math.min(7, Math.round(parseFloat(raw) || 0)))
  emp.value.competencyScores[rowKey] = n
}

function formatScaleTooltip(row: CompetencySourceRow): string {
  return row.scaleText
}

function fillCompetencyFromComment() {
  const text = emp.value.performanceComment || ''
  const jt = emp.value.jobTier ?? '基层'
  const org = jobTierToOrg(jt)
  if (!emp.value.competencyScores) emp.value.competencyScores = {}
  const { hits, scores } = semanticScanComment(text, org)
  emp.value.semanticHits = hits
  for (const r of COMPETENCY_SOURCES[org]) {
    const s = scores[r.rowKey]
    if (s !== undefined) emp.value.competencyScores[r.rowKey] = Math.max(0, Math.min(7, Math.round(s)))
  }
}

const addFormSemanticHitCount = computed(() => emp.value.semanticHits?.length ?? 0)

function openLabCaseRecord(caseId: string) {
  const id = `testcase-${caseId}`
  if (!records.value.some(r => r.employee.id === id)) {
    alert('请先点击「导入标准样例集」，将实验室样本同步至人才池后再查看结构化档案。')
    return
  }
  setView('detail', id)
}

function migrateDailyTierValue(v: unknown): DailyPointLevel | null {
  if (v === null || v === undefined) return null
  if (typeof v === 'number' && v >= 1 && v <= 4) return v as DailyPointLevel
  if (typeof v === 'string' && v in BAND_TO_POINT) return BAND_TO_POINT[v as PerfBand]
  return null
}

function migrateEmployee(e: EmployeeInput): EmployeeInput {
  const next = { ...e }
  if (e.dailyTiers) {
    next.dailyTiers = {
      contribution: migrateDailyTierValue(e.dailyTiers.contribution),
      quality: migrateDailyTierValue(e.dailyTiers.quality),
      timeliness: migrateDailyTierValue(e.dailyTiers.timeliness)
    }
  }
  if (e.competencyScores) {
    const o = { ...e.competencyScores }
    for (const k of Object.keys(o)) {
      const v = o[k]
      if (v != null && v > 7) o[k] = Math.max(0, Math.min(7, Math.round((Number(v) / 100) * 7)))
    }
    next.competencyScores = o
  }
  return next
}

function migrateTalentRecord(r: TalentRecord): TalentRecord {
  return { ...r, employee: migrateEmployee(r.employee) }
}

function needsMigrationEmp(e: EmployeeInput): boolean {
  const d = e.dailyTiers
  if (d) {
    for (const k of ['contribution', 'quality', 'timeliness'] as const) {
      const v = d[k] as unknown
      if (typeof v === 'string' && v in BAND_TO_POINT) return true
    }
  }
  if (e.competencyScores) {
    for (const v of Object.values(e.competencyScores)) {
      if (v != null && Number(v) > 7) return true
    }
  }
  return false
}

watch(
  () => emp.value.jobTier,
  jt => {
    if (!jt) return
    emp.value.level = jt
    emp.value.competencyScores = emptyScoresForTier(jt)
  }
)

onMounted(() => {
  const loaded = loadRecords()
  if (loaded.length === 0) {
    saveRecords(SEED_RECORDS)
    records.value = SEED_RECORDS
  } else {
    const migrated = loaded.map(migrateTalentRecord)
    records.value = migrated
    if (loaded.some(r => needsMigrationEmp(r.employee))) saveRecords(migrated)
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
        level: '基层',
        jobTier: '基层',
        tenure: '2年',
        performanceScore: 75,
        dailyTiers: { contribution: null, quality: null, timeliness: null },
        competencyScores: emptyScoresForTier('基层'),
        semanticHits: undefined,
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
  if (!emp.value.name?.trim()) {
    alert('请填写姓名')
    return
  }
  const comment = (emp.value.performanceComment || '').replace(/\s/g, '')
  if (comment.length < 20) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  const jt = emp.value.jobTier ?? '基层'
  const rows = COMPETENCY_SOURCES[jobTierToOrg(jt)]
  const scores = emp.value.competencyScores ?? {}
  const missingDim = rows.some(r => scores[r.rowKey] === undefined || scores[r.rowKey] === null)
  if (missingDim) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  const d = emp.value.dailyTiers
  if (!d || d.contribution == null || d.quality == null || d.timeliness == null) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  if (emp.value.performanceScore === undefined || emp.value.performanceScore === null) {
    alert('证据链不足，建议完善以提高模型置信度')
    return
  }
  handleRunAI({ ...emp.value, id: 'emp-' + Date.now() })
}

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
