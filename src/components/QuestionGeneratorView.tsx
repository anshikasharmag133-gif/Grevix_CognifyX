import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Filter,
  BookOpen,
  Award,
  Layers,
  ChevronDown,
  ChevronUp,
  FileText,
  ShieldAlert,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { PracticeQuestion, QuestionType, DifficultyLevel } from '../types';
import confetti from 'canvas-confetti';

export const QuestionGeneratorView: React.FC = () => {
  const { subjects, questions, addQuestion, updateQuestion, theme } = useStudy();

  const isDark = theme === 'dark';

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjects[0]?.id || '');
  const [selectedTopic, setSelectedTopic] = useState('Dynamic Programming & Memoization');
  const [questionType, setQuestionType] = useState<QuestionType | 'all'>('all');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: currentSubject?.name || 'Computer Science',
          topic: selectedTopic,
          difficulty,
          questionType: questionType === 'all' ? 'mixed' : questionType,
          sourceMaterial,
        }),
      });

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        data.questions.forEach((q: any) => {
          addQuestion({
            subjectId: selectedSubjectId,
            topic: selectedTopic,
            questionType: q.questionType || '5-mark',
            marks: Number(q.marks) || (q.questionType === '2-mark' ? 2 : q.questionType === '10-mark' ? 10 : 5),
            difficulty: q.difficulty || difficulty,
            questionText: q.questionText,
            options: q.options || undefined,
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || '',
            isAnswerRevealed: false,
            isUserSourceMaterial: Boolean(sourceMaterial.trim()),
          });
        });
        confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error('Question generation failed:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredQuestions = questions.filter((q) => {
    if (filterType !== 'all' && q.questionType !== filterType) return false;
    return true;
  });

  const toggleRevealAnswer = (id: string, current: boolean) => {
    updateQuestion(id, { isAnswerRevealed: !current });
  };

  const handleSelectMcq = (questionId: string, option: string, correctAnswer: string) => {
    setMcqAnswers((prev) => ({ ...prev, [questionId]: option }));
    if (option === correctAnswer) {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      updateQuestion(questionId, { studentSelfEvaluation: 'correct', isAnswerRevealed: true });
    } else {
      updateQuestion(questionId, { studentSelfEvaluation: 'needs-review', isAnswerRevealed: true });
    }
  };

  const handleSelfGrade = (questionId: string, rating: 'correct' | 'partially-correct' | 'needs-review') => {
    updateQuestion(questionId, { studentSelfEvaluation: rating });
    if (rating === 'correct') {
      confetti({ particleCount: 25, spread: 40 });
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
            <Award className="w-4 h-4" />
            <span>University Format Examination Bank</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Question Practice Generator
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Generate authentic 2-mark definitions, 5-mark analytical questions, 10-mark comprehensive derivations,
            and MCQs with grading rubrics.
          </p>
        </div>
      </div>

      {/* Generator Form Box */}
      <div
        className={`rounded-2xl border p-6 space-y-5 shadow-sm ${
          isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
        }`}
      >
        <div
          className={`flex items-center justify-between pb-3 border-b ${
            isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
              Generate Custom Practice Set
            </h3>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Mark-Scheme Aligned</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Subject:</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                setSelectedSubjectId(e.target.value);
                const sub = subjects.find((s) => s.id === e.target.value);
                if (sub && sub.topics[0]) {
                  setSelectedTopic(sub.topics[0].title);
                }
              }}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            >
              {currentSubject?.topics.map((t) => (
                <option key={t.id} value={t.title}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question Type */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Question Format:</label>
            <select
              value={questionType}
              onChange={(e: any) => setQuestionType(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
              }`}
            >
              <option value="all">Mixed (2M, 5M, 10M & MCQs)</option>
              <option value="2-mark">2-Mark (Definitions & Invariants)</option>
              <option value="5-mark">5-Mark (Analytical & Diagrams)</option>
              <option value="10-mark">10-Mark (Long Derivations)</option>
              <option value="mcq">Multiple-Choice (MCQ)</option>
              <option value="short">Short Revision Questions</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-semibold mb-1.5">Target Difficulty:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 rounded-lg text-xs font-semibold capitalize border transition ${
                    difficulty === diff
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                      : isDark
                      ? 'bg-[#071C16] border-emerald-900 text-slate-400 hover:text-white'
                      : 'bg-[#ECFDF5] border-[#D1E7DD] text-slate-600 hover:text-[#1F2937]'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Source Material or University Syllabus text */}
        <div>
          <label className="block text-xs font-semibold mb-1">
            Optional: Paste Textbook Excerpt, Slide Notes, or Past Exam Theme:
          </label>
          <textarea
            rows={2}
            value={sourceMaterial}
            onChange={(e) => setSourceMaterial(e.target.value)}
            placeholder="Paste syllabus extract to tailor questions to your exact university guidelines..."
            className={`w-full border rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500 resize-none ${
              isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
            }`}
          />
          <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <ShieldAlert className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Disclaimer: Questions generated from supplied materials are inspired practice problems, never falsely labeled as leaked past papers.
            </span>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateQuestions}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Crafting Examination Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Questions</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Questions Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
            Question Bank ({filteredQuestions.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', '2-mark', '5-mark', '10-mark', 'mcq'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition ${
                filterType === type
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-300 font-bold'
                  : isDark
                  ? 'bg-[#0A221B] border-emerald-900 text-slate-400 hover:text-white'
                  : 'bg-white border-[#D1E7DD] text-slate-600 hover:text-[#1F2937]'
              }`}
            >
              {type === 'all' ? 'All Formats' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, index) => {
          const subject = subjects.find((s) => s.id === q.subjectId);
          const isRevealed = q.isAnswerRevealed;
          const userMcqSelection = mcqAnswers[q.id];

          return (
            <div
              key={q.id}
              className={`rounded-2xl border p-6 space-y-4 shadow-sm transition ${
                isDark
                  ? 'bg-[#0A221B] border-emerald-900/60 hover:border-emerald-700/80'
                  : 'bg-white border-[#D1E7DD] hover:border-emerald-300'
              }`}
            >
              {/* Question Badge & Mark Value */}
              <div
                className={`flex flex-wrap items-center justify-between gap-2 pb-3 border-b ${
                  isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold opacity-60">#{index + 1}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono ${
                      q.marks === 10
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : q.marks === 5
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : q.marks === 2
                        ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30'
                        : 'bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/30'
                    }`}
                  >
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'} • {q.questionType.toUpperCase()}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {subject?.name || 'General'} ›{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-300">{q.topic}</span>
                  </span>
                  {q.isUserSourceMaterial && (
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                      From Student Uploaded Material
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold capitalize px-2 py-0.5 rounded ${
                      q.difficulty === 'hard'
                        ? 'text-red-400 bg-red-950/40'
                        : q.difficulty === 'medium'
                        ? 'text-amber-500 bg-amber-500/15'
                        : 'text-emerald-500 bg-emerald-500/15'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className={`text-sm font-semibold leading-relaxed ${isDark ? 'text-slate-100' : 'text-[#1F2937]'}`}>
                {q.questionText}
              </div>

              {/* If MCQ, show clickable options */}
              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {q.options.map((opt, i) => {
                    const isSelected = userMcqSelection === opt;
                    const isCorrect = opt === q.correctAnswer;
                    let style = isDark
                      ? 'bg-[#071C16] border-emerald-900/60 text-slate-300 hover:border-emerald-700'
                      : 'bg-[#ECFDF5] border-[#D1E7DD] text-slate-700 hover:border-emerald-300';

                    if (isRevealed) {
                      if (isCorrect) {
                        style = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-red-500/20 border-red-500 text-red-600 dark:text-red-300 font-bold';
                      }
                    } else if (isSelected) {
                      style = 'bg-emerald-600/25 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold';
                    }

                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSelectMcq(q.id, opt, q.correctAnswer)}
                        className={`p-3 rounded-xl border text-xs text-left transition flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {isRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
                        {isRevealed && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Reveal Model Answer / Grading Rubric Button */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => toggleRevealAnswer(q.id, Boolean(isRevealed))}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                    isDark
                      ? 'bg-[#071C16] border-emerald-900 text-slate-200 hover:bg-[#0E3229]'
                      : 'bg-emerald-50 border-[#D1E7DD] text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
                  <span>{isRevealed ? 'Hide Model Answer' : 'Reveal Model Answer & Rubric'}</span>
                </button>

                {/* Self-Score rating buttons if answer is revealed */}
                {isRevealed && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="opacity-60 text-[11px]">Self-Evaluation:</span>
                    <button
                      onClick={() => handleSelfGrade(q.id, 'correct')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        q.studentSelfEvaluation === 'correct'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      ✓ Full Marks
                    </button>
                    <button
                      onClick={() => handleSelfGrade(q.id, 'partially-correct')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        q.studentSelfEvaluation === 'partially-correct'
                          ? 'bg-amber-600 text-white'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                      }`}
                    >
                      ~ Partial
                    </button>
                    <button
                      onClick={() => handleSelfGrade(q.id, 'needs-review')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                        q.studentSelfEvaluation === 'needs-review'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-500/15 text-red-500 border border-red-500/30'
                      }`}
                    >
                      ✕ Needs Review
                    </button>
                  </div>
                )}
              </div>

              {/* Revealed Answer Box */}
              {isRevealed && (
                <div
                  className={`p-4 rounded-xl border space-y-3 text-xs animate-fadeIn ${
                    isDark
                      ? 'bg-[#071C16] border-emerald-500/40 text-slate-200'
                      : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                >
                  <div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                      Model Solution / Key Takeaway:
                    </span>
                    <p className="leading-relaxed font-medium">{q.correctAnswer}</p>
                  </div>

                  <div className={`pt-2 border-t ${isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'}`}>
                    <span className="font-bold text-teal-600 dark:text-teal-400 block mb-1">
                      Marking Rubric & Grading Criteria ({q.marks} Marks Scheme):
                    </span>
                    <div className="whitespace-pre-line leading-relaxed font-sans opacity-90">
                      {q.explanation}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
