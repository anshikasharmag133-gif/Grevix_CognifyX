import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Target,
  Plus,
  Trash2,
  CalendarDays,
  Flame,
  Check,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { DayPlan } from '../types';
import confetti from 'canvas-confetti';

export const PlannerView: React.FC = () => {
  const {
    subjects,
    planDays,
    setPlanDays,
    togglePlanSessionComplete,
    setIsFocusTimerOpen,
    setCurrentFocusTopic,
    theme,
  } = useStudy();

  const isDark = theme === 'dark';

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Planner Config Form States
  const [dailyHours, setDailyHours] = useState<number>(4);
  const [preparationLevel, setPreparationLevel] = useState<'beginner' | 'intermediate' | 'revision'>('intermediate');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(subjects.map((s) => s.name));
  const [selectedWeakTopics, setSelectedWeakTopics] = useState<string[]>([
    'Dynamic Programming & Memoization',
    'Virtual Memory & Page Replacement',
    'Relational Normalization (BCNF)',
    'TCP Congestion Control',
  ]);
  const [customWeakTopicInput, setCustomWeakTopicInput] = useState('');
  const [strategyNote, setStrategyNote] = useState<string | null>(null);

  const allTopicTitles = subjects.flatMap((s) => s.topics.map((t) => t.title));

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setStrategyNote(null);

    const examDatesObj: Record<string, string> = {};
    subjects.forEach((s) => {
      examDatesObj[s.name] = s.examDate;
    });

    try {
      const response = await fetch('/api/ai/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: selectedSubjects,
          dailyHours,
          preparationLevel,
          weakTopics: selectedWeakTopics,
          examDates: examDatesObj,
        }),
      });

      const data = await response.json();
      if (data.plan && Array.isArray(data.plan)) {
        setPlanDays(data.plan);
        if (data.strategySummary) {
          setStrategyNote(data.strategySummary);
        }
        setShowConfigModal(false);
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error('Plan generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDay = planDays[activeDayIndex] || planDays[0];

  const handleToggleSession = (dayIdx: number, sessId: string, currentStatus?: boolean) => {
    togglePlanSessionComplete(dayIdx, sessId);
    if (!currentStatus) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    }
  };

  const toggleWeakTopic = (topic: string) => {
    if (selectedWeakTopics.includes(topic)) {
      setSelectedWeakTopics(selectedWeakTopics.filter((t) => t !== topic));
    } else {
      setSelectedWeakTopics([...selectedWeakTopics, topic]);
    }
  };

  const addCustomWeakTopic = () => {
    if (customWeakTopicInput.trim() && !selectedWeakTopics.includes(customWeakTopicInput.trim())) {
      setSelectedWeakTopics([...selectedWeakTopics, customWeakTopicInput.trim()]);
      setCustomWeakTopicInput('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header with Title and Generator CTA */}
      <div
        className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>AI Adaptive Engine</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Personalized Daily Study Timetable
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Prioritizes nearest exam dates, weak topics, and active recall slots with spaced
            interleaving. Calibrated for college students.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConfigModal(true)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Re-Generate Timetable</span>
          </button>
        </div>
      </div>

      {strategyNote && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            isDark
              ? 'bg-[#065F46]/30 border-emerald-500/40 text-emerald-200'
              : 'bg-emerald-50 border-[#D1E7DD] text-emerald-900'
          }`}
        >
          <span>{strategyNote}</span>
          <span className="text-[10px] text-emerald-500 font-mono font-bold">Calibrated</span>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {planDays.map((day, idx) => {
          const completedCount = day.sessions.filter((s) => s.completed).length;
          const isSelected = activeDayIndex === idx;

          return (
            <button
              key={idx}
              onClick={() => setActiveDayIndex(idx)}
              className={`px-4 py-3 rounded-xl border text-left shrink-0 transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/25'
                  : isDark
                  ? 'bg-[#0A221B] text-slate-300 border-emerald-900/60 hover:border-emerald-700 hover:bg-[#0E3229]'
                  : 'bg-white text-slate-700 border-[#D1E7DD] hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold">{day.day}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    isSelected
                      ? 'bg-emerald-700 text-white'
                      : isDark
                      ? 'bg-emerald-950 text-emerald-400'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {completedCount}/{day.sessions.length}
                </span>
              </div>
              <div className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {day.dateLabel}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day View */}
      {currentDay && (
        <div
          className={`rounded-2xl border p-6 space-y-6 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          {/* Day Header Banner */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                  {currentDay.day}
                </h3>
                <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  • {currentDay.dateLabel}
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Focus Theme: {currentDay.focusTheme}
              </p>
            </div>

            <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{currentDay.totalHours} hrs scheduled</span>
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {currentDay.sessions.filter((s) => s.completed).length} of {currentDay.sessions.length}{' '}
                Done
              </span>
            </div>
          </div>

          {/* Time Slot Sessions */}
          <div className="space-y-4">
            {currentDay.sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-xl border transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  session.completed
                    ? 'opacity-60 bg-emerald-950/20 border-emerald-900/40'
                    : isDark
                    ? 'bg-[#071C16] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5]/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() =>
                      handleToggleSession(activeDayIndex, session.id, session.completed)
                    }
                    className="mt-1 text-slate-400 hover:text-emerald-500 transition"
                  >
                    {session.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 hover:border-emerald-500" />
                    )}
                  </button>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                        {session.timeSlot}
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          session.completed
                            ? 'line-through text-slate-400'
                            : isDark ? 'text-slate-100' : 'text-[#1F2937]'
                        }`}
                      >
                        {session.subject}: {session.topic}
                      </span>
                      {session.isWeakTopic && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30">
                          Weak Area Priority
                        </span>
                      )}
                    </div>

                    <p className={`text-xs mt-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Objective: <span className="font-normal opacity-90">{session.objective}</span>
                    </p>

                    <div className={`mt-2 flex items-center gap-3 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{session.type}</span>
                      <span>•</span>
                      <span>{session.durationMinutes} Minutes</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => {
                      setCurrentFocusTopic(`${session.subject} - ${session.topic}`);
                      setIsFocusTimerOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Focus Timer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Configuration Modal in Emerald Green */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border p-6 sm:p-8 shadow-2xl ${
              isDark ? 'bg-[#0A221B] border-emerald-500/40 text-slate-100' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-4 border-b mb-6 ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <div>
                <h3
                  className={`text-xl font-bold flex items-center gap-2 ${
                    isDark ? 'text-white' : 'text-[#065F46]'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Personalized Study Plan Setup
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Configure your availability, subjects, and weak spots for optimal schedule synthesis.
                </p>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-emerald-500 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Daily Available Study Hours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold">Daily Available Study Hours:</label>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono text-sm">
                    {dailyHours} Hours/Day
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="0.5"
                  value={dailyHours}
                  onChange={(e) => setDailyHours(Number(e.target.value))}
                  className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-emerald-950 rounded-lg cursor-pointer"
                />
                <div className={`flex justify-between text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  <span>2 hrs (Light revision)</span>
                  <span>4-6 hrs (Recommended standard)</span>
                  <span>10 hrs (Exam bootcamp)</span>
                </div>
              </div>

              {/* Current Preparation Level */}
              <div>
                <label className="block font-bold mb-2">
                  Current Preparation Level:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'beginner', label: 'Beginner', desc: 'Starting concepts from ground up' },
                    { id: 'intermediate', label: 'Intermediate', desc: 'Covered basics, need question practice' },
                    { id: 'revision', label: 'Revision Phase', desc: 'Mock tests & high-yield polish' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setPreparationLevel(lvl.id as any)}
                      className={`p-3 rounded-xl border text-left transition ${
                        preparationLevel === lvl.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-white font-bold'
                          : isDark
                          ? 'bg-[#071C16] border-emerald-900 text-slate-400 hover:border-emerald-700'
                          : 'bg-[#ECFDF5] border-[#D1E7DD] text-slate-600 hover:border-emerald-400'
                      }`}
                    >
                      <div className="font-bold capitalize">{lvl.label}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Included Subjects */}
              <div>
                <label className="block font-bold mb-2">
                  Subjects to Include in Timetable:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {subjects.map((sub) => {
                    const isChecked = selectedSubjects.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedSubjects(selectedSubjects.filter((n) => n !== sub.name));
                          } else {
                            setSelectedSubjects([...selectedSubjects, sub.name]);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left flex items-center justify-between transition ${
                          isChecked
                            ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold'
                            : isDark
                            ? 'bg-[#071C16] border-emerald-900 text-slate-500'
                            : 'bg-white border-[#D1E7DD] text-slate-500'
                        }`}
                      >
                        <span className="font-semibold truncate">{sub.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weak / Difficult Topics */}
              <div>
                <label className="block font-bold mb-1">
                  Difficult or Weak Topics (Prioritized in morning focus slots):
                </label>
                <p className={`text-[11px] mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Click to toggle high-yield syllabus topics that need extra attention.
                </p>

                <div
                  className={`flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border mb-3 ${
                    isDark ? 'bg-[#071C16] border-emerald-900' : 'bg-[#ECFDF5] border-[#D1E7DD]'
                  }`}
                >
                  {allTopicTitles.slice(0, 15).map((topic, i) => {
                    const isSelected = selectedWeakTopics.includes(topic);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleWeakTopic(topic)}
                        className={`px-2.5 py-1 rounded-md text-[11px] transition ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/40 font-bold'
                            : isDark
                            ? 'bg-emerald-950/60 text-slate-400 hover:text-slate-200'
                            : 'bg-white text-slate-600 hover:text-[#1F2937]'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {topic}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Or type custom difficult topic..."
                    value={customWeakTopicInput}
                    onChange={(e) => setCustomWeakTopicInput(e.target.value)}
                    className={`flex-1 border rounded-lg px-3 py-1.5 text-xs ${
                      isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={addCustomWeakTopic}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div
                className={`flex justify-end gap-3 pt-4 border-t ${
                  isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGeneratePlan}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>Synthesizing Plan...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate 7-Day Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
