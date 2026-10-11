import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Layers,
  HelpCircle,
  Brain,
  TrendingUp,
  Target,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  FileCheck2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const LandingPage: React.FC = () => {
  const { setActiveTab, subjects, todayTasks, theme } = useStudy();

  const isDark = theme === 'dark';

  const features = [
    {
      icon: Calendar,
      title: 'Adaptive Exam Timetable',
      desc: 'Converts bulky syllabi into calibrated daily time blocks, automatically giving higher priority to upcoming dates and difficult topics.',
      tag: 'Smart Scheduling',
      tab: 'planner',
    },
    {
      icon: HelpCircle,
      title: '2 / 5 / 10-Mark Question Generator',
      desc: 'Generate university-grade questions with strict grading schemes and model answers. Clearly marks student inputs versus generated criteria.',
      tag: 'Practice Bank',
      tab: 'questions',
    },
    {
      icon: Layers,
      title: 'Active Recall & 3D Flashcards',
      desc: 'Spaced repetition decks with 3D flip mechanics, difficulty filters, and instant mastery tracking for high-yield formulas and concepts.',
      tag: 'Retention Engine',
      tab: 'flashcards',
    },
    {
      icon: Brain,
      title: 'AI Academic Mentor',
      desc: 'Feynman-technique concept breakdowns, lecture note summarization, and one-page exam revision cheat-sheets powered by Gemini.',
      tag: 'Cognitive Boost',
      tab: 'assistant',
    },
    {
      icon: BookOpen,
      title: 'Syllabus & Topic Tracker',
      desc: 'Organize modules, units, and chapters. Assign difficulty and priority tags with real-time completion analytics.',
      tag: 'Syllabus Map',
      tab: 'syllabus',
    },
    {
      icon: TrendingUp,
      title: 'Readiness Diagnostics',
      desc: 'Data-driven metrics measuring syllabus coverage, study streaks, weak areas, and estimated final exam readiness index.',
      tag: 'Analytics',
      tab: 'analytics',
    },
    {
      icon: FileCheck2,
      title: 'Document Validation Engine',
      desc: 'Evidence-based intake for syllabus PDFs, past-year exam papers, and assignments. Detects truncated files and outdated regulations with zero false alarms.',
      tag: 'Challenge Card 1',
      tab: 'validator',
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 overflow-hidden ${
        isDark ? 'bg-[#071C16] text-slate-100' : 'bg-[#ECFDF5] text-[#1F2937]'
      }`}
    >
      {/* Background ambient emerald & mint glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px] bg-gradient-to-b from-emerald-500/15 via-teal-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-[600px] right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 shadow-sm border ${
              isDark
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-white border-[#D1E7DD] text-[#065F46] shadow-emerald-500/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>AI-Powered Adaptive Learning Platform for College Students</span>
          </div>

          {/* Heading */}
          <h1
            className={`text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Your Syllabus.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-green-400">
              Your Strategy.
            </span>{' '}
            <br />
            Your Success.
          </h1>

          {/* Tagline & Subtext */}
          <p
            className={`text-xl sm:text-2xl font-bold mb-4 tracking-wide font-mono ${
              isDark ? 'text-emerald-300' : 'text-emerald-700'
            }`}
          >
            “Study smarter. Prepare with purpose.”
          </p>
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            CognifyX transforms dense college course syllabi into an intelligent, prioritized daily
            study strategy. Practice university-format questions, conquer weak spots with active recall,
            and monitor your exam readiness—all in an elegant emerald workspace.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setActiveTab('planner')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-base shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 group hover:scale-[1.02]"
            >
              <span>Build My Study Plan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl border font-semibold text-base transition-all flex items-center justify-center gap-2 ${
                isDark
                  ? 'bg-[#0B2720] hover:bg-[#0E3229] border-emerald-800/60 text-slate-200 hover:border-emerald-600'
                  : 'bg-white hover:bg-emerald-50 border-[#D1E7DD] text-[#065F46] hover:border-emerald-400 shadow-sm'
              }`}
            >
              <span>Explore Dashboard</span>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </button>
          </div>

          {/* Stats Bar */}
          <div
            className={`mt-14 pt-8 border-t grid grid-cols-2 md:grid-cols-4 gap-6 text-center ${
              isDark ? 'border-emerald-950/80' : 'border-[#D1E7DD]'
            }`}
          >
            <div>
              <div className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                40+ Hrs
              </div>
              <div className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Saved per Exam Season
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-500">94%</div>
              <div className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Student Exam Confidence
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-teal-400">2 / 5 / 10M</div>
              <div className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Mark Scheme Alignment
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-green-500">100%</div>
              <div className={`text-xs font-medium mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Distraction-Free Focus
              </div>
            </div>
          </div>
        </div>

        {/* Sample Dashboard Preview Card */}
        <div
          className={`mt-16 relative rounded-2xl p-1 bg-gradient-to-b shadow-2xl ${
            isDark
              ? 'from-emerald-500/30 via-emerald-950/40 to-[#071C16]'
              : 'from-emerald-300/40 via-emerald-100 to-white'
          }`}
        >
          <div
            className={`rounded-xl p-4 sm:p-6 border overflow-hidden ${
              isDark
                ? 'bg-[#0A221B] border-emerald-900/60 text-slate-100'
                : 'bg-white border-[#D1E7DD] text-[#1F2937]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-4 border-b mb-6 ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="w-3 h-3 rounded-full bg-teal-400" />
                <div className="w-3 h-3 rounded-full bg-green-300" />
                <span className={`text-xs font-mono ml-2 ${isDark ? 'text-emerald-400/80' : 'text-emerald-800'}`}>
                  cognifyx.app/student/emerald-dashboard
                </span>
              </div>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Launch Live View <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Dashboard Sample Mini-Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Today's Schedule */}
              <div
                className={`rounded-xl border p-4 ${
                  isDark ? 'bg-[#071C16] border-emerald-900/60' : 'bg-[#ECFDF5] border-[#D1E7DD]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                      Today's Focus Plan
                    </h4>
                  </div>
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">
                    {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} Done
                  </span>
                </div>
                <div className="space-y-2.5">
                  {todayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        task.completed
                          ? 'opacity-60 bg-emerald-950/20 border-emerald-900/30'
                          : isDark
                          ? 'bg-[#0B2720] border-emerald-900/60 text-slate-200'
                          : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            task.completed ? 'text-emerald-500' : 'text-slate-400'
                          }`}
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                      <span className="text-[10px] font-mono shrink-0 ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {task.timeSlot.split(' - ')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Upcoming Exams */}
              <div
                className={`rounded-xl border p-4 ${
                  isDark ? 'bg-[#071C16] border-emerald-900/60' : 'bg-[#ECFDF5] border-[#D1E7DD]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-teal-400" />
                    <h4 className={`text-xs font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                      Exam Countdown
                    </h4>
                  </div>
                  <span className="text-[10px] text-teal-500 font-semibold">Priority Radar</span>
                </div>
                <div className="space-y-2.5">
                  {subjects.slice(0, 3).map((sub) => {
                    const examDate = new Date(sub.examDate);
                    const now = new Date('2026-10-10');
                    const diffDays = Math.max(
                      0,
                      Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                    );
                    return (
                      <div
                        key={sub.id}
                        className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                          isDark
                            ? 'bg-[#0B2720] border-emerald-900/60 text-slate-200'
                            : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{sub.name}</div>
                          <div className="text-[10px] text-slate-400">{sub.code} • Target {sub.targetGrade}</div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {diffDays}d left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: AI Quick Concept Breakdown */}
              <div
                className={`rounded-xl border p-4 flex flex-col justify-between ${
                  isDark
                    ? 'bg-gradient-to-br from-[#065F46]/30 via-[#0A221B] to-[#071C16] border-emerald-500/30'
                    : 'bg-gradient-to-br from-emerald-100 via-white to-emerald-50 border-emerald-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Instant AI Tutor
                    </span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <h4 className={`font-bold text-sm mb-2 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Feynman Concept Explainer
                  </h4>
                  <p className={`text-xs leading-relaxed mb-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Stuck on Page Replacement or Dijkstra's invariant? Get simple analogies, formulas, and
                    marking-rubric cheat sheets in seconds.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('assistant')}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  Ask AI Concept Explainer
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section
        className={`py-20 border-t ${
          isDark ? 'bg-[#051510] border-emerald-950/80' : 'bg-white border-[#D1E7DD]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-bold tracking-widest text-emerald-500 mb-2">
              End-to-End Exam Mastery
            </h2>
            <h3
              className={`text-3xl sm:text-4xl font-extrabold mb-4 ${
                isDark ? 'text-white' : 'text-[#065F46]'
              }`}
            >
              Everything College Students Need in One Platform
            </h3>
            <p className={`text-sm sm:text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              No more messy spreadsheets or disorganized notes. CognifyX connects every syllabus topic
              to daily actions, practice questions, and memory retention cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  onClick={() => setActiveTab(f.tab)}
                  className={`cursor-pointer rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 group ${
                    isDark
                      ? 'bg-[#0A221B]/80 border-emerald-900/60 hover:border-emerald-500/50 hover:bg-[#0C2920]'
                      : 'bg-[#ECFDF5]/80 border-[#D1E7DD] hover:border-emerald-500 hover:bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {f.tag}
                    </span>
                  </div>
                  <h4
                    className={`text-lg font-bold mb-2 group-hover:text-emerald-500 transition-colors ${
                      isDark ? 'text-white' : 'text-[#065F46]'
                    }`}
                  >
                    {f.title}
                  </h4>
                  <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {f.desc}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Open Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Methodology Section in Green Palette */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`rounded-3xl border p-8 sm:p-12 relative overflow-hidden shadow-xl ${
            isDark
              ? 'bg-gradient-to-r from-[#065F46]/40 via-[#0A221B] to-[#071C16] border-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-100 via-white to-emerald-50 border-[#D1E7DD]'
          }`}
        >
          <div className="max-w-2xl">
            <span className="px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">
              The CognifyX Protocol
            </span>
            <h3
              className={`text-3xl font-extrabold mt-4 mb-4 ${
                isDark ? 'text-white' : 'text-[#065F46]'
              }`}
            >
              Built on Evidence-Based Cognitive Science
            </h3>
            <p className={`text-sm leading-relaxed mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Cramming fails because memory decays exponentially without reinforcement. CognifyX
              automates three core psychological principles proven to guarantee long-term retention:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-500 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Spaced Repetition
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Flashcards and revision tasks resurface right when you are about to forget them.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-teal-500/20 text-teal-500 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Active Recall Testing
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Testing yourself with 2, 5, and 10-mark questions strengthens neural pathways far faster than re-reading notes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1 rounded bg-emerald-500/20 text-emerald-500 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Interleaved Study Sessions
                  </h5>
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Alternating between subjects prevents mental fatigue and sharpens conceptual discrimination.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => setActiveTab('planner')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30"
              >
                Create My Personalized Schedule
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Green Footer */}
      <footer
        className={`border-t py-12 text-xs ${
          isDark
            ? 'border-emerald-950 bg-[#04110D] text-emerald-300/70'
            : 'border-[#D1E7DD] bg-white text-slate-600'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className={`font-extrabold text-base ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                Cognify<span className="text-emerald-500">X</span>
              </span>
            </div>
            <p className="leading-relaxed mb-4">
              “Study smarter. Prepare with purpose.” An AI-Powered Adaptive Learning Platform engineered for college students preparing for high-stakes exams.
            </p>
            <div className="text-[11px] opacity-75">
              © {new Date().getFullYear()} CognifyX Technologies. Emerald Green Edition.
            </div>
          </div>

          <div>
            <h5 className={`font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Platform Tools
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('planner')} className="hover:text-emerald-500 transition">
                  Personalized Study Planner
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('questions')} className="hover:text-emerald-500 transition">
                  Question Practice Generator
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('assistant')} className="hover:text-emerald-500 transition">
                  AI Concept Explainer
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('flashcards')} className="hover:text-emerald-500 transition">
                  Active Recall 3D Flashcards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className={`font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Syllabus & Goals
            </h5>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('syllabus')} className="hover:text-emerald-500 transition">
                  Subject-Wise Topic Tracker
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('analytics')} className="hover:text-emerald-500 transition">
                  Readiness Index Diagnostics
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('dashboard')} className="hover:text-emerald-500 transition">
                  Student Schedule Dashboard
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h5 className={`font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Integrity & Quality
            </h5>
            <p className="text-xs leading-relaxed mb-3">
              Practice questions are generated based on syllabus objectives and student-supplied material, with transparent marking schemes.
            </p>
            <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-md text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero Hallucination Attribution</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
