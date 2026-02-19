
import React, { useState } from 'react';
import { analyzeSentiment } from '../hrIntelligence';

const Pulse: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeSentiment(feedback);
      
      // Robust percentage normalization
      let sentiment = result.sentiment;
      if (typeof sentiment === 'number') {
        if (sentiment <= 1 && sentiment > 0) sentiment = Math.round(sentiment * 100);
        else sentiment = Math.round(sentiment);
      } else {
        sentiment = 50; // Default fallback
      }
      
      setAnalysis({ ...result, sentiment });
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const circumference = 2 * Math.PI * 42; // Radius is 42

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Pulse & Sentiment</h2>
        <p className="text-slate-500 mt-1">Real-time analysis of employee morale and feedback signals.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
           <h3 className="text-xl font-bold mb-6 text-slate-800">Feedback Intake</h3>
           <textarea 
             value={feedback}
             onChange={(e) => setFeedback(e.target.value)}
             placeholder="Paste employee survey comments or slack feedback here..."
             className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-medium"
           />
           {error && (
             <p className="mt-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100">{error}</p>
           )}
           <div className="flex gap-3 mt-4">
             <button 
               onClick={handleAnalyze}
               disabled={loading || !feedback}
               className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50 shadow-xl"
             >
               {loading ? 'Synthesizing Sentiment...' : 'Analyze Feedback'}
             </button>
             <button 
               onClick={() => setFeedback("The HFT core updates have been intense but the team collaboration is at an all-time high. I'm feeling very motivated.")}
               className="px-4 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100 transition border border-blue-100"
             >
               Sample Postive
             </button>
           </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col min-h-[350px]">
             <h3 className="text-xl font-bold mb-6 text-slate-800">Sentiment Engine</h3>
             {analysis ? (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                 <div className="flex items-center gap-6">
                   <div className="w-28 h-28 rounded-full flex items-center justify-center relative">
                      <svg className="w-full h-full absolute -rotate-90" viewBox="0 0 96 96">
                         <circle 
                           cx="48" cy="48" r="42" 
                           fill={analysis.sentiment >= 70 ? 'rgba(16, 185, 129, 0.05)' : (analysis.sentiment >= 40 ? 'rgba(245, 158, 11, 0.05)' : 'rgba(239, 68, 68, 0.05)')}
                         />
                         <circle 
                           cx="48" cy="48" r="42" 
                           fill="transparent" 
                           stroke="#f1f5f9" 
                           strokeWidth="8"
                         />
                         <circle 
                           cx="48" cy="48" r="42" 
                           fill="transparent" 
                           stroke={analysis.sentiment >= 70 ? '#10b981' : (analysis.sentiment >= 40 ? '#f59e0b' : '#ef4444')} 
                           strokeWidth="8" 
                           strokeDasharray={`${(analysis.sentiment / 100) * circumference} ${circumference}`}
                           strokeLinecap="round"
                           className="transition-all duration-1000 ease-out"
                         />
                      </svg>
                      <div className="flex flex-col items-center justify-center z-10">
                        <span className="text-3xl font-black text-slate-800 leading-none">{analysis.sentiment}%</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase mt-1 tracking-widest">Score</span>
                      </div>
                   </div>
                   <div>
                      <p className="text-sm font-bold text-slate-800 uppercase tracking-widest">Morale Index</p>
                      <p className={`text-xs mt-1 font-bold ${analysis.sentiment >= 70 ? 'text-green-600' : (analysis.sentiment >= 40 ? 'text-amber-600' : 'text-red-600')}`}>
                        {analysis.sentiment >= 70 ? 'High Morale Detected' : (analysis.sentiment >= 40 ? 'Moderate Engagement' : 'Intervention Recommended')}
                      </p>
                   </div>
                 </div>

                 <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl font-black italic group-hover:opacity-10 transition-opacity">PLAN</div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Strategic Action</h4>
                    <p className="text-sm font-medium leading-relaxed italic">"{analysis.action}"</p>
                 </div>

                 {analysis.concerns && analysis.concerns.length > 0 && (
                   <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Identified Signals</h4>
                      <div className="flex flex-wrap gap-2">
                         {analysis.concerns.map((c: string, i: number) => (
                           <span key={i} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 hover:border-blue-200 transition-colors">{c}</span>
                         ))}
                      </div>
                   </div>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50 italic space-y-4">
                 <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-2xl animate-pulse">🧠</div>
                 <p className="text-sm font-medium">Waiting for analysis processing...</p>
               </div>
             )}
          </div>

          {analysis?.wellness && analysis.wellness.length > 0 && (
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl animate-in fade-in duration-1000">
               <h4 className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-4">Wellness Recommendations</h4>
               <div className="space-y-3">
                  {analysis.wellness.map((w: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start bg-white/10 p-3 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                       <span className="text-lg">🌿</span>
                       <p className="text-sm font-medium">{w}</p>
                    </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pulse;
