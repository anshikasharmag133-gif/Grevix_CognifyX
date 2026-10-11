import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  HelpCircle,
  AlertCircle,
  GraduationCap,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  FileCheck2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Topic, TopicPriority, TopicStatus, TopicDifficulty } from '../types';
import confetti from 'canvas-confetti';

export const SyllabusTrackerView: React.FC = () => {
  const {
    subjects,
    addSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
    setActiveTab,
    setCurrentFocusTopic,
    setIsFocusTimerOpen,
    theme,
  } = useStudy();

  const isDark = theme === 'dark';

  const [activeSubjectId, setActiveSubjectId] = useState(subjects[0]?.id || '');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  // New Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubExamDate, setNewSubExamDate] = useState('2026-11-20');
  const [newSubTargetGrade, setNewSubTargetGrade] = useState('A+');

  // New Topic Form
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicModule, setNewTopicModule] = useState('Unit 1: Foundations');
  const [newTopicPriority, setNewTopicPriority] = useState<TopicPriority>('high');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState<TopicDifficulty>('difficult');
  const [newTopicEstHours, setNewTopicEstHours] = useState(5);

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    const newSubId = `sub-${Date.now()}`;
    addSubject({
      id: newSubId,
      name: newSubName.trim(),
      code: newSubCode.trim() || 'SUB-101',
      color: 'emerald',
      examDate: newSubExamDate,
      targetGrade: newSubTargetGrade,
      topics: [],
    });

    setActiveSubjectId(newSubId);
    setNewSubName('');
    setNewSubCode('');
    setIsAddingSubject(false);
    confetti({ particleCount: 30, spread: 50 });
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !activeSubject) return;

    addTopic(activeSubject.id, {
      title: newTopicTitle.trim(),
      moduleOrUnit: newTopicModule.trim(),
      priority: newTopicPriority,
      status: 'not-started',
      difficulty: newTopicDifficulty,
      estimatedHours: Number(newTopicEstHours) || 4,
      completedHours: 0,
    });

    setNewTopicTitle('');
    setIsAddingTopic(false);
    confetti({ particleCount: 30, spread: 40 });
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
            <BookOpen className="w-4 h-4" />
            <span>Curriculum & Module Management</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Syllabus and Topic Tracker
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Track syllabus coverage, prioritize difficult units, and launch AI explanations or practice sets
            directly from any curriculum topic.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('validator')}
            className={`px-4 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-2 transition ${
              isDark
                ? 'border-emerald-800 bg-[#0A221B] text-emerald-300 hover:bg-emerald-900/40'
                : 'border-[#D1E7DD] bg-white text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-emerald-500" />
            <span>Upload & Validate Syllabus</span>
          </button>
          <button
            onClick={() => setIsAddingSubject(!isAddingSubject)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* Add Subject Modal / Form in Green Palette */}
      {isAddingSubject && (
        <form
          onSubmit={handleCreateSubject}
          className={`p-5 rounded-2xl border space-y-4 text-xs animate-fadeIn ${
            isDark ? 'bg-[#0A221B] border-emerald-500/40 text-slate-100' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
          }`}
        >
          <div className="font-bold text-sm text-emerald-600 dark:text-emerald-300">
            Add Course to Syllabus Manager:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Subject Name (e.g. Distributed Systems)"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              className={`border rounded-lg px-3 py-2 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
              required
            />
            <input
              type="text"
              placeholder="Course Code (e.g. CS-401)"
              value={newSubCode}
              onChange={(e) => setNewSubCode(e.target.value)}
              className={`border rounded-lg px-3 py-2 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            />
            <input
              type="date"
              value={newSubExamDate}
              onChange={(e) => setNewSubExamDate(e.target.value)}
              className={`border rounded-lg px-3 py-2 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
              required
            />
            <input
              type="text"
              placeholder="Target Grade (e.g. A+ / 95%)"
              value={newSubTargetGrade}
              onChange={(e) => setNewSubTargetGrade(e.target.value)}
              className={`border rounded-lg px-3 py-2 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingSubject(false)}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
            >
              Save Subject
            </button>
          </div>
        </form>
      )}

      {/* Subject Navigation Tabs with Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {subjects.map((sub) => {
          const isSelected = sub.id === activeSubject?.id;
          const totalTopics = sub.topics.length;
          const completedTopics = sub.topics.filter((t) => t.status === 'completed').length;
          const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

          return (
            <div
              key={sub.id}
              onClick={() => setActiveSubjectId(sub.id)}
              className={`cursor-pointer p-4 rounded-2xl border transition-all ${
                isSelected
                  ? isDark
                    ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/15'
                    : 'bg-emerald-100 border-emerald-400 shadow-sm'
                  : isDark
                  ? 'bg-[#0A221B] border-emerald-900/60 hover:border-emerald-700 hover:bg-[#0E3229]'
                  : 'bg-white border-[#D1E7DD] hover:border-emerald-300 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {sub.code}
                  </span>
                  <h3
                    className={`text-sm font-bold mt-0.5 truncate max-w-[170px] ${
                      isDark ? 'text-white' : 'text-[#065F46]'
                    }`}
                  >
                    {sub.name}
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {pct}%
                </span>
              </div>

              {/* Progress Bar in Emerald Green */}
              <div className="mt-3 w-full bg-slate-200 dark:bg-emerald-950 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className={`mt-2 flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>{completedTopics}/{totalTopics} Mastered</span>
                <span>Exam: {sub.examDate.split('-').slice(1).join('/')}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Subject Topic Manager */}
      {activeSubject && (
        <div
          className={`rounded-2xl border p-6 space-y-6 shadow-sm ${
            isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
              isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
            }`}
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                  {activeSubject.name}
                </h2>
                <span className="text-xs font-mono opacity-70">({activeSubject.code})</span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Target Grade:{' '}
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{activeSubject.targetGrade}</span> •
                Exam Date: <span className="font-mono">{activeSubject.examDate}</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddingTopic(!isAddingTopic)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Syllabus Topic</span>
              </button>
            </div>
          </div>

          {/* Add Topic Inline Form */}
          {isAddingTopic && (
            <form
              onSubmit={handleCreateTopic}
              className={`p-4 rounded-xl border space-y-3 text-xs ${
                isDark ? 'bg-[#071C16] border-emerald-500/40 text-slate-100' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            >
              <div className="font-semibold text-emerald-600 dark:text-emerald-300">
                Add Topic to {activeSubject.name}:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Topic Title (e.g. B+ Tree Indexing)"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  className={`border rounded-lg px-3 py-2 ${
                    isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                  }`}
                  required
                />
                <input
                  type="text"
                  placeholder="Module or Unit (e.g. Unit 3: Indexing)"
                  value={newTopicModule}
                  onChange={(e) => setNewTopicModule(e.target.value)}
                  className={`border rounded-lg px-3 py-2 ${
                    isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1 opacity-80">Priority:</label>
                  <select
                    value={newTopicPriority}
                    onChange={(e: any) => setNewTopicPriority(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-1.5 ${
                      isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  >
                    <option value="high">High (Exam Critical)</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 opacity-80">Difficulty:</label>
                  <select
                    value={newTopicDifficulty}
                    onChange={(e: any) => setNewTopicDifficulty(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-1.5 ${
                      isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  >
                    <option value="difficult">Difficult</option>
                    <option value="moderate">Moderate</option>
                    <option value="easy">Easy</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 opacity-80">Estimated Hours:</label>
                  <input
                    type="number"
                    value={newTopicEstHours}
                    onChange={(e) => setNewTopicEstHours(Number(e.target.value))}
                    className={`w-full border rounded-lg px-3 py-1.5 ${
                      isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTopic(false)}
                  className="px-3 py-1 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Topic
                </button>
              </div>
            </form>
          )}

          {/* Topics List */}
          <div className="space-y-3">
            {activeSubject.topics.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No topics in this subject yet. Click "Add Syllabus Topic" to build your module outline!
              </div>
            ) : (
              activeSubject.topics.map((topic) => {
                return (
                  <div
                    key={topic.id}
                    className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDark
                        ? 'bg-[#071C16] border-emerald-900/60 hover:border-emerald-700'
                        : 'bg-[#ECFDF5]/60 border-[#D1E7DD] hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => {
                          const nextStatus: TopicStatus =
                            topic.status === 'completed'
                              ? 'not-started'
                              : topic.status === 'not-started'
                              ? 'in-progress'
                              : 'completed';
                          updateTopic(activeSubject.id, topic.id, { status: nextStatus });
                          if (nextStatus === 'completed') {
                            confetti({ particleCount: 35, spread: 50 });
                          }
                        }}
                        className="mt-0.5 text-slate-400 hover:text-emerald-500 transition"
                        title="Click to toggle: Not Started › In Progress › Completed"
                      >
                        {topic.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        ) : topic.status === 'in-progress' ? (
                          <Clock className="w-5 h-5 text-teal-500" />
                        ) : (
                          <Circle className="w-5 h-5 opacity-40 hover:opacity-80" />
                        )}
                      </button>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-sm font-bold ${
                              topic.status === 'completed'
                                ? 'opacity-50 line-through'
                                : isDark ? 'text-slate-100' : 'text-[#1F2937]'
                            }`}
                          >
                            {topic.title}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              topic.priority === 'high'
                                ? 'bg-red-500/15 text-red-500 border border-red-500/30'
                                : topic.priority === 'medium'
                                ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                                : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'
                            }`}
                          >
                            {topic.priority.toUpperCase()} PRIORITY
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                            {topic.difficulty}
                          </span>
                        </div>

                        <div className={`text-xs mt-1 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="font-mono">{topic.moduleOrUnit}</span>
                          <span>•</span>
                          <span>Est: {topic.estimatedHours} hrs</span>
                          {topic.notes && (
                            <>
                              <span>•</span>
                              <span className="italic truncate max-w-sm">{topic.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons on topic */}
                    <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => {
                          setCurrentFocusTopic(`${activeSubject.name}: ${topic.title}`);
                          setIsFocusTimerOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 transition"
                        title="Study with Pomodoro"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Focus</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('assistant')}
                        className="px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-600 dark:text-teal-300 text-xs font-semibold flex items-center gap-1 transition"
                        title="AI Explain this topic"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>AI Tutor</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('questions')}
                        className="px-2.5 py-1.5 rounded-lg bg-green-500/15 hover:bg-green-500/25 text-green-600 dark:text-green-400 text-xs font-semibold flex items-center gap-1 transition"
                        title="Drill Exam Questions"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Practice</span>
                      </button>

                      <button
                        onClick={() => deleteTopic(activeSubject.id, topic.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 transition"
                        title="Delete Topic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
