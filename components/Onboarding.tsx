
import React, { useState } from 'react';
import { generateContract, researchSalary, generateJD } from '../hrIntelligence';
import { SalaryResearchResult } from '../types';

interface OnboardingProps {
  adminName: string;
  adminTitle: string;
}

const Onboarding: React.FC<OnboardingProps> = ({ adminName, adminTitle }) => {
  const [loading, setLoading] = useState(false);
  const [researchLoading, setResearchLoading] = useState(false);
  const [jdLoading, setJdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [contractText, setContractText] = useState("");
  const [jdText, setJdText] = useState("");
  const [salaryResult, setSalaryResult] = useState<SalaryResearchResult | null>(null);

  const [formData, setFormData] = useState({
    name: 'Jana Al-Shehhi',
    role: 'Quantitative UX Architect',
    salary: '35000',
    nationality: 'UAE',
    idType: 'Emirates ID',
    idValue: '784-1995-1234567-1'
  });

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    setContractText("");
    setJdText("");
    try {
      const text = await generateContract({
        ...formData,
        signatoryName: adminName,
        signatoryRole: adminTitle
      });
      if (!text) throw new Error("AI returned empty content");
      setContractText(text);
    } catch (e: any) {
      console.error(e);
      setError(`Contract Generation Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResearch = async () => {
    setResearchLoading(true);
    setError(null);
    try {
      const res = await researchSalary(formData.role);
      setSalaryResult(res);
    } catch (e: any) {
      console.error(e);
      setError(`Market Research Failed: ${e.message}`);
    } finally {
      setResearchLoading(false);
    }
  };

  const handleGenerateJD = async () => {
    setJdLoading(true);
    setError(null);
    setJdText("");
    setContractText("");
    try {
      const res = await generateJD(formData.role);
      if (!res) throw new Error("AI returned empty content");
      setJdText(res);
    } catch (e: any) {
      console.error(e);
      setError(`JD Generation Failed: ${e.message}`);
    } finally {
      setJdLoading(false);
    }
  };

  const todayDisplay = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).replace(/(\d+)\s(\w+)\s(\d+)/, '$1 $2, $3');

  const insertableElements = [
    { tag: '{{ContractDate}}', value: todayDisplay, source: 'System Time' },
    { tag: '{{CandidateName}}', value: formData.name, source: 'Form Input' },
    { tag: '{{JobTitle}}', value: formData.role, source: 'Form Input' },
    { tag: '{{Identification}}', value: `${formData.idType}: ${formData.idValue}`, source: 'Form Input' },
    { tag: '{{MonthlySalary}}', value: formData.salary + ' AED', source: 'Form Input' },
    { tag: '{{Nationality}}', value: formData.nationality, source: 'Form Input' },
    { tag: '{{Signatory}}', value: adminName, source: 'Admin Settings' },
    { tag: '{{SignatoryRole}}', value: adminTitle, source: 'Admin Settings' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Invisible Onboarding</h2>
          <p className="text-slate-500 mt-1">Automated hiring workflows for Deriv UAE.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Deriv Talent Portal Active</span>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
          <span className="text-xl">⚠️</span>
          <div className="flex-1">
            <p className="font-bold text-sm">System Alert</p>
            <p className="text-xs">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-sm font-bold">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Candidate Submission</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Name</label>
                <input 
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Role</label>
                  <input 
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Salary (AED)</label>
                  <input 
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({...formData, salary: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nationality</label>
                  <input 
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Type</label>
                   <select 
                     value={formData.idType}
                     onChange={(e) => setFormData({...formData, idType: e.target.value})}
                     className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                   >
                     <option value="Emirates ID">Emirates ID</option>
                     <option value="Passport Number">Passport Number</option>
                   </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">ID Number / Passport Details</label>
                <input 
                  type="text"
                  value={formData.idValue}
                  onChange={(e) => setFormData({...formData, idValue: e.target.value})}
                  placeholder={formData.idType === 'Emirates ID' ? '784-XXXX-XXXXXXX-X' : 'Enter Passport No.'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleResearch}
                  disabled={researchLoading}
                  className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {researchLoading ? (
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                  ) : '🔍 Market Rates'}
                </button>
                <button 
                  onClick={handleGenerateJD}
                  disabled={jdLoading}
                  className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition disabled:opacity-50 text-sm"
                >
                  {jdLoading ? 'Drafting...' : '📄 Generate JD'}
                </button>
              </div>

              <button 
                onClick={handleStart}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition disabled:opacity-50 mt-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {loading ? 'Synthesizing Legal Framework...' : 'Execute Onboarding & Contract'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Mapping Registry</h4>
              <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">PREVIEW</span>
            </div>
            <div className="space-y-2">
              {insertableElements.map((el, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter mb-0.5">{el.tag}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">{el.source}</p>
                  </div>
                  <p className="text-xs font-bold text-slate-800 text-right max-w-[150px] truncate">{el.value}</p>
                </div>
              ))}
            </div>
          </div>

          {salaryResult && (
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 animate-in slide-in-from-left-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Market Benchmark (Short Precise)</h4>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div className="text-lg font-black text-amber-900 mb-1 leading-tight">{salaryResult.range}</div>
              <p className="text-[10px] text-amber-700 font-medium mb-3">{salaryResult.insight}</p>
              {salaryResult.sources.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-amber-200">
                  <p className="text-[9px] font-bold text-amber-500 uppercase">Verification Sources:</p>
                  {salaryResult.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block text-[10px] text-blue-600 underline truncate hover:text-blue-800 font-medium">
                      {s.title || s.uri}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-1 flex flex-col shadow-2xl h-[550px] border border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 rounded-t-[2.5rem]">
               <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Document Workspace</h3>
               { (contractText || jdText) && (
                 <button 
                  onClick={() => navigator.clipboard.writeText(contractText || jdText)}
                  className="text-[10px] bg-slate-800 text-slate-400 px-3 py-1 rounded-lg hover:bg-slate-700 transition font-bold uppercase tracking-widest"
                 >
                   Copy Text
                 </button>
               )}
            </div>
            <div className="flex-1 p-8 overflow-y-auto font-mono text-sm text-slate-300 leading-relaxed bg-slate-900/20">
              {loading || jdLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                  <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold uppercase tracking-widest">Synthesizing document...</p>
                </div>
              ) : contractText || jdText ? (
                <div className="whitespace-pre-wrap animate-in fade-in duration-1000 p-2">
                  {contractText || jdText}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                  <div className="text-6xl opacity-10">📜</div>
                  <p className="italic text-center max-w-[200px] text-xs font-medium">Drafting Workspace: Trigger generation to view finalized legal output.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
             <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Provisioning Cascade</h4>
             <div className="space-y-3">
               {[
                 { label: 'Cloud Access (Azure/GCP)', status: loading ? 'pending' : (contractText ? 'complete' : 'idle') },
                 { label: 'Trading Desk Auth', status: loading ? 'pending' : (contractText ? 'complete' : 'idle') },
                 { label: 'E-Visa Filing (MOHRE)', status: loading ? 'pending' : (contractText ? 'complete' : 'idle') },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <span className="text-sm font-semibold text-slate-600">{item.label}</span>
                   <span className={`text-[10px] font-bold uppercase ${
                     item.status === 'complete' ? 'text-green-500' : (item.status === 'pending' ? 'text-blue-500 animate-pulse' : 'text-slate-300')
                   }`}>
                     {item.status}
                   </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
