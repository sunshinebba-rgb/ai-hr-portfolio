<template>
  <!-- 决策配置中心：判定规则 + 决策实验室 -->
    <div class="w-full min-w-0 space-y-6">
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
        <div class="rules-table-shell w-full overflow-hidden rounded-xl border border-[#E4E7ED] bg-[#FFFFFF] [color-scheme:light]">
          <table class="rules-judge-table w-full border-collapse text-left text-sm text-[#333333]">
            <colgroup>
              <col style="width: 15%" />
              <col style="width: 23%" />
              <col style="width: 23%" />
              <col style="width: 27%" />
              <col style="width: 12%" />
            </colgroup>
            <thead>
              <tr>
                <th class="rules-judge-th">能力维度</th>
                <th class="rules-judge-th">行为定义（原文）</th>
                <th class="rules-judge-th">抓取逻辑（正向 / 负向）</th>
                <th class="rules-judge-th">零至七分评分量表</th>
                <th class="rules-judge-th">维度权重</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="row in competencyRowsForLevel" :key="row.rowKey">
                <tr class="rules-judge-tr">
                  <td
                    v-if="row._showDimCell"
                    class="rules-judge-td rules-judge-td--dim align-top"
                    :rowspan="row._dimRowspan"
                  >
                    <span
                      class="rules-dim-tag inline-flex flex-col gap-1 rounded-lg px-2 py-1.5 text-xs font-bold"
                      :class="rulesDimTagClass(row.dimensionKey)"
                    >
                      <span>{{ row.dimensionLabel }}</span>
                      <span class="rules-dim-tag-sub font-semibold">{{ row.competencyName }}</span>
                    </span>
                  </td>
                  <td class="rules-judge-td align-top leading-relaxed">{{ row.definition }}</td>
                  <td class="rules-judge-td align-top leading-relaxed">{{ row.logicLine }}</td>
                  <td class="rules-judge-td rules-judge-td-scale align-top whitespace-pre-wrap text-xs leading-relaxed">
                    {{ row.scaleText }}
                  </td>
                  <td
                    v-if="row._showWeightCell"
                    class="rules-judge-td align-top"
                    :rowspan="row._dimRowspan"
                  >
                    <div class="flex min-w-0 flex-col gap-2">
                      <input
                        v-model.number="ruleConfig.dimensionWeights[row.dimensionKey]"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        class="rules-weight-range h-2 w-full min-w-0 accent-indigo-600"
                      />
                      <span class="tabular-nums text-xs font-bold text-[#333333]"
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

<script setup lang="ts">
import { useTalentReview } from './talentReviewContext'

const {
  strategyCenterTab,
  orgLevelOptions,
  ruleOrgLevel,
  setOrgLevel,
  ruleConfig,
  competencyRowsForLevel,
  labDisputedFilter,
  importedCases,
  disputedCaseCount,
  loadTestCases,
  importLoading,
  importError,
  labVisibleCases,
  isHighDisputeCase,
  labGridKey,
  expectedBoxBadgeClass,
  labPerfInputs,
  onLabAvgPerfInput,
  DAILY_AXIS_META,
  DAILY_TIER_SEGMENTS,
  setDailyTier,
  dailyRuleLine,
  labDailyBreakdown,
  labReviewDrafts,
  setLabDraftFromEvent,
  orgLevelGuidanceKeywords,
  smartPromptForCase,
  labAnalysisByCaseId,
  labCaseMeta,
  quarterOptions,
  setLabQuarterFromEvent,
  feedbackScenarioOptions,
  setLabScenarioFromEvent,
  desensitizeLabText,
  dimensionContributions,
  labSixReport,
  displayLabPerf,
  displayLabPot,
  gridActionSuggestion,
  hrOverride,
  hrNumberInputPerf,
  hrNumberInputPot,
  setHrPerfFromEvent,
  setHrPotFromEvent,
  gapPerf,
  gapPot,
  openLabCaseRecord
} = useTalentReview()
/** 判定规则表：维度 Tag 淡紫 / 淡蓝交替，与人才列表风格一致 */
function rulesDimTagClass(dimensionKey: string) {
  let h = 0
  for (let i = 0; i < dimensionKey.length; i++) h += dimensionKey.charCodeAt(i)
  return h % 2 === 0 ? 'rules-dim-tag--indigo' : 'rules-dim-tag--violet'
}

</script>

<style scoped>
/* 覆盖 TalentReviewApp .talent-saas :deep(table) 的去边框 / separate 规则 */
.rules-table-shell {
  overflow: hidden;
}
.rules-table-shell .rules-judge-table {
  table-layout: fixed !important;
  width: 100%;
  border-collapse: collapse !important;
  border-spacing: 0 !important;
  background: #ffffff !important;
}
.rules-judge-th {
  padding: 0.75rem;
  font-weight: 700;
  color: #333333;
  background: #f5f7fa !important;
  border: 1px solid #e4e7ed;
  vertical-align: top;
}
.rules-judge-tr {
  transition: background-color 0.15s ease;
}
.rules-judge-tr:hover {
  background: #f0f9ff;
}
.rules-judge-tr:hover .rules-judge-td {
  background: #f0f9ff !important;
}
.rules-judge-td {
  padding: 0.75rem;
  color: #333333 !important;
  background: #ffffff !important;
  border: 1px solid #e4e7ed;
  vertical-align: top;
  min-width: 0;
  word-break: break-word;
  overflow-wrap: anywhere;
}
.rules-judge-td--dim {
  background: #ffffff;
}
.rules-judge-td-scale {
  color: #333333;
}
.rules-dim-tag.rules-dim-tag--indigo {
  background: #eef2ff;
  color: #312e81;
  box-shadow: inset 0 0 0 1px #c7d2fe;
}
.rules-dim-tag.rules-dim-tag--violet {
  background: #f5f3ff;
  color: #5b21b6;
  box-shadow: inset 0 0 0 1px #ddd6fe;
}
.rules-dim-tag--indigo .rules-dim-tag-sub {
  color: #4338ca;
}
.rules-dim-tag--violet .rules-dim-tag-sub {
  color: #6d28d9;
}
</style>
