
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Onboarding from './components/Onboarding';
import InterviewLive from './components/InterviewLive';
import Compliance from './components/Compliance';
import Pulse from './components/Pulse';
import LAndD from './components/LAndD';
import { AppView, AIProvider, Employee } from './types';
import { setAIProvider, setLocalConfig } from './hrIntelligence';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [provider, setProvider] = useState<AIProvider>(localStorage.getItem('ai_provider') as AIProvider || AIProvider.LOCAL);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings Panel
  const [showSettings, setShowSettings] = useState(false);
  const [localUrl, setLocalUrl] = useState(localStorage.getItem('localUrl') || 'http://localhost:11434/v1');
  const [localModel, setLocalModel] = useState(localStorage.getItem('localModel') || 'mistral:14b');
  
  // HR Admin Signatory Provisions
  const [adminName, setAdminName] = useState(localStorage.getItem('adminName') || 'Sarah Al-Mansoori');
  const [adminTitle, setAdminTitle] = useState(localStorage.getItem('adminTitle') || 'Chief People Officer');

  useEffect(() => {
    setAIProvider(provider);
  }, [provider]);

  useEffect(() => {
    setLocalConfig(localUrl, localModel);
    localStorage.setItem('localUrl', localUrl);
    localStorage.setItem('localModel', localModel);
    localStorage.setItem('adminName', adminName);
    localStorage.setItem('adminTitle', adminTitle);
  }, [localUrl, localModel, adminName, adminTitle]);

  useEffect(() => {
    fetch('./employees.json')
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load employee data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      
      <main className="flex-1 overflow-y-auto relative p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Control Bar */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Operational Console</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex gap-1 items-center">
                <button 
                  onClick={() => setProvider(AIProvider.LOCAL)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${provider === AIProvider.LOCAL ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <span className={`w-2 h-2 rounded-full ${provider === AIProvider.LOCAL ? 'bg-green-400 animate-pulse' : 'bg-slate-300'}`}></span>
                  Local Node (Mistral)
                </button>
                <button 
                  onClick={() => setProvider(AIProvider.ADVANCED)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${provider === AIProvider.ADVANCED ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Advanced Node
                </button>
              </div>
              
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className={`p-3 rounded-2xl transition-all border ${showSettings ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </button>
            </div>
          </div>

          {showSettings && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowSettings(false)}>
              <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl w-full max-w-xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-slate-800 tracking-tight">System Configuration</h2>
                   <button onClick={() => setShowSettings(false)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition">✕</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                   <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Inference Node</p>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Ollama Endpoint</label>
                              <input value={localUrl} onChange={e => setLocalUrl(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"/>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Model Identifier</label>
                              <input value={localModel} onChange={e => setLocalModel(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"/>
                           </div>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-4">Authorized Signatory</p>
                        <div className="space-y-4">
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Legal Name</label>
                              <input value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500"/>
                           </div>
                           <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Designation</label>
                              <input value={adminTitle} onChange={e => setAdminTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-amber-500"/>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8">
                   <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Local Startup Guide (Shell)</p>
                   <code className="block bg-slate-900 text-blue-400 p-4 rounded-xl text-[11px] font-mono leading-relaxed overflow-x-auto">
                      # Mac/Linux<br/>
                      OLLAMA_ORIGINS="*" ollama serve<br/><br/>
                      # Windows (Powershell)<br/>
                      $env:OLLAMA_ORIGINS="*"; ollama serve
                   </code>
                </div>

                <button onClick={() => setShowSettings(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/30 hover:bg-blue-700 transition">Save & Apply Architecture</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-slate-400">
               <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-500 rounded-full animate-spin"></div>
               <p className="font-bold tracking-widest uppercase text-[10px]">Synchronizing System State...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-700">
              {activeView === AppView.DASHBOARD && <Dashboard employees={employees} />}
              {activeView === AppView.ONBOARDING && <Onboarding adminName={adminName} adminTitle={adminTitle} />}
              {activeView === AppView.INTERVIEW && <InterviewLive mode={provider} />}
              {activeView === AppView.COMPLIANCE && <Compliance />}
              {activeView === AppView.PULSE && <Pulse />}
              {activeView === AppView.L_AND_D && <LAndD employees={employees} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
