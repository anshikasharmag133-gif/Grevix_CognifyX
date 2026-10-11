import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  Flame,
  Clock,
  BookOpen,
  Award,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const AnalyticsView: React.FC = () => {
  const {
    profile,
    subjects,
    todayTasks,
    flashcards,
    questions,
    totalStudyMinutesToday,
    setActiveTab,
    theme,
  } = useStudy();

  const isDark = theme === 'dark';

  // 1. Calculate Real Topic Mastery
  const allTopics = subjects.flatMap((s) => s.topics);
  const totalTopics = allTopics.length;
  const completedTopics = allTopics.filter((t) => t.status === 'completed').length;
  const inProgressTopics = allTopics.filter((t) => t.status === 'in-progress').length;
  const notStartedTopics = allTopics.filter((t) => t.status === 'not-started').length;
  const syllabusCoveragePercent =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // 2. Flashcard Retention
  const masteredCards = flashcards.filter((c) => c.mastery === 'mastered').length;
  const flashcardRetentionRate =
    flashcards.length > 0 ? Math.round((masteredCards / flashcards.length) * 100) : 0;

  // 3. Question Evaluation Performance
  const gradedQuestions = questions.filter((q) => q.studentSelfEvaluation);
  const correctQuestions = questions.filter((q) => q.studentSelfEvaluation === 'correct').length;
  const practiceAccuracy =
    gradedQuestions.length > 0
      ? Math.round((correctQuestions / gradedQuestions.length) * 100)
      : 84;

  // 4. Composite Exam Readiness Index
  const examReadinessIndex = Math.min(
    100,
    Math.round(
      syllabusCoveragePercent * 0.5 + flashcardRetentionRate * 0.25 + practiceAccuracy * 0.25
    )
  );

  // 5. Weak Topics Diagnostic List
  const weakTopics = allTopics.filter(
    (t) => (t.difficulty === 'difficult' || t.priority === 'high') && t.status !== 'completed'
  );

  // 6. Weekly Study Hours Simulation based on real today's minutes
  const todayHours = Number((totalStudyMinutesToday / 60).toFixed(1));
  const weeklyDays = [
    { day: 'Mon', hours: 4.2 },
    { day: 'Tue', hours: 3.5 },
    { day: 'Wed', hours: 5.0 },
    { day: 'Thu', hours: 4.5 },
    { day: 'Fri', hours: 3.8 },
    { day: 'Sat', hours: 5.5 },
    { day: 'Sun (Today)', hours: todayHours },
  ];
  const maxWeeklyHours = Math.max(...weeklyDays.map((d) => d.hours), 6);
  const totalWeeklyHours = weeklyDays.reduce((acc, d) => acc + d.hours, 0).toFixed(1);

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
            <BarChart3 className="w-4 h-4" />
            <span>Real-Time Performance Diagnostics</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Progress & Exam Readiness Analytics
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Live telemetry tracking study hours, syllabus mastery, active recall retention, and
            targeted weak area remediations in our emerald green suite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Active Student Record: {profile.name}</span>
          </div>
        </div>
      </div>

      {/* Top 4 Diagnostic Metric Cards in Green Styling */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Composite Exam Readiness Index */}
        <div
          className={`rounded-2xl border p-5 shadow-sm relative overflow-hidden ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Exam Readiness
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {examReadinessIndex}%
            </span>
            <span
              className={`text-xs font-bold ${
                examReadinessIndex >= 75 ? 'text-emerald-500' : 'text-amber-500'
              }`}
            >
              {examReadinessIndex >= 80 ? 'On Track for A+' : 'Solid Progress'}
            </span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Weighted across syllabus, recall & mock tests
          </p>
        </div>

        {/* Card 2: Total Weekly Study Time */}
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Weekly Study Hours
            </span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-500 border border-teal-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {totalWeeklyHours}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">/ {profile.weeklyGoalHours}h Goal</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {Math.round((Number(totalWeeklyHours) / profile.weeklyGoalHours) * 100)}% of weekly goal achieved
          </p>
        </div>

        {/* Card 3: Active Recall Retention */}
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Recall Retention
            </span>
            <div className="p-2 rounded-xl bg-green-500/15 text-green-500 border border-green-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {flashcardRetentionRate}%
            </span>
            <span className="text-xs text-green-600 dark:text-green-400 font-bold">{masteredCards}/{flashcards.length} Cards</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Spaced repetition mastery accuracy
          </p>
        </div>

        {/* Card 4: Study Streak */}
        <div
          className={`rounded-2xl border p-5 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Study Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 border border-amber-500/30">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {profile.studyStreak}
            </span>
            <span className="text-xs text-amber-500 font-bold">Days Unbroken</span>
          </div>
          <p className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Consistent preparation compound effect
          </p>
        </div>
      </div>

      {/* Main Charts Grid in Emerald Green Palette */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Study Time SVG Bar Chart */}
        <div
          className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                Weekly Focus Time (Hours)
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {totalWeeklyHours} Hours Total
            </span>
          </div>

          {/* SVG Bar Chart with Emerald Gradients */}
          <div className="pt-4">
            <div className="h-56 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {weeklyDays.map((d, i) => {
                const heightPercent = Math.round((d.hours / maxWeeklyHours) * 100);
                const isToday = i === weeklyDays.length - 1;

                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-300">
                      {d.hours}h
                    </span>
                    <div
                      className={`w-full max-w-[36px] rounded-t-lg h-full max-h-[160px] flex items-end p-0.5 overflow-hidden ${
                        isDark ? 'bg-[#071C16]' : 'bg-[#ECFDF5]'
                      }`}
                    >
                      <div
                        className={`w-full rounded-t-md transition-all duration-700 ${
                          isToday
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-lg shadow-emerald-500/25'
                            : isDark
                            ? 'bg-gradient-to-t from-emerald-900 to-teal-600/70 group-hover:from-emerald-700 group-hover:to-teal-500'
                            : 'bg-gradient-to-t from-emerald-400 to-teal-500 group-hover:from-emerald-500 group-hover:to-teal-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-medium text-center truncate ${
                        isToday ? 'text-emerald-600 dark:text-emerald-400 font-bold' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      {d.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Subject-Wise Syllabus Coverage */}
        <div
          className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div
            className={`flex items-center justify-between pb-3 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
            }`}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-500" />
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                Subject-Wise Coverage Breakdown
              </h3>
            </div>
            <span className="text-xs font-mono opacity-70">{subjects.length} Courses</span>
          </div>

          <div className="space-y-4 pt-2">
            {subjects.map((sub) => {
              const total = sub.topics.length;
              const comp = sub.topics.filter((t) => t.status === 'completed').length;
              const inProg = sub.topics.filter((t) => t.status === 'in-progress').length;
              const pct = total > 0 ? Math.round((comp / total) * 100) : 0;

              return (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                        {sub.name}
                      </span>
                      <span className="opacity-60 font-mono ml-1">({sub.code})</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{pct}% Ready</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-emerald-950 rounded-full h-2 overflow-hidden flex border border-emerald-900/40">
                    <div
                      className="bg-emerald-500 h-2 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                      title={`${comp} Completed`}
                    />
                    <div
                      className="bg-teal-400/80 h-2 transition-all duration-500"
                      style={{ width: `${total > 0 ? (inProg / total) * 100 : 0}%` }}
                      title={`${inProg} In Progress`}
                    />
                  </div>

                  <div className={`flex justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span>{comp} completed • {inProg} in progress</span>
                    <span>Exam in {sub.examDate}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weak Areas Action List in Emerald Palette */}
      <div
        className={`rounded-2xl border p-6 space-y-4 shadow-sm ${
          isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Targeted Weak Area Remediation ({weakTopics.length} Flagged)
            </h3>
          </div>
          <span className="text-xs text-amber-500 font-semibold">Priority Diagnostic</span>
        </div>

        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          These topics have been flagged as difficult or high priority and are not yet fully mastered.
          Click directly to start active recall or practice questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {weakTopics.slice(0, 6).map((topic) => {
            const subject = subjects.find((s) => s.id === topic.subjectId);

            return (
              <div
                key={topic.id}
                className={`p-4 rounded-xl border flex items-center justify-between gap-3 transition ${
                  isDark
                    ? 'bg-[#071C16] border-emerald-900/60 hover:border-emerald-600'
                    : 'bg-[#ECFDF5] border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      {topic.title}
                    </span>
                  </div>
                  <div className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {subject?.name} •{' '}
                    <span className="text-amber-500 font-semibold">{topic.priority.toUpperCase()} PRIORITY</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setActiveTab('questions')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>Practice</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setActiveTab('assistant')}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-300 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <span>AI Notes</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
