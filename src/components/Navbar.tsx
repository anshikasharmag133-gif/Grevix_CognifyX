import React, { useState } from 'react';
import {
  Compass,
  LayoutDashboard,
  CalendarDays,
  Bot,
  HelpCircle,
  Layers,
  BookOpen,
  BarChart3,
  Flame,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Sun,
  Moon,
  FileCheck2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    profile,
    documents,
    setIsFocusTimerOpen,
    resetToSampleData,
    clearAllData,
    exportDataJSON,
    importDataJSON,
    theme,
    toggleTheme,
    showToast,
  } = useStudy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dataDropdownOpen, setDataDropdownOpen] = useState(false);

  const isDark = theme === 'dark';

  const docIssuesCount = documents.filter((d) => d.status === 'Potential issue').length;

  const navItems = [
    { id: 'landing', label: 'Home', icon: Compass },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'assistant', label: 'AI Tutor', icon: Bot, badge: 'AI' },
    { id: 'questions', label: 'Exam Bank', icon: HelpCircle },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    {
      id: 'validator',
      label: 'Doc Validator',
      icon: FileCheck2,
      badge: docIssuesCount > 0 ? `${docIssuesCount} Alert` : 'Card 1',
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleExport = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CognifyX-Green-Plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDataDropdownOpen(false);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.name.toLowerCase().endsWith('.pdf')) {
          showToast(
            'The selected file is a PDF document, not a CognifyX JSON backup file. To analyze syllabus notes, use the AI Tutor or Question Bank.',
            'error'
          );
          setDataDropdownOpen(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (content) {
            const res = importDataJSON(content);
            showToast(res.message, res.success ? 'success' : 'error');
          }
        };
        reader.onerror = () => {
          showToast('Failed to read the selected file.', 'error');
        };
        reader.readAsText(file);
      }
    };
    input.click();
    setDataDropdownOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b backdrop-blur-xl ${
        isDark
          ? 'border-emerald-900/40 bg-[#071C16]/90 text-slate-100'
          : 'border-[#D1E7DD] bg-white/95 text-[#1F2937] shadow-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand in Emerald Green */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400 shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl bg-emerald-300/20 blur-sm pointer-events-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-extrabold text-xl tracking-tight ${isDark ? 'text-white' : 'text-[#065F46]'}`}>
                  Cognify
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                    X
                  </span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Adaptive
                </span>
              </div>
              <p
                className={`hidden md:block text-[10.5px] font-medium tracking-wide ${
                  isDark ? 'text-emerald-300/70' : 'text-emerald-800/80'
                }`}
              >
                Study smarter. Prepare with purpose.
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? isDark
                        ? 'text-white bg-emerald-500/20 border border-emerald-400/40 shadow-sm shadow-emerald-500/10'
                        : 'text-emerald-900 bg-emerald-100 border border-emerald-300 shadow-sm'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-emerald-950/60'
                      : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                        : isDark ? 'text-emerald-400/70' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1 py-0.2 text-[9px] font-bold rounded bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle (Dark Forest Green / Soft Mint Light Mode) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition flex items-center justify-center ${
                isDark
                  ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300 hover:text-white hover:bg-emerald-900/60'
                  : 'bg-emerald-50 border-[#D1E7DD] text-emerald-800 hover:bg-emerald-100'
              }`}
              title={isDark ? 'Switch to Soft Mint Light Mode' : 'Switch to Deep Forest Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-emerald-400" /> : <Moon className="w-4 h-4 text-emerald-700" />}
            </button>

            {/* Streak Indicator */}
            <div
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border ${
                isDark
                  ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50 border-[#D1E7DD] text-emerald-800'
              }`}
              title={`${profile.studyStreak} day study streak!`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{profile.studyStreak}d</span>
            </div>

            {/* Quick Focus Button in Emerald */}
            <button
              onClick={() => setIsFocusTimerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/25"
              title="Launch Pomodoro Focus Timer"
            >
              <Clock className="w-3.5 h-3.5 text-white" />
              <span className="hidden sm:inline">Focus</span>
            </button>

            {/* Data & Options Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDataDropdownOpen(!dataDropdownOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition ${
                  isDark
                    ? 'bg-[#0A221B] border-emerald-900/60 text-slate-200 hover:text-white hover:border-emerald-700'
                    : 'bg-white border-[#D1E7DD] text-slate-700 hover:text-emerald-900 hover:border-emerald-400'
                }`}
              >
                <span>Options</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-500" />
              </button>

              {dataDropdownOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-xl border p-1.5 shadow-2xl z-50 text-xs animate-fadeIn ${
                    isDark
                      ? 'bg-[#0B2720] border-emerald-800/60 text-slate-200'
                      : 'bg-white border-[#D1E7DD] text-slate-800'
                  }`}
                >
                  <div
                    className={`px-2.5 py-1.5 text-[11px] font-semibold border-b mb-1 ${
                      isDark ? 'text-emerald-400/80 border-emerald-900/80' : 'text-emerald-800 border-slate-100'
                    }`}
                  >
                    Study Data Management
                  </div>
                  <button
                    onClick={handleExport}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-left ${
                      isDark ? 'hover:bg-emerald-900/40 hover:text-white' : 'hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Backup / Export JSON</span>
                  </button>
                  <button
                    onClick={handleImport}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-left ${
                      isDark ? 'hover:bg-emerald-900/40 hover:text-white' : 'hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-teal-400" />
                    <span>Import Study JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      resetToSampleData();
                      showToast('Curriculum reset to university sample subjects.', 'info');
                      setDataDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition text-left ${
                      isDark ? 'hover:bg-emerald-900/40 hover:text-white' : 'hover:bg-emerald-50 hover:text-emerald-900'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                    <span>Reset Sample Data</span>
                  </button>
                  <button
                    onClick={() => {
                      clearAllData();
                      showToast('All course subjects and study data cleared.', 'info');
                      setDataDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-red-500/10 text-red-400 transition text-left"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Clear All Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-emerald-950' : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
              }`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          className={`lg:hidden border-t px-4 pt-2 pb-4 space-y-1 ${
            isDark ? 'border-emerald-900/60 bg-[#071C16]' : 'border-[#D1E7DD] bg-white'
          }`}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-lg transition ${
                  isActive
                    ? isDark
                      ? 'text-white bg-emerald-500/20 border border-emerald-400/30'
                      : 'text-emerald-900 bg-emerald-100 border border-emerald-300'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-emerald-950/60'
                    : 'text-slate-600 hover:text-emerald-900 hover:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
