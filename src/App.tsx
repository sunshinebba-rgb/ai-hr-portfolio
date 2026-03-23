import { useState, useEffect, useMemo } from 'react';
import type { TalentRecord, EmployeeInput } from './types';
import { GRID_MAP } from './types';
import { loadRecords, saveRecords, addRecord, deleteRecord } from './lib/storage';
import { runAIAnalysis } from './lib/aiEngine';
import { SEED_RECORDS } from './data/seedData';

type Tab = 'dashboard' | 'list' | 'add' | 'detail';
type View = { tab: Tab; id?: string };

// 将 0-100 分映射到 1-3 档
function scoreToGrade(s: number): 1 | 2 | 3 {
  if (s >= 80) return 3;
  if (s >= 60) return 2;
  return 1;
}

function getGridPos(perf: number, pot: number): string {
  return `${scoreToGrade(perf)}-${scoreToGrade(pot)}`;
}

export default function App() {
  const [records, setRecords] = useState<TalentRecord[]>([]);
  const [view, setView] = useState<View>({ tab: 'dashboard' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loaded = loadRecords();
    if (loaded.length === 0) {
      saveRecords(SEED_RECORDS);
      setRecords(SEED_RECORDS);
    } else {
      setRecords(loaded);
    }
  }, []);

  const fullData = useMemo(() => {
    return records.map(r => {
      const perf = r.finalResult?.performanceScore ?? r.aiAnalysis.modelJudgment.performanceScore;
      const pot = r.finalResult?.potentialScore ?? r.aiAnalysis.modelJudgment.potentialScore;
      const pos = r.finalResult?.gridPosition ?? r.aiAnalysis.suggestion.gridPosition;
      const grid = GRID_MAP[pos] || GRID_MAP['1-1'];
      return { ...r, perf, pot, pos, grid };
    });
  }, [records]);

  const highPotential = useMemo(() =>
    fullData.filter(d => d.pos === '3-3' || d.pos === '2-3' || d.pos === '3-2'),
    [fullData]
  );
  const atRisk = useMemo(() =>
    fullData.filter(d => (d.finalResult?.riskLevel === '高') || d.pos === '1-1'),
    [fullData]
  );
  const deptSummary = useMemo(() => {
    const depts = [...new Set(records.map(r => r.employee.department))];
    return depts.map(name => {
      const members = fullData.filter(d => d.employee.department === name);
      const avgP = members.length ? Math.round(members.reduce((a, b) => a + b.perf, 0) / members.length) : 0;
      const avgPot = members.length ? (members.reduce((a, b) => a + b.pot, 0) / members.length).toFixed(1) : '0';
      return { name, members, count: members.length, avgP, avgPot };
    });
  }, [fullData, records]);

  const selectedRecord = view.id ? fullData.find(r => r.employee.id === view.id) : null;
  const filteredList = fullData.filter(d =>
    d.employee.name.includes(searchQuery) || d.employee.department.includes(searchQuery)
  );

  const handleSaveRecord = (record: TalentRecord) => {
    setRecords(addRecord(record));
    setView({ tab: 'list' });
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('确定删除该人才档案？')) {
      setRecords(deleteRecord(id));
      setView({ tab: 'list' });
    }
  };

  const handleRunAI = (emp: EmployeeInput) => {
    const analysis = runAIAnalysis(emp);
    const pos = getGridPos(analysis.modelJudgment.performanceScore, analysis.modelJudgment.potentialScore);
    const grid = GRID_MAP[pos] || GRID_MAP['1-1'];
    const riskLevel = (grid.id === '5' ? '高' : grid.id === '4' || grid.id === '3' ? '中' : '低') as '高' | '中' | '低';
    const record: TalentRecord = {
      employee: emp,
      aiAnalysis: analysis,
      finalResult: {
        performanceScore: analysis.modelJudgment.performanceScore,
        potentialScore: analysis.modelJudgment.potentialScore,
        gridPosition: pos,
        talentTags: analysis.suggestion.talentTags,
        developmentSuggestions: analysis.suggestion.developmentSuggestions ?? [],
        riskLevel,
        evidence: analysis.evidenceSnippets,
      },
    };
    setRecords(addRecord(record));
    setView({ tab: 'detail', id: emp.id });
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <nav className="w-56 bg-slate-900 text-white p-6 flex-shrink-0">
        <h2 className="text-lg font-bold mb-10">人才盘点系统</h2>
        <nav className="space-y-2">
          <NavItem active={view.tab === 'dashboard'} onClick={() => setView({ tab: 'dashboard' })}>
            📊 仪表盘总览
          </NavItem>
          <NavItem active={view.tab === 'list'} onClick={() => setView({ tab: 'list' })}>
            👥 人才信息列表
          </NavItem>
          <NavItem active={view.tab === 'add'} onClick={() => setView({ tab: 'add' })}>
            ➕ 新建人才档案
          </NavItem>
        </nav>
        <div className="mt-12 text-xs text-slate-400">
          AI 驱动 · 绩效校准
        </div>
      </nav>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* 详情页 */}
        {view.tab === 'detail' && selectedRecord && (
          <DetailView
            record={selectedRecord}
            onBack={() => setView({ tab: 'list' })}
            onSave={(r) => { handleSaveRecord(r); setView({ tab: 'list' }); }}
            onDelete={() => handleDeleteRecord(selectedRecord.employee.id)}
          />
        )}

        {/* 新建档案 */}
        {view.tab === 'add' && (
          <AddRecordView
            onSave={handleRunAI}
            onBack={() => setView({ tab: 'list' })}
          />
        )}

        {/* 列表页 */}
        {view.tab === 'list' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex gap-4 mb-6">
              <input
                placeholder="搜索姓名或部门"
                className="px-4 py-2.5 rounded-lg border border-slate-200 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-sm border-b-2 border-slate-100">
                  <th className="py-3 px-3">姓名</th>
                  <th className="py-3 px-3">部门</th>
                  <th className="py-3 px-3">职级</th>
                  <th className="py-3 px-3">绩效分</th>
                  <th className="py-3 px-3">潜力分</th>
                  <th className="py-3 px-3">九宫格</th>
                  <th className="py-3 px-3">风险</th>
                  <th className="py-3 px-3">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map(r => (
                  <tr key={r.employee.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-4 px-3 font-medium">{r.employee.name}</td>
                    <td className="py-4 px-3">{r.employee.department}</td>
                    <td className="py-4 px-3">{r.employee.level} {r.employee.role}</td>
                    <td className="py-4 px-3">{r.perf}</td>
                    <td className="py-4 px-3">{r.pot}</td>
                    <td className="py-4 px-3">
                      <span className="text-sm font-medium" style={{ color: r.grid.color }}>{r.grid.label}</span>
                    </td>
                    <td className="py-4 px-3">
                      <RiskBadge level={r.finalResult?.riskLevel} />
                    </td>
                    <td className="py-4 px-3">
                      <button
                        onClick={() => setView({ tab: 'detail', id: r.employee.id })}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 仪表盘 */}
        {view.tab === 'dashboard' && (
          <Dashboard
            fullData={fullData}
            highPotential={highPotential}
            atRisk={atRisk}
            deptSummary={deptSummary}
            onSelect={(id) => setView({ tab: 'detail', id })}
          />
        )}
      </main>
    </div>
  );
}

function NavItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
    >
      {children}
    </button>
  );
}

function RiskBadge({ level }: { level?: '高' | '中' | '低' }) {
  if (!level) return <span className="text-slate-300">-</span>;
  const c = level === '高' ? 'bg-red-100 text-red-700' : level === '中' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c}`}>{level}</span>;
}

function Dashboard({
  fullData,
  highPotential,
  atRisk,
  deptSummary,
  onSelect,
}: {
  fullData: Array<TalentRecord & { perf: number; pot: number; pos: string; grid: typeof GRID_MAP[string] }>;
  highPotential: typeof fullData;
  atRisk: typeof fullData;
  deptSummary: Array<{ name: string; members: typeof fullData; count: number; avgP: number; avgPot: string }>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="space-y-8">
      <div className="h-36 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 flex flex-col justify-center">
        <h1 className="text-2xl font-bold">AI 驱动人才盘点与绩效校准系统</h1>
        <p className="text-slate-300 mt-1">将主观评价变成结构化决策 · 九宫格定位 · 高潜识别 · 风险预警</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard title="总人数" value={fullData.length} sub="已盘点" icon="👥" color="blue" />
        <StatCard title="高潜/明星" value={highPotential.length} sub="重点培养" icon="⭐" color="green" />
        <StatCard title="风险预警" value={atRisk.length} sub="需关注" icon="⚠️" color="red" />
        <StatCard title="部门数" value={deptSummary.length} sub="覆盖" icon="🏢" color="purple" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">九宫格人才矩阵</h3>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(GRID_MAP).map(([k, v]) => {
              const list = fullData.filter(d => d.pos === k);
              return (
                <div
                  key={k}
                  className="p-4 rounded-xl border min-h-[140px]"
                  style={{ backgroundColor: v.bg, borderColor: `${v.color}40` }}
                >
                  <div className="flex justify-between items-center" style={{ color: v.color }}>
                    <span className="font-bold text-sm">{v.id} {v.label}</span>
                    <span className="font-bold">{list.length}人</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {list.map(e => (
                      <button
                        key={e.employee.id}
                        onClick={() => onSelect(e.employee.id)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-medium hover:ring-2 hover:ring-blue-400 cursor-pointer"
                      >
                        {e.employee.name.slice(0, 1)}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">🏢 部门人才分布</h4>
            {deptSummary.map(d => (
              <div key={d.name} className="mb-4">
                <div className="flex justify-between text-sm"><span>{d.name}</span><b>{d.count}人</b></div>
                <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-slate-700 rounded-full" style={{ width: `${(d.count / fullData.length) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">⚠️ 风险预警 ({atRisk.length})</h4>
            <div className="space-y-2">
              {atRisk.slice(0, 5).map(r => (
                <button key={r.employee.id} onClick={() => onSelect(r.employee.id)} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm">
                  <span className="font-medium">{r.employee.name}</span>
                  <span className="text-slate-500 ml-2">{r.employee.department}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-3">⭐ 高潜人才 ({highPotential.length})</h4>
            <div className="space-y-2">
              {highPotential.slice(0, 5).map(r => (
                <button key={r.employee.id} onClick={() => onSelect(r.employee.id)} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm">
                  <span className="font-medium">{r.employee.name}</span>
                  <span className="text-slate-500 ml-2">{r.employee.department}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, icon, color }: { title: string; value: number; sub: string; icon: string; color: string }) {
  const colors: Record<string, string> = { blue: '#1890ff', green: '#52c41a', red: '#f5222d', purple: '#722ed1' };
  const c = colors[color] || '#1890ff';
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
      <div>
        <div className="text-slate-500 text-sm">{title}</div>
        <div className="text-2xl font-bold mt-1">{value}</div>
        <div className="text-slate-400 text-xs mt-0.5">{sub}</div>
      </div>
      <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: `${c}20`, color: c }}>
        {icon}
      </div>
    </div>
  );
}

function AddRecordView({ onSave, onBack }: { onSave: (emp: EmployeeInput) => void; onBack: () => void }) {
  const [emp, setEmp] = useState<EmployeeInput>({
    id: 'emp-' + Date.now(),
    name: '',
    department: '产品部',
    role: '',
    level: 'P5',
    tenure: '2年',
    performanceScore: 75,
    performanceComment: '',
    keyEvents: '',
    developmentFeedback: '',
  });

  const handleSubmit = () => {
    if (!emp.name || !emp.performanceComment) {
      alert('请填写姓名和绩效评语');
      return;
    }
    emp.id = 'emp-' + Date.now();
    onSave(emp);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="text-blue-600 hover:underline mb-4">← 返回列表</button>
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-bold mb-6">新建人才档案 · 输入数据后由 AI 分析</h2>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-6">
          <div><label className="block text-sm font-medium text-slate-600 mb-1">姓名 *</label><input className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.name} onChange={e => setEmp({ ...emp, name: e.target.value })} placeholder="张三" /></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">部门</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.department} onChange={e => setEmp({ ...emp, department: e.target.value })}>{['产品部', '研发部', '技术部', '市场部', '运营部', '人力行政部', '业务部'].map(d => <option key={d} value={d}>{d}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">岗位</label><input className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.role} onChange={e => setEmp({ ...emp, role: e.target.value })} placeholder="产品经理" /></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">职级</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.level} onChange={e => setEmp({ ...emp, level: e.target.value })}>{['P4', 'P5', 'P6', 'M1', 'M2', '基层', '中层', '高层'].map(l => <option key={l} value={l}>{l}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">入职时长</label><select className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.tenure} onChange={e => setEmp({ ...emp, tenure: e.target.value })}>{['1年', '2年', '3年', '5年+'].map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label className="block text-sm font-medium text-slate-600 mb-1">绩效评分 (0-100)</label><input type="number" min={0} max={100} className="w-full px-4 py-2 border border-slate-200 rounded-lg" value={emp.performanceScore ?? 70} onChange={e => setEmp({ ...emp, performanceScore: +e.target.value })} /></div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-1">绩效评语 *（管理者撰写的定性评价）</label>
          <textarea rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1" placeholder="例：该员工执行力强，能独立推进复杂项目，按时交付质量良好。但在面对不确定性时容易焦虑..." value={emp.performanceComment} onChange={e => setEmp({ ...emp, performanceComment: e.target.value })} />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-600 mb-1">关键事件</label>
          <textarea rows={2} className="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1" placeholder="例：Q3独立完成XX项目，获得客户好评" value={emp.keyEvents} onChange={e => setEmp({ ...emp, keyEvents: e.target.value })} />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 mb-1">发展反馈（同事/下属匿名反馈）</label>
          <textarea rows={2} className="w-full px-4 py-3 border border-slate-200 rounded-lg mt-1" placeholder="例：乐于分享，帮助团队解决问题" value={emp.developmentFeedback} onChange={e => setEmp({ ...emp, developmentFeedback: e.target.value })} />
        </div>

        <div className="flex gap-3">
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            🤖 AI 分析并保存
          </button>
          <button onClick={onBack} className="px-6 py-2.5 border border-slate-200 rounded-lg">取消</button>
        </div>
      </div>
    </div>
  );
}

function DetailView({
  record,
  onBack,
  onSave,
  onDelete,
}: {
  record: TalentRecord & { perf?: number; pot?: number; pos?: string; grid?: typeof GRID_MAP[string] };
  onBack: () => void;
  onSave: (r: TalentRecord) => void;
  onDelete: () => void;
}) {
  const [hrNotes, setHrNotes] = useState('');
  const [perfAdj, setPerfAdj] = useState(String(record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore));
  const [potAdj, setPotAdj] = useState(String(record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore));

  const grid = record.grid || GRID_MAP[record.finalResult?.gridPosition ?? '2-2'] || GRID_MAP['2-2'];

  const handleSaveCalibration = () => {
    const perf = Math.max(0, Math.min(100, +perfAdj)) || 0;
    const pot = Math.max(0, Math.min(100, +potAdj)) || 0;
    const pos = getGridPos(perf, pot);
    const g = GRID_MAP[pos] || GRID_MAP['1-1'];
    const riskLevel = (g.id === '5' ? '高' : g.id === '4' || g.id === '3' ? '中' : '低') as '高' | '中' | '低';
    const oldPerf = record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore;
    const oldPot = record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore;
    const adjusted = [...(record.hrCalibration?.adjusted ?? [])];
    if (perf !== oldPerf) adjusted.push({ field: '绩效', from: String(oldPerf), to: String(perf), reason: hrNotes || 'HR校准' });
    if (pot !== oldPot) adjusted.push({ field: '潜力', from: String(oldPot), to: String(pot), reason: hrNotes || 'HR校准' });

    const updated: TalentRecord = {
      ...record,
      employee: record.employee,
      hrCalibration: {
        confirmed: record.hrCalibration?.confirmed ?? [],
        adjusted,
        supplements: record.hrCalibration?.supplements ?? [],
        finalDecision: hrNotes || (record.hrCalibration?.finalDecision ?? ''),
      },
      finalResult: {
        performanceScore: perf,
        potentialScore: pot,
        gridPosition: pos,
        talentTags: record.finalResult?.talentTags ?? record.aiAnalysis.suggestion.talentTags,
        developmentSuggestions: (record.finalResult?.developmentSuggestions ?? record.aiAnalysis.suggestion.developmentSuggestions) ?? [],
        riskLevel,
        evidence: record.finalResult?.evidence ?? record.aiAnalysis.evidenceSnippets,
      },
    };
    onSave(updated);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="text-blue-600 hover:underline mb-4">← 返回列表</button>

      <div className="flex gap-6">
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl font-bold mx-auto">
            {record.employee.name.slice(0, 1)}
          </div>
          <h2 className="text-xl font-bold mt-4">{record.employee.name}</h2>
          <p className="text-slate-500 text-sm">{record.employee.department} · {record.employee.role}</p>
          <div className="mt-4 p-3 rounded-xl text-sm font-medium" style={{ backgroundColor: grid.bg, color: grid.color }}>
            {grid.label} · {grid.category}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1"><span>绩效</span><b>{record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore}/100</b></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${record.finalResult?.performanceScore ?? record.aiAnalysis.modelJudgment.performanceScore}%` }} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1"><span>潜力</span><b>{record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore}/100</b></div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${record.finalResult?.potentialScore ?? record.aiAnalysis.modelJudgment.potentialScore}%` }} />
            </div>
          </div>
          <RiskBadge level={record.finalResult?.riskLevel} />
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex justify-end gap-2">
            <button onClick={onDelete} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm">删除档案</button>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">AI 分析结果</h3>
              <span className="text-xs text-slate-400">置信度 绩效:{record.aiAnalysis.modelJudgment.confidence.performance} 潜力:{record.aiAnalysis.modelJudgment.confidence.potential}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">能力词提取</div>
                <div className="flex flex-wrap gap-2">
                  {record.aiAnalysis.featureExtraction.abilityWords.map((w, i) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded">{w}</span>)}
                  {record.aiAnalysis.featureExtraction.abilityWords.length === 0 && <span className="text-slate-300">-</span>}
                </div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">改进点 / 风险信号</div>
                <div className="flex flex-wrap gap-2">
                  {[...record.aiAnalysis.featureExtraction.emotionWords, ...record.aiAnalysis.featureExtraction.improvementPoints].map((w, i) => <span key={i} className="px-2 py-1 bg-amber-50 text-amber-700 rounded">{w}</span>)}
                  {record.aiAnalysis.featureExtraction.emotionWords.length === 0 && record.aiAnalysis.featureExtraction.improvementPoints.length === 0 && <span className="text-slate-300">-</span>}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-slate-500 mb-1">证据片段</div>
              <ul className="text-sm text-slate-700 list-disc list-inside">
                {record.aiAnalysis.evidenceSnippets.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            {record.aiAnalysis.suggestion.riskTip && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{record.aiAnalysis.suggestion.riskTip}</div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-4">HR 校准</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-slate-500">绩效评分</label>
                <input type="number" min={0} max={100} className="w-full px-3 py-2 border rounded-lg mt-1" value={perfAdj} onChange={e => setPerfAdj(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-slate-500">潜力评分</label>
                <input type="number" min={0} max={100} className="w-full px-3 py-2 border rounded-lg mt-1" value={potAdj} onChange={e => setPotAdj(e.target.value)} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-slate-500">校准理由/决策依据</label>
              <textarea rows={2} className="w-full px-3 py-2 border rounded-lg mt-1" placeholder="记录 HR 调整原因..." value={hrNotes} onChange={e => setHrNotes(e.target.value)} />
            </div>
            <button onClick={handleSaveCalibration} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
              保存校准结果
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold mb-3">人才标签与发展建议</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(record.finalResult?.talentTags ?? record.aiAnalysis.suggestion.talentTags).map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">{tag}</span>
              ))}
            </div>
            {record.finalResult?.developmentSuggestions && record.finalResult.developmentSuggestions.length > 0 && (
              <ul className="text-sm space-y-1 list-disc list-inside text-slate-600">
                {record.finalResult.developmentSuggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

