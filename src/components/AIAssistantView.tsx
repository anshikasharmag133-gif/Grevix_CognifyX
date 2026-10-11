import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  BookOpen,
  FileText,
  Lightbulb,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Info,
  Layers,
  Flame,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import confetti from 'canvas-confetti';

type AssistantMode = 'explain' | 'summarize' | 'notes' | 'strategy';

export const AIAssistantView: React.FC = () => {
  const { subjects, addFlashcard, theme, showToast } = useStudy();

  const isDark = theme === 'dark';

  const [mode, setMode] = useState<AssistantMode>('explain');
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'Data Structures');
  const [selectedTopic, setSelectedTopic] = useState('Dynamic Programming & Memoization');
  const [depth, setDepth] = useState<'simple' | 'exam' | 'deep'>('exam');
  const [conceptInput, setConceptInput] = useState('Optimal Substructure and State Transition');
  const [studentMaterialInput, setStudentMaterialInput] = useState('');
  const [studentQuestionInput, setStudentQuestionInput] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiKeyOnline, setApiKeyOnline] = useState<boolean | null>(null);

  // Check backend server status
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        setApiKeyOnline(Boolean(data.hasApiKey));
      })
      .catch(() => {
        setApiKeyOnline(false);
      });
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setResultText(null);
    setCopied(false);

    try {
      if (mode === 'explain') {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept: conceptInput,
            subject: selectedSubject,
            depth,
            context: studentMaterialInput,
          }),
        });
        const data = await res.json();
        setResultText(data.text);
        setIsFallbackMode(Boolean(data.isFallback));
      } else if (mode === 'summarize') {
        const res = await fetch('/api/ai/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: studentMaterialInput || 'Review core definitions and mathematical bounds.',
            subject: selectedSubject,
            topic: selectedTopic,
          }),
        });
        const data = await res.json();
        setResultText(data.text);
        setIsFallbackMode(Boolean(data.isFallback));
      } else if (mode === 'notes') {
        const res = await fetch('/api/ai/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            concept: `Comprehensive 1-Page Exam Cheat Sheet for ${selectedTopic}`,
            subject: selectedSubject,
            depth: 'exam',
            context: `High-yield definitions, 2-mark key phrases, 5-mark flow diagrams, and common traps in ${selectedTopic}.`,
          }),
        });
        const data = await res.json();
        setResultText(data.text);
        setIsFallbackMode(Boolean(data.isFallback));
      } else if (mode === 'strategy') {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message:
              studentQuestionInput ||
              `I have my ${selectedSubject} exam approaching and I'm struggling with ${selectedTopic}. What is the highest return-on-time study routine?`,
            currentSubject: selectedSubject,
            currentTopic: selectedTopic,
          }),
        });
        const data = await res.json();
        setResultText(data.reply);
        setIsFallbackMode(Boolean(data.isFallback));
      }
    } catch (e: any) {
      console.error('AI assistant error:', e);
      setResultText('An unexpected network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveAsFlashcard = () => {
    if (resultText) {
      addFlashcard({
        subjectId: subjects.find((s) => s.name === selectedSubject)?.id || 'sub-dsa',
        topic: selectedTopic || 'General Revision',
        question: `Explain core principles and key invariants of ${conceptInput || selectedTopic}`,
        answer: resultText.slice(0, 350) + '...',
        keyPoints: [conceptInput || selectedTopic, 'High-Yield Exam Concept', 'AI Generated'],
        mastery: 'need-practice',
      });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      showToast('Saved directly to your Flashcards deck!', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>AI Academic Tutor & Synthesizer</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            CognifyX AI Study Assistant
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Break down difficult concepts, summarize student lecture notes, and generate university-standard
            revision cheat-sheets.
          </p>
        </div>

        {/* Model Status Badge */}
        <div className="flex items-center gap-2">
          {apiKeyOnline === true ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gemini 3.8 Flash Online</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs font-semibold">
              <Info className="w-3.5 h-3.5 text-emerald-500" />
              <span>CognifyX Academic Mode Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            id: 'explain',
            label: 'Concept Explainer',
            desc: 'Feynman & university exam breakdown',
            icon: Lightbulb,
          },
          {
            id: 'summarize',
            label: 'Material Summarizer',
            desc: 'Condense student lecture notes',
            icon: FileText,
          },
          {
            id: 'notes',
            label: 'Revision Cheat-Sheet',
            desc: 'High-yield 1-page exam sheet',
            icon: BookOpen,
          },
          {
            id: 'strategy',
            label: 'Study Strategy Coach',
            desc: 'Optimal exam preparation tactics',
            icon: Sparkles,
          },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = mode === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setMode(item.id as AssistantMode);
                setResultText(null);
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? isDark
                    ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-lg shadow-emerald-500/15'
                    : 'bg-emerald-100 border-emerald-400 text-[#065F46] shadow-sm'
                  : isDark
                  ? 'bg-[#0A221B] border-emerald-900/60 text-slate-300 hover:border-emerald-700 hover:text-white'
                  : 'bg-white border-[#D1E7DD] text-slate-600 hover:border-emerald-300 hover:text-[#065F46]'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-emerald-500' : isDark ? 'text-emerald-400/60' : 'text-slate-400'
                  }`}
                />
                <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                  {item.label}
                </span>
              </div>
              <p className={`text-[11px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {item.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left Controls / Right AI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 5 Cols */}
        <div
          className={`lg:col-span-5 rounded-2xl border p-6 space-y-5 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
            }`}
          >
            <h3 className={`font-bold text-sm flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              <Bot className="w-4 h-4 text-emerald-500" />
              <span>Input Parameters</span>
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono font-bold">
              Step 1 of 2
            </span>
          </div>

          {/* Subject & Topic Selectors */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Target Subject:</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  const matchedSub = subjects.find((s) => s.name === e.target.value);
                  if (matchedSub && matchedSub.topics[0]) {
                    setSelectedTopic(matchedSub.topics[0].title);
                  }
                }}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#071C16] border-emerald-900 text-white'
                    : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                }`}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Specific Syllabus Topic:</label>
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="e.g. Virtual Memory & Page Replacement"
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#071C16] border-emerald-900 text-white'
                    : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                }`}
              />
            </div>
          </div>

          {/* Mode-Specific Inputs */}
          {mode === 'explain' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Concept or Mechanism to Explain:</label>
                <input
                  type="text"
                  value={conceptInput}
                  onChange={(e) => setConceptInput(e.target.value)}
                  placeholder="e.g. Belady Anomaly in FIFO Page Replacement"
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                    isDark
                      ? 'bg-[#071C16] border-emerald-900 text-white'
                      : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Explanation Depth:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'simple', label: 'Simple (ELI5)' },
                    { id: 'exam', label: 'Exam Focus' },
                    { id: 'deep', label: 'Deep Technical' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDepth(d.id as any)}
                      className={`py-2 px-1 text-center rounded-lg border text-[11px] font-semibold transition ${
                        depth === d.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : isDark
                          ? 'bg-[#071C16] border-emerald-900 text-slate-400 hover:text-white'
                          : 'bg-[#ECFDF5] border-[#D1E7DD] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Optional: Paste Course Notes or Problem Statement:
                </label>
                <textarea
                  rows={3}
                  value={studentMaterialInput}
                  onChange={(e) => setStudentMaterialInput(e.target.value)}
                  placeholder="Paste teacher's slide excerpt or textbook formula..."
                  className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 resize-none ${
                    isDark
                      ? 'bg-[#071C16] border-emerald-900 text-white'
                      : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                />
              </div>
            </div>
          )}

          {mode === 'summarize' && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Paste Student Study Material / Lecture Slides:
              </label>
              <textarea
                rows={6}
                value={studentMaterialInput}
                onChange={(e) => setStudentMaterialInput(e.target.value)}
                placeholder="Paste paragraph, slide notes, or textbook chapter excerpt here..."
                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#071C16] border-emerald-900 text-white'
                    : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                }`}
              />
              <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                CognifyX synthesizes key testable bullet points and formula invariants.
              </p>
            </div>
          )}

          {mode === 'strategy' && (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Your Specific Exam Question or Bottleneck:
              </label>
              <textarea
                rows={4}
                value={studentQuestionInput}
                onChange={(e) => setStudentQuestionInput(e.target.value)}
                placeholder="e.g. I keep forgetting Dijkstra's relaxation proof during timed conditions. How should I practice it?"
                className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 ${
                  isDark
                    ? 'bg-[#071C16] border-emerald-900 text-white'
                    : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                }`}
              />
            </div>
          )}

          {/* Action Button in Emerald */}
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Synthesizing Academic Guidance...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize with AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output: 7 Cols */}
        <div
          className={`lg:col-span-7 rounded-2xl border p-6 space-y-4 shadow-sm min-h-[500px] flex flex-col justify-between ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div>
            {/* Attribution Bar: Distinct visual badge separating Student input vs AI generation */}
            <div
              className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>AI Generated Synthesis</span>
                </span>
                {isFallbackMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                    Offline Academic Bank
                  </span>
                )}
              </div>

              {resultText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      isDark
                        ? 'bg-[#071C16] border-emerald-900 text-slate-300 hover:text-white'
                        : 'bg-emerald-50 border-[#D1E7DD] text-slate-700 hover:text-emerald-900'
                    }`}
                    title="Copy Text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleSaveAsFlashcard}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-600 dark:text-teal-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Layers className="w-3.5 h-3.5 text-teal-500" />
                    <span>Save to Flashcards</span>
                  </button>
                </div>
              )}
            </div>

            {/* Content Display */}
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <Bot className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Synthesizing Pedagogical Analysis...
                  </h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Formulating concise analogies, marking schemes, and exam hints.
                  </p>
                </div>
              </div>
            ) : resultText ? (
              <div
                className={`mt-4 prose prose-sm max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-line font-sans ${
                  isDark ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                {resultText}
              </div>
            ) : (
              <div className="py-24 text-center space-y-3">
                <div
                  className={`w-12 h-12 rounded-2xl border flex items-center justify-center mx-auto ${
                    isDark ? 'bg-[#071C16] border-emerald-900 text-emerald-400' : 'bg-emerald-50 border-[#D1E7DD] text-emerald-600'
                  }`}
                >
                  <Lightbulb className="w-6 h-6" />
                </div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                  Ready for Analysis
                </h4>
                <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Select a topic on the left or paste your course notes, then click "Synthesize with
                  AI" to generate student-tailored explanations and revision materials.
                </p>
              </div>
            )}
          </div>

          {/* Student source vs AI distinction disclaimer */}
          <div
            className={`pt-3 border-t text-[11px] flex items-center justify-between ${
              isDark ? 'border-emerald-900/60 text-slate-400' : 'border-[#D1E7DD] text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Attribution Notice: Recommendations are generated based on syllabus benchmarks.</span>
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">CognifyX v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
