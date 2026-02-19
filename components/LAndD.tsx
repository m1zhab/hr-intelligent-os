
import React, { useState } from 'react';
import { Employee } from '../types';
import { generateCareerPath } from '../hrIntelligence';

interface LAndDProps {
  employees: Employee[];
}

const LAndD: React.FC<LAndDProps> = ({ employees }) => {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGen = async (emp: Employee) => {
    setSelectedEmp(emp);
    setLoading(true);
    setPath(null);
    try {
      const res = await generateCareerPath(emp);
      setPath(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Career Architect</h2>
        <p className="text-slate-500 mt-1">AI-driven professional growth mapping and trajectory analysis for Deriv specialists.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Select Talent</h3>
            <div className="space-y-2">
               {employees.map(emp => (
                 <button 
                   key={emp.id}
                   onClick={() => handleGen(emp)}
                   className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all text-left ${
                     selectedEmp?.id === emp.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50 hover:bg-white'
                   }`}
                 >
                   <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-sm">
                     {emp.name[0]}
                   </div>
                   <div>
                     <p className="font-bold text-slate-800 text-sm">{emp.name}</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{emp.role}</p>
                   </div>
                 </button>
               ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
           {!selectedEmp ? (
             <div className="h-[400px] bg-white rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                <span className="text-4xl mb-4">🪜</span>
                <p className="font-medium tracking-tight">Select an employee to design their trajectory</p>
             </div>
           ) : loading ? (
             <div className="h-[400px] bg-white rounded-3xl border border-slate-200 flex flex-col items-center justify-center gap-6">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold animate-pulse tracking-wide">Mapping 12-month evolution...</p>
             </div>
           ) : path ? (
             <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10 text-8xl">🚀</div>
                   <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">Predicted Trajectory</h3>
                   <p className="text-2xl font-black leading-tight mb-8 tracking-tight">"{path.trajectory}"</p>
                   <div className="flex flex-wrap gap-2.5">
                      {path.certifications.map((c: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black border border-white/20 uppercase tracking-widest">{c}</span>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm relative">
                   <h3 className="text-xl font-bold text-slate-800 mb-10 tracking-tight">Growth Milestones</h3>
                   <div className="space-y-10 relative">
                      <div className="absolute left-[11px] top-2 bottom-2 w-1 bg-slate-50"></div>
                      {path.milestones.map((m: any, i: number) => (
                        <div key={i} className="relative pl-10">
                           <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-[6px] border-blue-500 z-10 shadow-sm"></div>
                           <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 hover:border-blue-100 transition-colors">
                              <span className="text-[10px] font-black text-blue-500 uppercase mb-2 block tracking-widest">{m.month}</span>
                              <h4 className="font-bold text-slate-800 text-lg mb-2 tracking-tight">{m.goal}</h4>
                              <p className="text-sm text-slate-500 font-medium">Focus Skill: <span className="font-bold text-slate-800">{m.skill}</span></p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ) : null}
        </div>
      </div>
    </div>
  );
};

export default LAndD;
