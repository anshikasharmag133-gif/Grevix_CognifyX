import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Award,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Flashcard, FlashcardMastery } from '../types';
import confetti from 'canvas-confetti';

export const FlashcardView: React.FC = () => {
  const {
    subjects,
    flashcards,
    updateFlashcardMastery,
    addFlashcard,
    deleteFlashcard,
    theme,
    showToast,
  } = useStudy();

  const isDark = theme === 'dark';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterMastery, setFilterMastery] = useState<string>('all');
  const [isCreatingModal, setIsCreatingModal] = useState(false);

  // New card form state
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newTopic, setNewTopic] = useState('Dynamic Programming');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newKeyPoints, setNewKeyPoints] = useState('');

  // Filtered list
  const filteredCards = flashcards.filter((c) => {
    if (filterSubjectId !== 'all' && c.subjectId !== filterSubjectId) return false;
    if (filterMastery !== 'all' && c.mastery !== filterMastery) return false;
    return true;
  });

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  useEffect(() => {
    if (currentIndex >= filteredCards.length) {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  }, [filterSubjectId, filterMastery, filteredCards.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCreatingModal) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        if (currentCard) {
          handleMarkMastery(currentCard.id, 'mastered');
        }
      } else if (e.code === 'ArrowLeft') {
        if (currentCard) {
          handleMarkMastery(currentCard.id, 'need-practice');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreatingModal, currentCard]);

  const handleMarkMastery = (cardId: string, mastery: FlashcardMastery) => {
    updateFlashcardMastery(cardId, mastery);
    if (mastery === 'mastered') {
      confetti({ particleCount: 35, spread: 45, origin: { y: 0.6 } });
    }
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
    }
    setIsFlipped(false);
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    addFlashcard({
      subjectId: newSubjectId,
      topic: newTopic.trim(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      keyPoints: newKeyPoints
        ? newKeyPoints.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      mastery: 'need-practice',
    });

    setNewQuestion('');
    setNewAnswer('');
    setNewKeyPoints('');
    setIsCreatingModal(false);
    confetti({ particleCount: 40, spread: 50 });
    showToast('Flashcard added to your active recall deck!', 'success');
  };

  const masteredCount = flashcards.filter((c) => c.mastery === 'mastered').length;
  const needPracticeCount = flashcards.filter((c) => c.mastery === 'need-practice').length;
  const masteryPercentage =
    flashcards.length > 0 ? Math.round((masteredCount / flashcards.length) * 100) : 0;

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
            <Layers className="w-4 h-4" />
            <span>Active Recall Retention Engine</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            3D Flashcards & Active Recall
          </h1>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Spaced repetition flashcards designed for college exams. Flip cards, mark mastery, and drill
            weak formulas and proofs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreatingModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Flashcard</span>
          </button>
        </div>
      </div>

      {/* Mastery Progress Bar */}
      <div
        className={`rounded-2xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm ${
          isDark ? 'bg-[#0A221B] border-emerald-900/60' : 'bg-white border-[#D1E7DD]'
        }`}
      >
        <div className="w-full md:w-1/2 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className={isDark ? 'text-slate-200' : 'text-[#065F46]'}>Deck Retention Mastery:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{masteryPercentage}% Mastered</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-emerald-950 rounded-full h-2.5 overflow-hidden border border-emerald-900/40">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-[#071C16] border-emerald-900' : 'bg-[#ECFDF5] border-[#D1E7DD]'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">{masteredCount} Mastered</span>
          </div>
          <div
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 ${
              isDark ? 'bg-[#071C16] border-emerald-900' : 'bg-[#ECFDF5] border-[#D1E7DD]'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="font-semibold text-amber-600 dark:text-amber-400">{needPracticeCount} Need Practice</span>
          </div>
          <div
            className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 font-mono ${
              isDark ? 'bg-[#071C16] border-emerald-900 text-slate-400' : 'bg-[#ECFDF5] border-[#D1E7DD] text-slate-600'
            }`}
          >
            <span>{flashcards.length} Total</span>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 text-xs ${
              isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
            }`}
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={filterMastery}
            onChange={(e) => setFilterMastery(e.target.value)}
            className={`border rounded-xl px-3 py-1.5 text-xs ${
              isDark ? 'bg-[#0A221B] border-emerald-900 text-white' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
            }`}
          >
            <option value="all">All Mastery Levels</option>
            <option value="need-practice">Need Practice Only (Weak Cards)</option>
            <option value="mastered">Mastered Only</option>
          </select>
        </div>

        <div className="text-xs font-mono opacity-70">
          Card {filteredCards.length > 0 ? currentIndex + 1 : 0} of {filteredCards.length}
        </div>
      </div>

      {/* 3D Flip Flashcard Display Area */}
      {currentCard ? (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Card Container with 3D Flip */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 w-full min-h-[340px] select-none"
          >
            <div
              className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* FRONT SIDE */}
              <div
                className={`absolute inset-0 backface-hidden rounded-3xl border-2 p-8 flex flex-col justify-between ${
                  isDark
                    ? 'bg-gradient-to-br from-[#0A221B] via-[#071C16] to-[#0A221B] border-emerald-500/30'
                    : 'bg-white border-2 border-emerald-400 shadow-xl'
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between pb-3 border-b ${
                      isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                    }`}
                  >
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {subjects.find((s) => s.id === currentCard.subjectId)?.name || 'General'}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        currentCard.mastery === 'mastered'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {currentCard.mastery === 'mastered' ? 'Mastered' : 'Needs Practice'}
                    </span>
                  </div>

                  <div className="mt-8 text-center">
                    <span className="text-xs font-mono block mb-2 opacity-70">
                      Topic: {currentCard.topic}
                    </span>
                    <h3
                      className={`text-lg sm:text-xl font-extrabold leading-relaxed ${
                        isDark ? 'text-white' : 'text-[#065F46]'
                      }`}
                    >
                      {currentCard.question}
                    </h3>
                  </div>
                </div>

                <div
                  className={`text-center pt-4 border-t flex items-center justify-center gap-2 text-xs font-semibold ${
                    isDark ? 'border-emerald-900/60 text-emerald-400/80' : 'border-[#D1E7DD] text-emerald-700'
                  }`}
                >
                  <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
                  <span>Click or press [Space] to flip answer</span>
                </div>
              </div>

              {/* BACK SIDE */}
              <div
                className={`absolute inset-0 backface-hidden rotate-y-180 rounded-3xl border-2 p-8 flex flex-col justify-between ${
                  isDark
                    ? 'bg-gradient-to-br from-[#065F46]/40 via-[#0A221B] to-[#071C16] border-emerald-400/40 text-slate-100'
                    : 'bg-[#ECFDF5] border-2 border-emerald-500 text-[#1F2937] shadow-xl'
                }`}
              >
                <div>
                  <div
                    className={`flex items-center justify-between pb-3 border-b ${
                      isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                    }`}
                  >
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Model Answer & Key Invariants
                    </span>
                    <span className="text-xs font-mono opacity-60">
                      Last reviewed: {currentCard.lastReviewed || 'Today'}
                    </span>
                  </div>

                  <div className="mt-6 text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {currentCard.answer}
                  </div>

                  {currentCard.keyPoints && currentCard.keyPoints.length > 0 && (
                    <div
                      className={`mt-4 pt-3 border-t flex flex-wrap gap-1.5 ${
                        isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                      }`}
                    >
                      {currentCard.keyPoints.map((pt, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                        >
                          {pt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  className={`text-center pt-4 border-t text-xs ${
                    isDark ? 'border-emerald-900/60 text-slate-400' : 'border-[#D1E7DD] text-slate-500'
                  }`}
                >
                  Rate your active recall below
                </div>
              </div>
            </div>
          </div>

          {/* Action Ratings */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => handleMarkMastery(currentCard.id, 'need-practice')}
              className="flex-1 py-3.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 transition hover:scale-102"
              title="Shortcut: Left Arrow"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Need Practice [←]</span>
            </button>

            <button
              onClick={() => handleMarkMastery(currentCard.id, 'mastered')}
              className="flex-1 py-3.5 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition hover:scale-102"
              title="Shortcut: Right Arrow"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mastered [→]</span>
            </button>
          </div>

          {/* Carousel Arrows */}
          <div className="flex items-center justify-center gap-4 text-xs opacity-75">
            <button
              onClick={() => {
                setCurrentIndex((i) => (i > 0 ? i - 1 : filteredCards.length - 1));
                setIsFlipped(false);
              }}
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-[#0A221B] border-emerald-900 hover:text-white' : 'bg-white border-[#D1E7DD] hover:text-[#065F46]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>
              {currentIndex + 1} / {filteredCards.length}
            </span>
            <button
              onClick={() => {
                setCurrentIndex((i) => (i < filteredCards.length - 1 ? i + 1 : 0));
                setIsFlipped(false);
              }}
              className={`p-2 rounded-xl border ${
                isDark ? 'bg-[#0A221B] border-emerald-900 hover:text-white' : 'bg-white border-[#D1E7DD] hover:text-[#065F46]'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`text-center py-20 rounded-3xl border p-8 space-y-3 ${
            isDark ? 'bg-[#0A221B]/40 border-emerald-900' : 'bg-white border-[#D1E7DD]'
          }`}
        >
          <Layers className="w-8 h-8 text-emerald-500 mx-auto" />
          <h4 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-[#065F46]'}`}>
            No Flashcards Match Filters
          </h4>
          <p className="text-xs opacity-75">
            Switch filters or create a new card to start active recall drills.
          </p>
        </div>
      )}

      {/* Create Custom Flashcard Modal */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className={`relative w-full max-w-lg rounded-2xl border p-6 sm:p-8 shadow-2xl ${
              isDark ? 'bg-[#0A221B] border-emerald-500/40 text-slate-100' : 'bg-white border-[#D1E7DD] text-[#1F2937]'
            }`}
          >
            <div
              className={`flex items-center justify-between pb-3 border-b mb-5 ${
                isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
              }`}
            >
              <h3 className={`font-bold text-base flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                <Plus className="w-4 h-4 text-emerald-500" />
                <span>Create Custom Flashcard</span>
              </h3>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-slate-400 hover:text-emerald-500 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Subject:</label>
                  <select
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                    }`}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Topic Name:</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 ${
                      isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                    }`}
                    placeholder="e.g. Graph Algorithms"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Card Front (Question or Prompt):
                </label>
                <textarea
                  rows={3}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="e.g. Why does Dijkstra fail on negative weight edges?"
                  className={`w-full border rounded-lg p-3 ${
                    isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Card Back (Model Answer):
                </label>
                <textarea
                  rows={4}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="e.g. Greedy choice assumption is violated because a shorter path through a negative edge may be discovered later..."
                  className={`w-full border rounded-lg p-3 ${
                    isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Key Keywords (comma-separated):
                </label>
                <input
                  type="text"
                  value={newKeyPoints}
                  onChange={(e) => setNewKeyPoints(e.target.value)}
                  placeholder="Greedy Choice, Bellman-Ford, Closed Set"
                  className={`w-full border rounded-lg px-3 py-2 ${
                    isDark ? 'bg-[#071C16] border-emerald-900 text-white' : 'bg-[#ECFDF5] border-[#D1E7DD] text-[#1F2937]'
                  }`}
                />
              </div>

              <div
                className={`flex justify-end gap-2 pt-3 border-t ${
                  isDark ? 'border-emerald-900/60' : 'border-[#D1E7DD]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
