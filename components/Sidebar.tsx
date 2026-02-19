
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate }) => {
  const items = [
    { id: AppView.DASHBOARD, label: 'Team Intel', icon: '📊' },
    { id: AppView.ONBOARDING, label: 'Onboarding', icon: '🚀' },
    { id: AppView.INTERVIEW, label: 'Live Interview', icon: '🎙️' },
    { id: AppView.L_AND_D, label: 'Career Architect', icon: '🪜' },
    { id: AppView.PULSE, label: 'Pulse & Feedback', icon: '❤️' },
    { id: AppView.COMPLIANCE, label: 'Compliance', icon: '⚖️' },
  ];

  return (
    <aside className="w-64 h-full bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold">HR</div>
          <h1 className="text-xl font-bold tracking-tight">Intelligence</h1>
        </div>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Deriv UAE OS</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeView === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Compute Engine</p>
          <p className="text-xs font-medium text-slate-300">Mistral 14B + Cloud Flash</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] text-green-400 font-bold">CORE ACTIVE</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
