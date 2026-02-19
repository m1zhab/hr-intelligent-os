
import React, { useState, useRef, useEffect } from 'react';
import { getAIClient, encodeAudio, decodeAudio, decodeAudioData, localAIRequest } from '../hrIntelligence';
import { LiveServerMessage, Modality } from '@google/genai';
import { AIProvider } from '../types';

interface ChatMessage {
  role: 'AI' | 'User';
  text: string;
}

interface InterviewProps {
  mode?: AIProvider;
}

const ROLES = [
  "HFT Core Developer",
  "Quantitative Risk Analyst",
  "AI Research Scientist",
  "Lead UX Architect (Trading)",
  "Blockchain Security Engineer",
  "Product Designer (Creative)"
];

const InterviewLive: React.FC<InterviewProps> = ({ mode = AIProvider.LOCAL }) => {
  const [isActive, setIsActive] = useState(false);
  const [targetRole, setTargetRole] = useState(ROLES[0]);
  
  const [history, setHistory] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('interview_history');
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [currentAiText, setCurrentAiText] = useState("");
  const [currentUserText, setCurrentUserText] = useState("");
  const [status, setStatus] = useState<string>("Ready to start");
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const outputContextRef = useRef<AudioContext | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const aiAccumulator = useRef("");
  const userAccumulator = useRef("");

  // Persist history
  useEffect(() => {
    localStorage.setItem('interview_history', JSON.stringify(history));
  }, [history]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [history, currentAiText, currentUserText]);

  const getSystemInstruction = () => `
    You are an AI Recruitment Engine for Deriv Technologies.
    IDENTITY: Admit you are an AI. 
    ROLE: Interviewing for ${targetRole}.
    PROTOCOL: 
    1. Introduce yourself first and ask the initial question.
    2. Ask exactly one question at a time.
    3. Stay technical and professional.
    4. End with: "The floor is yours."
  `.trim();

  const startAdvancedSession = async () => {
    try {
      setStatus("Establishing Secure Link...");
      const ai = getAIClient();
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      outputContextRef.current = outputCtx;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setStatus("AI INITIALIZING...");
            
            // Proactive AI Start
            sessionPromise.then(s => {
              s.sendRealtimeInput({
                media: { data: "", mimeType: 'audio/pcm;rate=16000' }
              });
            });

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) { int16[i] = inputData[i] * 32768; }
              sessionPromise.then(s => {
                if (s) s.sendRealtimeInput({ 
                  media: { data: encodeAudio(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
                });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.modelTurn) {
               if (userAccumulator.current.trim()) {
                 const finalUserText = userAccumulator.current;
                 setHistory(prev => [...prev, { role: 'User', text: finalUserText }]);
                 userAccumulator.current = "";
                 setCurrentUserText("");
               }
               setIsSpeaking(true);
               setStatus("INTERVIEWER SPEAKING...");
            }

            if (message.serverContent?.outputTranscription) {
              const chunk = message.serverContent.outputTranscription.text;
              aiAccumulator.current += chunk;
              setCurrentAiText(prev => prev + chunk);
            }
            if (message.serverContent?.inputTranscription) {
              const chunk = message.serverContent.inputTranscription.text;
              userAccumulator.current += chunk;
              setCurrentUserText(prev => prev + chunk);
            }

            if (message.serverContent?.turnComplete) {
              setIsSpeaking(false);
              setStatus("YOUR TURN / LISTENING...");
              if (aiAccumulator.current.trim()) {
                const finalAiText = aiAccumulator.current;
                setHistory(prev => [...prev, { role: 'AI', text: finalAiText }]);
                aiAccumulator.current = "";
                setCurrentAiText("");
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const decoded = decodeAudio(audioData);
              const buffer = await decodeAudioData(decoded, outputContextRef.current, 24000, 1);
              const source = outputContextRef.current.createBufferSource();
              source.buffer = buffer;
              source.connect(outputContextRef.current.destination);
              const startTime = Math.max(nextStartTimeRef.current, outputContextRef.current.currentTime);
              source.start(startTime);
              nextStartTimeRef.current = startTime + buffer.duration;
            }
          },
          onerror: (e: any) => {
            console.error('Session Error:', e);
            setStatus("Link Interrupted");
          },
          onclose: () => {
            setIsActive(false);
            setStatus("Ready to start");
          }
        },
        config: { 
          responseModalities: [Modality.AUDIO], 
          outputAudioTranscription: {}, 
          inputAudioTranscription: {},
          systemInstruction: getSystemInstruction()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { 
      console.error(err);
      setStatus("Node Connection Failed"); 
    }
  };

  const startLocalSession = async () => {
    setStatus("Activating Local Node...");
    try {
      const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      recognition.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            handleLocalTurn(event.results[i][0].transcript);
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        setCurrentUserText(interim);
      };

      recognition.onstart = () => { if (!isSpeaking) setStatus("YOUR TURN / LISTENING..."); };
      recognition.onend = () => { if (isActive) recognition.start(); };
      recognition.start();
      setIsActive(true);
      
      setStatus("AI SYNCING...");
      const historyContext = history.length > 0 
        ? `Previous conversation summary: ${history.slice(-3).map(h => `${h.role}: ${h.text}`).join(' ')}` 
        : "No history. This is the very start.";

      const startPrompt = `Identify yourself as an AI Interviewer for Deriv. ${historyContext}. If it's the start, admit you're an AI and ask the first question. If resuming, pick up where we left off for the ${targetRole} role. End with 'The floor is yours.'`;
      
      const aiResponse = await localAIRequest(startPrompt);
      setHistory(prev => [...prev, { role: 'AI', text: aiResponse }]);
      speakText(aiResponse);
    } catch (e) {
      console.error(e);
      setStatus("Audio API Restricted");
    }
  };

  const speakText = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => { setIsSpeaking(true); setStatus("INTERVIEWER SPEAKING..."); };
    utterance.onend = () => { setIsSpeaking(false); setStatus("YOUR TURN / LISTENING..."); };
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleLocalTurn = async (userText: string) => {
    if (!userText.trim()) return;
    setHistory(prev => [...prev, { role: 'User', text: userText }]);
    setCurrentUserText("");
    setStatus("AI PROCESSING...");
    
    try {
      const context = history.map(h => `${h.role}: ${h.text}`).join('\n');
      const aiResponse = await localAIRequest(`${getSystemInstruction()}\n\nHistory:\n${context}\nCandidate: ${userText}\nAI Interviewer:`);
      setHistory(prev => [...prev, { role: 'AI', text: aiResponse }]);
      speakText(aiResponse);
    } catch (e: any) {
      console.error(e);
      setStatus("Local Node Error");
    }
  };

  const stopSession = () => {
    window.speechSynthesis.cancel();
    if (sessionRef.current) {
      try { sessionRef.current.close(); } catch (e) {}
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    
    setIsActive(false);
    setIsSpeaking(false);
    setStatus("Ready to resume");
    
    // Clear accumulators
    userAccumulator.current = "";
    aiAccumulator.current = "";
    
    // Clear interim states
    setCurrentAiText("");
    setCurrentUserText("");
    
    // Reset audio scheduler
    nextStartTimeRef.current = 0;
  };

  const resetInterview = () => {
    if (window.confirm("This will permanently erase the current interview transcript and reset all session markers. Proceed?")) {
        // Force thorough cleanup first
        stopSession();
        
        // Wipe state
        setHistory([]);
        
        // Wipe localStorage explicitly
        localStorage.removeItem('interview_history');
        
        // Update UI
        setStatus("Registry Cleared");
        
        // Final sanity check for refs
        userAccumulator.current = "";
        aiAccumulator.current = "";
        nextStartTimeRef.current = 0;
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <header className="text-center flex flex-col items-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">AI Interview Assistant</h2>
        <p className="text-slate-500 mt-2 font-medium">
          Persistent Recruitment Node • <span className="text-blue-600 font-extrabold">{targetRole}</span>
        </p>
      </header>

      {!isActive && (
        <div className="bg-white rounded-[2rem] p-10 shadow-xl border border-slate-200 text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-inner">🤖</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{history.length > 0 ? 'Resume Session' : 'New Interview Session'}</h3>
          <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
            {history.length > 0 
              ? `You have an existing conversation for ${targetRole}. You can pick up exactly where you left off.` 
              : "Our AI Interviewer is ready. Select a role and enter the environment."}
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
            {ROLES.map(role => (
              <button
                key={role}
                onClick={() => setTargetRole(role)}
                className={`px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  targetRole === role 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200 scale-105' 
                    : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-blue-300'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
          
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button 
              onClick={mode === AIProvider.LOCAL ? startLocalSession : startAdvancedSession}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-800 transition transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {history.length > 0 ? 'Resume Transcript' : 'Initiate Session'}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"/></svg>
            </button>
            
            {history.length > 0 && (
              <button 
                onClick={resetInterview}
                className="text-[10px] font-black text-red-500 uppercase tracking-widest py-2 hover:bg-red-50 rounded-xl transition border border-transparent hover:border-red-100"
              >
                Reset & Clear Progress
              </button>
            )}
          </div>
        </div>
      )}

      {isActive && (
        <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-8">
          <div className={`p-8 flex justify-between items-center transition-all duration-700 ${isSpeaking ? 'bg-slate-900' : 'bg-emerald-600'}`}>
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className={`w-4 h-4 rounded-full ${isSpeaking ? 'bg-blue-400' : 'bg-white'} transition-colors`}></div>
                {!isSpeaking && <div className="absolute inset-0 w-4 h-4 rounded-full bg-white animate-ping"></div>}
              </div>
              <div className="flex flex-col">
                <span className={`font-black uppercase tracking-[0.25em] text-[11px] transition-colors ${isSpeaking ? 'text-white' : 'text-emerald-50'}`}>
                  {status}
                </span>
                <span className={`text-[8px] font-bold uppercase tracking-widest mt-0.5 ${isSpeaking ? 'text-slate-500' : 'text-emerald-200'}`}>
                  AI RECRUITMENT ENGINE • ID: DERIV-OS-001
                </span>
              </div>
            </div>
            <button 
              onClick={stopSession}
              className="px-6 py-2 rounded-full font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[10px] uppercase tracking-widest transition-all"
            >
              Pause
            </button>
          </div>

          <div className="p-8 h-[550px] flex flex-col bg-slate-50/50">
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar" id="chat-container" ref={chatContainerRef}>
               {/* HISTORY FLOW: Oldest at top, newest at bottom */}
               {history.map((msg, i) => (
                 <div key={i} className={`p-6 rounded-3xl max-w-[85%] animate-in fade-in slide-in-from-bottom-2 ${msg.role === 'AI' ? 'bg-white text-slate-800 self-start shadow-sm border border-slate-100' : 'bg-blue-600 text-white self-end ml-auto shadow-xl ring-4 ring-blue-500/10'}`}>
                   <div className="flex items-center gap-2 mb-3">
                     <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${msg.role === 'AI' ? 'text-blue-500' : 'text-blue-200'}`}>{msg.role === 'AI' ? 'AI INTERVIEWER' : 'CANDIDATE'}</span>
                   </div>
                   <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                 </div>
               ))}

               {/* ACTIVE USER SPEECH */}
               {currentUserText.trim().length > 0 && (
                 <div className="p-6 rounded-3xl max-w-[85%] bg-emerald-50 text-emerald-900 self-end ml-auto border-2 border-emerald-200 border-dashed shadow-inner animate-in fade-in">
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                     Capturing Response...
                   </p>
                   <p className="text-sm font-medium leading-relaxed italic opacity-70">"{currentUserText}"</p>
                 </div>
               )}

               {/* ACTIVE AI SPEECH */}
               {currentAiText.trim().length > 0 && (
                 <div className="p-6 rounded-3xl max-w-[85%] bg-white text-slate-800 self-start border-2 border-blue-200 border-dashed animate-pulse">
                   <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">AI Synthesizing...</p>
                   <p className="text-sm font-medium leading-relaxed">{currentAiText}</p>
                 </div>
               )}
            </div>
          </div>
          
          <div className="px-8 py-5 bg-white border-t border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm">AI</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transparency Protocol</p>
                <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter italic">Machine-Lead Technical Screening</p>
              </div>
            </div>
            
            {!isSpeaking && isActive && (
              <div className="animate-in fade-in slide-in-from-right-4">
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 uppercase tracking-[0.2em]">
                  🎤 Microphones Active
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewLive;
