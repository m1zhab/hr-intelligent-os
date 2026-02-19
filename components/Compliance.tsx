
import React from 'react';

const Compliance: React.FC = () => {
  const alerts = [
    { name: 'Raj Patel', type: 'Work Visa Renewal', days: 12, severity: 'critical' },
    { name: 'Mohammed Al-Zarouni', type: 'Residency Permit Expiry', days: 45, severity: 'warning' },
    { name: 'Fatima Qasim', type: 'Emirates ID Update', days: 88, severity: 'low' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Compliance & Registry</h2>
        <p className="text-slate-500 mt-1">Autonomous monitoring of UAE labor laws and visa statuses.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-slate-800">Expiry Watchlist</h3>
             <span className="text-[10px] font-black bg-red-100 text-red-600 px-3 py-1 rounded-full uppercase">Priority Monitor</span>
           </div>
           <div className="space-y-4">
              {alerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md transition-all group">
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{alert.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{alert.type}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-black ${alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`}>{alert.days}d</div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Remaining</p>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
           <div className="z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-500">⚖️</div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">Predictive Policy Insight</h3>
              <p className="text-blue-100 leading-relaxed font-medium">
                Advanced AI analysis predicts a 25% increase in visa processing times in Q3 due to regional updates. The system has automatically calibrated renewal alerts to initiate 60 days earlier for all UAE-based residents to ensure zero disruption in operational continuity.
              </p>
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-10 -mb-10 blur-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
