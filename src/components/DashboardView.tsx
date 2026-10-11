import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  Sparkles,
  BookOpen,
  HelpCircle,
  Layers,
  GraduationCap,
  AlertTriangle,
  Play,
  RotateCcw,
  Target,
  BarChart2,
  Trash2,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import confetti from 'canvas-confetti';

export const DashboardView: React.FC = () => {
  const {
    profile,
    subjects,
    todayTasks,
    documents,
    toggleTaskComplete,
    addTask,
    deleteTask,
    setActiveTab,
    setIsFocusTimerOpen,
    setCurrentFocusTopic,
    totalStudyMinutesToday,
    theme,
  } = useStudy();

  const isDark = theme === 'dark';

  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubjectId, setNewTaskSubjectId] = useState(subjects[0]?.id || '');
  const [newTaskTimeSlot, setNewTaskTimeSlot] = useState('18:30 - 19:30');
  const [newTaskDuration, setNewTaskDuration] = useState(60);
  const [newTaskType, setNewTaskType] = useState<'study' | 'practice' | 'revision' | 'exam-prep'>('study');

  // Compute metrics
  const totalSubjectsCount = subjects.length;
  const allTopics = subjects.flatMap((s) => s.topics);
  const totalTopicsCount = allTopics.length;
  const completedTopicsCount = allTopics.filter((t) => t.status === 'completed').length;
  const pendingTopicsCount = totalTopicsCount - completedTopicsCount;
  const syllabusProgressPercent =
    totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  // Weak topics
  const weakTopics = allTopics.filter(
    (t) => (t.difficulty === 'difficult' || t.priority === 'high') && t.status !== 'completed'
  );

  const todayHoursFormatted = (totalStudyMinutesToday / 60).toFixed(1);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addTask({
      date: new Date().toISOString().split('T')[0],
      subjectId: newTaskSubjectId,
      title: newTaskTitle.trim(),
      timeSlot: newTaskTimeSlot,
      durationMinutes: Number(newTaskDuration) || 60,
      type: newTaskType,
      completed: false,
    });
    setNewTaskTitle('');
    setIsAddingTask(false);
  };

  const handleToggleTask = (taskId: string, currentlyCompleted: boolean) => {
    toggleTaskComplete(taskId);
    if (!currentlyCompleted) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner with Emerald Gradient */}
      <div
        className={`rounded-2xl border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-[#065F46]/50 via-[#0C2920] to-[#071C16] border-emerald-500/30'
            : 'bg-gradient-to-r from-emerald-100 via-white to-emerald-50 border-[#D1E7DD]'
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Target Term: {profile.semester}</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Welcome back, {profile.name}
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            You're currently in deep preparation for your college exams. Stay consistent and focus on
            high-yield topics today.
          </p>
        </div>

        {/* Quick Study Launch button in Emerald Green */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              setCurrentFocusTopic(todayTasks.find((t) => !t.completed)?.title || null);
              setIsFocusTimerOpen(true);
            }}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition hover:scale-105"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start 25m Focus Session</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-4 py-3 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-[#0B2720] hover:bg-[#0E3229] border-emerald-800 text-slate-200'
                : 'bg-white hover:bg-emerald-50 border-[#D1E7DD] text-[#065F46]'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-emerald-500" />
            <span>Customize Plan</span>
          </button>
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-4 py-3 rounded-xl border font-semibold text-xs flex items-center gap-1.5 transition ${
              isDark
                ? 'bg-[#0B2720] hover:bg-[#0E3229] border-emerald-800 text-emerald-300'
                : 'bg-white hover:bg-emerald-50 border-[#D1E7DD] text-emerald-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            <span>Validate Documents</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Study Streak */}
        <div
          className={`rounded-2xl border p-5 shadow-sm hover:border-emerald-500/40 transition ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Study Streak
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {profile.studyStreak}
            </span>
            <span className="text-xs text-amber-500 font-bold">Days Active</span>
          </div>
          <div className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Consecutive daily revision logged
          </div>
        </div>

        {/* Card 2: Today's Study Time */}
        <div
          className={`rounded-2xl border p-5 shadow-sm hover:border-emerald-500/40 transition ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Today's Study Time
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {todayHoursFormatted}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Hours Logged</span>
          </div>
          <div className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {totalStudyMinutesToday} total focus minutes
          </div>
        </div>

        {/* Card 3: Syllabus Mastery */}
        <div
          className={`rounded-2xl border p-5 shadow-sm hover:border-emerald-500/40 transition ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Syllabus Progress
            </span>
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {syllabusProgressPercent}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {completedTopicsCount}/{totalTopicsCount} Topics
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-emerald-950/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${syllabusProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Card 4: Total Subjects */}
        <div
          className={`rounded-2xl border p-5 shadow-sm hover:border-emerald-500/40 transition ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active Subjects
            </span>
            <div className="p-2 rounded-xl bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              {totalSubjectsCount}
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-bold">Subjects</span>
          </div>
          <div className={`mt-2 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {pendingTopicsCount} topics pending revision
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Upcoming Exams & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Study Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
            }`}
          >
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                    Today's Study Schedule
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                    {todayTasks.filter((t) => t.completed).length} of {todayTasks.length} Completed
                  </span>
                </div>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Check off tasks as you finish each deep work or recall slot.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Inline Add Task Form */}
            {isAddingTask && (
              <form
                onSubmit={handleCreateTask}
                className={`mb-6 p-4 rounded-xl border space-y-3 ${
                  isDark ? 'bg-[#071C16] border-emerald-500/40' : 'bg-[#ECFDF5] border-[#D1E7DD]'
                }`}
              >
                <div className="font-semibold text-xs text-emerald-600 dark:text-emerald-300">
                  Add New Study Slot:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Task Objective (e.g. Master B+ Tree Splitting)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark ? 'bg-[#0A221B] border-emerald-800 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                    required
                  />
                  <select
                    value={newTaskSubjectId}
                    onChange={(e) => setNewTaskSubjectId(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                      isDark ? 'bg-[#0A221B] border-emerald-800 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Time (e.g. 14:00 - 15:30)"
                    value={newTaskTimeSlot}
                    onChange={(e) => setNewTaskTimeSlot(e.target.value)}
                    className={`border rounded-lg px-3 py-2 text-xs ${
                      isDark ? 'bg-[#0A221B] border-emerald-800 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Minutes"
                    value={newTaskDuration}
                    onChange={(e) => setNewTaskDuration(Number(e.target.value))}
                    className={`border rounded-lg px-3 py-2 text-xs ${
                      isDark ? 'bg-[#0A221B] border-emerald-800 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  />
                  <select
                    value={newTaskType}
                    onChange={(e: any) => setNewTaskType(e.target.value)}
                    className={`border rounded-lg px-3 py-2 text-xs ${
                      isDark ? 'bg-[#0A221B] border-emerald-800 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  >
                    <option value="study">Deep Study</option>
                    <option value="practice">Practice Questions</option>
                    <option value="revision">Exam Revision</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingTask(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            )}

            {/* Task List */}
            {todayTasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No tasks scheduled for today. Click "Add Task" or generate a timetable from the Study Planner!
              </div>
            ) : (
              <div className="space-y-3">
                {todayTasks.map((task) => {
                  const subject = subjects.find((s) => s.id === task.subjectId);
                  return (
                    <div
                      key={task.id}
                      className={`group p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.completed
                          ? 'opacity-60 bg-emerald-950/20 border-emerald-900/30'
                          : isDark
                          ? 'bg-[#071C16] border-emerald-900/60 hover:border-emerald-500/40'
                          : 'bg-[#ECFDF5]/60 border-[#D1E7DD] hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => handleToggleTask(task.id, task.completed)}
                          className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                          title={task.completed ? 'Mark pending' : 'Mark completed'}
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-emerald-500" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-bold ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : isDark ? 'text-slate-100' : 'text-[#1F2937]'
                              }`}
                            >
                              {task.title}
                            </span>
                            {task.isWeakTopic && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                Weak Topic
                              </span>
                            )}
                          </div>

                          <div className={`flex items-center gap-2 mt-1.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {subject ? `${subject.name} (${subject.code})` : 'General'}
                            </span>
                            <span>•</span>
                            <span className="font-mono">{task.timeSlot}</span>
                            <span>•</span>
                            <span className="capitalize text-teal-600 dark:text-teal-400 font-semibold">{task.type}</span>
                          </div>

                          {task.notes && (
                            <p className="text-[11px] text-slate-400 mt-1 italic">{task.notes}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => {
                            setCurrentFocusTopic(task.title);
                            setIsFocusTimerOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold flex items-center gap-1 transition"
                          title="Open in Focus Pomodoro Timer"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          <span>Focus</span>
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Weak Topics Diagnostic Banner in Green */}
          {weakTopics.length > 0 && (
            <div
              className={`rounded-2xl border p-5 ${
                isDark
                  ? 'bg-gradient-to-r from-[#065F46]/40 via-[#0A221B] to-[#071C16] border-emerald-500/30'
                  : 'bg-emerald-50 border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 mt-0.5">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                      {weakTopics.length} High-Yield Weak Topics Flagged
                    </h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Topics like <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{weakTopics[0]?.title}</span>{' '}
                      need focused review before your upcoming finals.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('questions')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shrink-0 shadow-sm"
                >
                  Drill Practice Questions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming Exams & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
            }`}
          >
            <div
              className={`flex items-center justify-between mb-4 pb-3 border-b ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                  Upcoming Exams
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('syllabus')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                View Syllabus
              </button>
            </div>

            <div className="space-y-3">
              {subjects.map((sub) => {
                const examDate = new Date(sub.examDate);
                const now = new Date('2026-10-10');
                const diffDays = Math.max(
                  0,
                  Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                );
                const isUrgent = diffDays <= 14;

                return (
                  <div
                    key={sub.id}
                    className={`p-3.5 rounded-xl border transition ${
                      isDark
                        ? 'bg-[#071C16] border-emerald-900/60 hover:border-emerald-800'
                        : 'bg-[#ECFDF5]/80 border-[#D1E7DD] hover:border-emerald-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`text-xs font-bold ${isDark ? 'text-slate-100' : 'text-[#1F2937]'}`}>
                          {sub.name}
                        </h4>
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {sub.code} • Target: {sub.targetGrade || 'A'}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isUrgent
                            ? 'bg-red-500/15 text-red-500 border border-red-500/20'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {diffDays} days
                      </span>
                    </div>

                    <div className={`mt-3 flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>Exam: {sub.examDate}</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {sub.topics.filter((t) => t.status === 'completed').length}/{sub.topics.length} Topics Ready
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
            }`}
          >
            <h3 className={`font-bold text-sm mb-4 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Quick Student Actions
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => setActiveTab('planner')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#071C16] hover:bg-[#0B2720] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5] hover:bg-emerald-100/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <CalendarDays className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      Re-Generate Study Plan
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Rebalance schedule by available hours
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#071C16] hover:bg-[#0B2720] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5] hover:bg-emerald-100/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-teal-500/15 text-teal-500 group-hover:bg-teal-600 group-hover:text-white transition">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      Generate Practice Questions
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      2, 5, 10-mark exam questions with rubrics
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-teal-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#071C16] hover:bg-[#0B2720] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5] hover:bg-emerald-100/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/15 text-green-500 group-hover:bg-green-600 group-hover:text-white transition">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      Review 3D Flashcards
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Active recall spaced repetition drill
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-green-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('assistant')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#071C16] hover:bg-[#0B2720] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5] hover:bg-emerald-100/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      AI Concept Explainer
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Feynman breakdown of tough topics
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => setActiveTab('validator')}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#071C16] hover:bg-[#0B2720] border-emerald-900/60 hover:border-emerald-500/40'
                    : 'bg-[#ECFDF5] hover:bg-emerald-100/70 border-[#D1E7DD] hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500 group-hover:bg-emerald-600 group-hover:text-white transition">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
                      Document Intake & Verification
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {documents.length} documents uploaded • {documents.filter((d) => d.status === 'Validated').length} verified
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-500 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
