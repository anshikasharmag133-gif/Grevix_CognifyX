import React from 'react';
import { StudyProvider, useStudy } from './context/StudyContext';
import { Navbar } from './components/Navbar';
import { FocusTimerModal } from './components/FocusTimerModal';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { PlannerView } from './components/PlannerView';
import { AIAssistantView } from './components/AIAssistantView';
import { QuestionGeneratorView } from './components/QuestionGeneratorView';
import { FlashcardView } from './components/FlashcardView';
import { SyllabusTrackerView } from './components/SyllabusTrackerView';
import { DocumentValidatorView } from './components/DocumentValidatorView';
import { AnalyticsView } from './components/AnalyticsView';

import { Toast } from './components/Toast';

const MainContent: React.FC = () => {
  const { activeTab, theme } = useStudy();

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white transition-colors duration-300 ${
        isDark ? 'bg-[#071C16] text-slate-100' : 'bg-[#ECFDF5] text-[#1F2937]'
      }`}
    >
      <Navbar />
      <FocusTimerModal />
      <Toast />

      <main className="flex-1 pb-16">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'planner' && <PlannerView />}
        {activeTab === 'assistant' && <AIAssistantView />}
        {activeTab === 'questions' && <QuestionGeneratorView />}
        {activeTab === 'flashcards' && <FlashcardView />}
        {activeTab === 'syllabus' && <SyllabusTrackerView />}
        {activeTab === 'validator' && <DocumentValidatorView />}
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Global mini status footer for app tabs */}
      {activeTab !== 'landing' && (
        <footer
          className={`py-4 text-center text-xs transition-colors border-t ${
            isDark
              ? 'border-emerald-950/80 bg-[#051510] text-emerald-300/60'
              : 'border-[#D1E7DD] bg-white text-emerald-900/70'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="font-medium">
              CognifyX — <span className="text-emerald-500 font-semibold">Study smarter. Prepare with purpose.</span>
            </span>
            <span
              className={`font-mono text-[11px] ${
                isDark ? 'text-emerald-400/50' : 'text-emerald-700/60'
              }`}
            >
              Adaptive Exam Intelligence • Emerald Edition
            </span>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <StudyProvider>
      <MainContent />
    </StudyProvider>
  );
}
