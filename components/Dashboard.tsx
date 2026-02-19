
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Employee, EmployeePattern, AnalysisResult, TalentResult, Metric } from '../types';
import { analyzeBurnout, analyzeTalent } from '../hrIntelligence';

interface DashboardProps {
  employees: Employee[];
}

const Dashboard: React.FC<DashboardProps> = ({ employees }) => {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | TalentResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (emp: Employee) => {
    setSelectedEmp(emp);
    setLoading(true);
    setAnalysis(null);
    try {
      if (emp.pattern === EmployeePattern.BURNOUT) {
        const res = await analyzeBurnout(emp);
        setAnalysis(res);
      } else {
        const res = await analyzeTalent(emp);
        setAnalysis(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const employeeStats = useMemo(() => {
    if (!selectedEmp) return null;
    const metrics = selectedEmp.metrics;
    const count = metrics.length;
    return {
      avgCommits: Math.round(metrics.reduce((acc, m) => acc + m.commits, 0) / count),
      avgReviews: Math.round(metrics.reduce((acc, m) => acc + m.code_reviews_given, 0) / count),
      avgMeetings: Math.round(metrics.reduce((acc, m) => acc + m.meeting_hours, 0) / count),
      totalPRs: metrics.reduce((acc, m) => acc + m.prs_merged, 0),
      totalMessages: metrics.reduce((acc, m) => acc + m.messages_sent, 0),
      afterHours: metrics.reduce((acc, m) => acc + m.after_hours_sessions, 0)
    };
  }, [selectedEmp]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Team Intelligence</h2>
          <p className="text-slate-500 mt-1">Multi-parameter workforce mapping and behavioral analytics.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl border border-slate-800 shadow-xl">
           <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">Dataset Sync Active</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Employee List Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-200 sticky top-8">
            <h3 className="text-xs font-black mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
              Workforce Registry
            </h3>
            <div className="space-y-3">
              {employees.map(emp => (
                <div 
                  key={emp.id}
                  onClick={() => handleAnalyze(emp)}
                  className={`flex flex-col p-4 rounded-3xl border transition-all cursor-pointer group ${
                    selectedEmp?.id === emp.id 
                      ? 'border-blue-500 bg-blue-50/50 shadow-md' 
                      : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{emp.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{emp.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                      emp.pattern === EmployeePattern.BURNOUT ? 'bg-red-100 text-red-600' : (emp.pattern === EmployeePattern.TALENT ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-600')
                    }`}>
                      {emp.pattern.replace('_', ' ')}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400">ID: {emp.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data & Analysis Column */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedEmp ? (
             <div className="h-[600px] bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">📈</div>
                <h3 className="text-xl font-bold text-slate-400 mb-2">Diagnostic Ready</h3>
                <p className="text-sm font-medium max-w-xs">Select a profile to visualize behavioral parameters and AI-driven multipliers.</p>
             </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Avg Commits', value: employeeStats?.avgCommits, icon: '💻', color: 'text-blue-600' },
                  { label: 'Avg Reviews', value: employeeStats?.avgReviews, icon: '🔍', color: 'text-emerald-600' },
                  { label: 'Avg Meetings', value: employeeStats?.avgMeetings, icon: '🕒', color: 'text-amber-600' },
                  { label: 'Total PRs', value: employeeStats?.totalPRs, icon: '🚀', color: 'text-indigo-600' },
                  { label: 'Messages', value: employeeStats?.totalMessages, icon: '💬', color: 'text-purple-600' },
                  { label: 'Overtime', value: employeeStats?.afterHours, icon: '🌙', color: 'text-rose-600' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{stat.icon}</span>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                    </div>
                    <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Metric Chart */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
                      <h3 className="text-lg font-bold text-slate-800">Behavioral Trajectory</h3>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commits</span></div>
                      <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meetings</span></div>
                   </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedEmp.metrics}>
                      <defs>
                        <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `WEEK ${v}`} />
                      <YAxis stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} 
                        itemStyle={{ fontWeight: '900', fontSize: '11px', textTransform: 'uppercase' }}
                      />
                      <Area type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCommits)" />
                      <Area type="monotone" dataKey="meeting_hours" stroke="#f43f5e" strokeWidth={4} fillOpacity={1} fill="url(#colorMeetings)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Raw Dataset Table */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 overflow-hidden">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Parameter Audit Log</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cycle</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reviews</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">PRs</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Sessions</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedEmp.metrics.map((m, i) => (
                        <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 font-black text-slate-400 text-xs">W0{m.week}</td>
                          <td className="py-4 text-center font-bold text-slate-700">{m.code_reviews_given}</td>
                          <td className="py-4 text-center font-bold text-slate-700">{m.prs_merged}</td>
                          <td className="py-4 text-center font-bold text-slate-700">{m.after_hours_sessions}</td>
                          <td className="py-4 text-right">
                             <div className="inline-flex gap-1 h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="bg-blue-500" style={{ width: `${(m.commits / 25) * 100}%` }}></div>
                                <div className="bg-rose-500" style={{ width: `${(m.meeting_hours / 35) * 100}%` }}></div>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Report Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-4">
            {selectedEmp && (
              <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-200 min-h-[600px] flex flex-col animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black shadow-lg shadow-indigo-200">AI</div>
                  <div>
                    <h3 className="font-black text-slate-900 tracking-tight leading-none mb-1">Intelligence</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Heuristic Engine 4.1</p>
                  </div>
                </div>

                {loading ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-6 py-20">
                    <div className="w-12 h-12 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-[10px] font-black animate-pulse tracking-[0.2em] uppercase">Processing Parameters...</p>
                  </div>
                ) : analysis ? (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    {'score' in analysis ? (
                      <>
                        <div className="bg-rose-50 rounded-[2rem] p-8 border border-rose-100 text-center shadow-inner group">
                          <div className="text-6xl font-black text-rose-600 group-hover:scale-110 transition-transform">{analysis.score}</div>
                          <p className="text-[10px] font-black text-rose-400 uppercase tracking-[0.2em] mt-3">Burnout Threshold</p>
                          <div className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-lg shadow-rose-500/30">
                            {analysis.level} Priority
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                             <span className="w-1 h-1 bg-rose-500 rounded-full"></span> Critical Signals
                          </h4>
                          <div className="space-y-3">
                            {analysis.signals.map((s, i) => (
                              <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                <span className="text-xl leading-none grayscale group-hover:grayscale-0 transition-all">⚠️</span>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed">{s}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 text-center shadow-inner group">
                          <div className="text-6xl font-black text-amber-600 group-hover:scale-110 transition-transform">{analysis.confidence}%</div>
                          <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mt-3">Multiplier Score</p>
                          <div className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-lg shadow-amber-500/30">
                            Hidden Talent detected
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-1 h-1 bg-amber-500 rounded-full"></span> Multiplier Evidence
                          </h4>
                          <div className="space-y-3">
                            {analysis.evidence.map((e, i) => (
                              <div key={i} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 group">
                                <span className="text-xl leading-none grayscale group-hover:grayscale-0 transition-all">⭐</span>
                                <p className="text-xs text-slate-600 font-bold leading-relaxed">{e}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="pt-6 border-t border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Strategic recommendation</h4>
                       <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-3 opacity-10 text-2xl group-hover:rotate-12 transition-transform">🧠</div>
                          <p className="text-xs text-indigo-900 font-bold leading-relaxed italic z-10 relative">
                            {/* Fixed TypeScript error: Property 'summary' does not exist on type 'AnalysisResult | TalentResult'. */}
                            "{'summary' in analysis ? analysis.summary : (analysis as any).recommendation}"
                          </p>
                       </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
