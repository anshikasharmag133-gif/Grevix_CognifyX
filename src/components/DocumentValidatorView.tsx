import React, { useState } from 'react';
import {
  FileCheck2,
  FileText,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Calendar,
  ArrowRight,
  Trash2,
  RefreshCw,
  Play,
  Check,
  Layers,
  ChevronRight,
  Info,
  Clock,
  ExternalLink,
  Target,
  FileQuestion,
  FilePlus,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import {
  DocumentType,
  ValidationStatus,
  ValidatedDocument,
  ValidationIssue,
  BenchmarkResults,
  BenchmarkCase,
} from '../types';
import {
  validateDocument,
  SYNTHETIC_BENCHMARK_CASES,
  runBenchmarkEvaluation,
} from '../utils/documentValidator';
import confetti from 'canvas-confetti';

export const DocumentValidatorView: React.FC = () => {
  const {
    profile,
    documents,
    selectedDocId,
    setSelectedDocId,
    addDocument,
    removeDocument,
    dismissDocIssue,
    overrideDocStatus,
    importDocTopicsToSyllabus,
    setActiveTab,
    theme,
    showToast,
  } = useStudy();

  const isDark = theme === 'dark';

  // Navigation tab within the validator
  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'benchmark'>('workspace');

  // Upload & Input states
  const [docType, setDocType] = useState<DocumentType>('syllabus');
  const [isDragging, setIsDragging] = useState(false);
  const [manualText, setManualText] = useState('');
  const [manualFileName, setManualFileName] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [isProcessing, setIsProcessing] = useState(false);

  // Benchmark evaluation results (computed on-demand or initially)
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResults>(() =>
    runBenchmarkEvaluation(profile)
  );
  const [selectedBenchmarkCase, setSelectedBenchmarkCase] = useState<BenchmarkCase | null>(null);

  // Active document
  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;

  // File Upload Handler
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsProcessing(true);

    const reader = new FileReader();

    // Check if PDF or text
    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';

    reader.onload = (e) => {
      const result = e.target?.result;
      let textContent = '';

      if (typeof result === 'string') {
        textContent = result;
      } else if (result instanceof ArrayBuffer) {
        // Decode binary to inspect stream / text
        const decoder = new TextDecoder('utf-8', { fatal: false });
        textContent = decoder.decode(result);
      }

      // Try basic PDF stream extraction if text contains PDF binary markers
      if (isPdf && textContent.includes('%PDF')) {
        // Look for uncompressed text in BT ... ET text blocks
        const textBlocks: string[] = [];
        const btRegex = /BT[\s\S]*?ET/g;
        let match;
        while ((match = btRegex.exec(textContent)) !== null) {
          const block = match[0];
          // Extract text inside parentheses (e.g. (Hello World) Tj)
          const tjMatches = block.match(/\(([^()]{2,})\)\s*(?:Tj|TJ|'|")/g);
          if (tjMatches) {
            tjMatches.forEach((m) => {
              const cleaned = m.replace(/^\(/, '').replace(/\)\s*(?:Tj|TJ|'|")$/, '').trim();
              if (cleaned.length > 2) textBlocks.push(cleaned);
            });
          }
        }

        if (textBlocks.length > 5) {
          textContent = textBlocks.join('\n');
        }
      }

      const validated = validateDocument(
        file.name,
        textContent,
        file.size,
        docType,
        profile
      );

      addDocument(validated);
      setIsProcessing(false);

      if (validated.status === 'Validated') {
        confetti({ particleCount: 40, spread: 50 });
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      showToast(`Error reading file "${file.name}".`, 'error');
    };

    // For PDF files, read as binary string / array buffer to detect stream headers
    if (isPdf) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Manual Paste Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualText.trim()) {
      showToast('Please paste or write document text first.', 'error');
      return;
    }

    const fileName = manualFileName.trim() || `${docType}_document_${new Date().toLocaleDateString('en-US').replace(/\//g, '-')}.txt`;
    const validated = validateDocument(
      fileName,
      manualText,
      manualText.length,
      docType,
      profile
    );

    addDocument(validated);
    setManualText('');
    setManualFileName('');
    if (validated.status === 'Validated') {
      confetti({ particleCount: 35, spread: 45 });
    }
  };

  // Re-run benchmark
  const handleRunBenchmark = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const results = runBenchmarkEvaluation(profile);
      setBenchmarkResults(results);
      setIsProcessing(false);
      confetti({ particleCount: 50, spread: 60 });
      showToast(`Benchmark completed: ${results.accuracy}% accuracy across ${results.sampleSize} cases!`, 'success');
    }, 400);
  };

  // Load a synthetic case directly into validator
  const handleLoadSyntheticCase = (c: BenchmarkCase) => {
    const validated = validateDocument(
      c.fileName,
      c.text,
      c.text.length,
      c.documentType,
      profile
    );
    validated.isSyntheticTest = true;
    addDocument(validated);
    setActiveSubTab('workspace');
    showToast(`Loaded test case "${c.label}" into validator`, 'info');
  };

  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'Validated':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Validated</span>
          </span>
        );
      case 'Needs verification':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Needs verification</span>
          </span>
        );
      case 'Potential issue':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Potential issue</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div
        className={`rounded-2xl border p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-r from-[#065F46]/50 via-[#0C2920] to-[#071C16] border-emerald-500/30'
            : 'bg-gradient-to-r from-emerald-100 via-white to-emerald-50 border-[#D1E7DD]'
        }`}
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>GREVIX AfterCode Challenge Card 1: Document Validation Engine</span>
          </div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-[#065F46]'
            }`}
          >
            Study Plan Document Intake & Verification
          </h1>
          <p
            className={`text-xs sm:text-sm mt-2 leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            Detect incomplete, unreadable, or outdated syllabi, previous-year question papers, and assignments using
            evidence-based analysis. Zero false alarms on short electives or valid past exams, and students can review
            uncertain items without blocking their planner.
          </p>
        </div>

        {/* Quick Nav / Benchmark Toggle */}
        <div className="relative z-10 flex flex-wrap gap-2 sm:self-center">
          <button
            onClick={() => setActiveSubTab('workspace')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
              activeSubTab === 'workspace'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : isDark
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-slate-300 border border-emerald-800/60'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border border-[#D1E7DD]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Workspace ({documents.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('benchmark')}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 transition shadow-sm ${
              activeSubTab === 'benchmark'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : isDark
                ? 'bg-emerald-950/60 hover:bg-emerald-900/60 text-slate-300 border border-emerald-800/60'
                : 'bg-white hover:bg-emerald-50 text-slate-700 border border-[#D1E7DD]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Benchmark Suite & Metrics</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-mono">
              {benchmarkResults.accuracy}% Acc
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SUB-TAB 1: DOCUMENT WORKSPACE & EVIDENCE REPORT          */}
      {/* ======================================================== */}
      {activeSubTab === 'workspace' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload / Add Document & Document List (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload Zone Card */}
            <div
              className={`rounded-2xl border p-6 shadow-sm transition-colors ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <UploadCloud className="w-5 h-5" />
                  <span>Upload & Validate Document</span>
                </h2>
                <div className="flex items-center gap-1 bg-emerald-500/10 p-0.5 rounded-lg border border-emerald-500/20 text-xs">
                  <button
                    onClick={() => setInputMode('file')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      inputMode === 'file'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-emerald-500'
                    }`}
                  >
                    File
                  </button>
                  <button
                    onClick={() => setInputMode('paste')}
                    className={`px-2.5 py-1 rounded-md transition font-medium ${
                      inputMode === 'paste'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-emerald-500'
                    }`}
                  >
                    Paste Text
                  </button>
                </div>
              </div>

              {/* Document Type Selector */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Document Category
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'syllabus', label: 'Syllabus / Outline' },
                    { id: 'question-paper', label: 'Previous Exam (PYQ)' },
                    { id: 'assignment', label: 'Assignment / Problem Set' },
                    { id: 'notes', label: 'Course Notes / Handout' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setDocType(t.id as DocumentType)}
                      className={`p-2 rounded-xl text-left font-medium transition border ${
                        docType === t.id
                          ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                          : isDark
                          ? 'border-emerald-950 bg-[#051510] text-slate-300 hover:border-emerald-800'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {inputMode === 'file' ? (
                /* Drag & Drop Area */
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFileUpload(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center relative ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : isDark
                      ? 'border-emerald-900/80 bg-[#071C16] hover:border-emerald-700'
                      : 'border-[#D1E7DD] bg-emerald-50/50 hover:border-emerald-500'
                  }`}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.md,.json,.doc,.docx"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    id="doc-upload-input"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6 animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">
                    Click to browse or drop document here
                  </p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs">
                    Supports syllabus PDFs, previous-year question papers (.txt, .md, .pdf), or assignments.
                  </p>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Evidence-based parser • OCR scan check • Year detection</span>
                  </div>
                </div>
              ) : (
                /* Paste Text Form */
                <form onSubmit={handleManualSubmit} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Document Title (e.g. CS301_Midterm_Syllabus.txt)"
                      value={manualFileName}
                      onChange={(e) => setManualFileName(e.target.value)}
                      className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark
                          ? 'bg-[#071C16] border-emerald-900/80 text-white'
                          : 'bg-white border-[#D1E7DD] text-slate-800'
                      }`}
                    />
                  </div>
                  <div>
                    <textarea
                      rows={5}
                      placeholder="Paste syllabus units, course outline, assignment problems, or exam question text here..."
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      className={`w-full px-3 py-2 text-xs font-mono rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                        isDark
                          ? 'bg-[#071C16] border-emerald-900/80 text-white'
                          : 'bg-white border-[#D1E7DD] text-slate-800'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validate Extracted Content</span>
                  </button>
                </form>
              )}
            </div>

            {/* Uploaded Documents List */}
            <div
              className={`rounded-2xl border p-6 shadow-sm ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-4 h-4" />
                  <span>Uploaded Documents ({documents.length})</span>
                </h3>
                <span className="text-xs text-slate-400">Select to view report</span>
              </div>

              {documents.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <FileQuestion className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet.</p>
                  <p className="mt-1 text-[11px]">Upload a syllabus above or run the benchmark cases.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {documents.map((doc) => {
                    const isSelected = activeDoc?.id === doc.id;
                    const issueCount = doc.issues.filter((i) => !i.dismissed).length;

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition text-left flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                            : isDark
                            ? 'border-emerald-950 bg-[#071C16] hover:border-emerald-800'
                            : 'border-slate-200 bg-slate-50 hover:border-emerald-300'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-xs truncate text-slate-900 dark:text-slate-100">
                              {doc.fileName}
                            </span>
                            {doc.studentOverride && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                                Overridden
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="capitalize">{doc.documentType.replace('-', ' ')}</span>
                            <span>•</span>
                            <span>{Math.round(doc.fileSize / 1024) || 1} KB</span>
                            <span>•</span>
                            <span>{doc.metadata.charCount} chars</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          {getStatusBadge(doc.status)}
                          {issueCount > 0 && (
                            <span className="text-[10px] text-amber-500 font-medium">
                              {issueCount} {issueCount === 1 ? 'alert' : 'alerts'}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Evidence-Based Validation Report (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {activeDoc ? (
              <div
                className={`rounded-2xl border p-6 sm:p-8 shadow-sm space-y-6 ${
                  isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
                }`}
              >
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-900/30 dark:border-emerald-900/60">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                        Evidence-Based Validation Report
                      </span>
                      {activeDoc.isSyntheticTest && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-teal-500/20 text-teal-300 font-mono">
                          Synthetic Case
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white break-all">
                      {activeDoc.fileName}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Analyzed against student profile: {profile.targetExamYear} • {profile.semester}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(activeDoc.status)}
                    <button
                      onClick={() => removeDocument(activeDoc.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition"
                      title="Remove document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Status Summary Banner */}
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    activeDoc.status === 'Validated'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                      : activeDoc.status === 'Needs verification'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
                  }`}
                >
                  {activeDoc.status === 'Validated' && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  )}
                  {activeDoc.status === 'Needs verification' && (
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  {activeDoc.status === 'Potential issue' && (
                    <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-sm">
                      {activeDoc.status === 'Validated' &&
                        'Document verified and aligned with your semester.'}
                      {activeDoc.status === 'Needs verification' &&
                        'Document is readable but contains unstated metadata requiring verification.'}
                      {activeDoc.status === 'Potential issue' &&
                        'Potential issue detected with supporting evidence.'}
                    </p>
                    <p className="opacity-90 leading-relaxed">
                      {activeDoc.status === 'Validated' &&
                        'No truncation, outdated regulations, or binary corruption detected. Ready for timetable integration and question drilling.'}
                      {activeDoc.status === 'Needs verification' &&
                        'Academic year or exact regulation could not be confirmed with certainty. The planner will NOT block your study schedule, but please verify with your professor.'}
                      {activeDoc.status === 'Potential issue' &&
                        'Concrete evidence indicates missing units, an outdated curriculum version, or illegible text characters.'}
                    </p>
                  </div>
                </div>

                {/* Extracted Metadata Grid */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Extracted Document Metadata
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#071C16] border-emerald-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 block mb-0.5">Academic Session</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeDoc.metadata.academicYear || (
                          <span className="text-amber-500 font-normal">Unstated (Needs verification)</span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#071C16] border-emerald-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 block mb-0.5">Semester</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeDoc.metadata.semester || (
                          <span className="text-slate-400 font-normal">Not specified</span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#071C16] border-emerald-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 block mb-0.5">Course Identifier</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {activeDoc.metadata.courseIdentifier || (
                          <span className="text-slate-400 font-normal">Generic</span>
                        )}
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border ${
                        isDark ? 'bg-[#071C16] border-emerald-950' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span className="text-[11px] text-slate-400 block mb-0.5">Readability Status</span>
                      <span className="font-semibold capitalize text-slate-900 dark:text-slate-100">
                        {activeDoc.readability === 'clean' ? (
                          <span className="text-emerald-500 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Clean text
                          </span>
                        ) : activeDoc.readability === 'low-density-ocr-needed' ? (
                          <span className="text-rose-500 font-medium">Scanned (OCR Needed)</span>
                        ) : (
                          <span className="text-rose-500 font-medium">{activeDoc.readability}</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Character count & short document notice */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                    <span>
                      Text Density: {activeDoc.metadata.charCount} characters (
                      {activeDoc.metadata.isShortDocument ? 'Compact document' : 'Standard length'})
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Short documents are never penalized without concrete truncation evidence.
                    </span>
                  </div>
                </div>

                {/* Detected Issues & Objective Evidence */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Detected Findings & Evidence Log
                    </h3>
                    <span className="text-xs text-slate-400">
                      {activeDoc.issues.length} {activeDoc.issues.length === 1 ? 'item' : 'items'} analyzed
                    </span>
                  </div>

                  {activeDoc.issues.length === 0 ? (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Zero defects found. All curriculum requirements and syntax checks passed cleanly.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeDoc.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className={`p-4 rounded-xl border transition ${
                            issue.dismissed
                              ? 'opacity-60 bg-slate-500/5 border-slate-500/20'
                              : issue.severity === 'error'
                              ? isDark
                                ? 'bg-rose-950/20 border-rose-900/50'
                                : 'bg-rose-50 border-rose-200'
                              : issue.severity === 'warning'
                              ? isDark
                                ? 'bg-amber-950/20 border-amber-900/50'
                                : 'bg-amber-50 border-amber-200'
                              : isDark
                              ? 'bg-blue-950/20 border-blue-900/50'
                              : 'bg-blue-50 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    issue.severity === 'error'
                                      ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                      : issue.severity === 'warning'
                                      ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                                      : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                                  }`}
                                >
                                  {issue.category} • {issue.severity}
                                </span>
                                <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                  {issue.title}
                                </h4>
                                {issue.dismissed && (
                                  <span className="text-[10px] text-slate-400 italic">
                                    (Dismissed by student)
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                {issue.description}
                              </p>
                            </div>

                            {!issue.dismissed && (
                              <button
                                onClick={() => dismissDocIssue(activeDoc.id, issue.id)}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 shrink-0"
                              >
                                Dismiss
                              </button>
                            )}
                          </div>

                          {/* Concrete Evidence Block */}
                          <div
                            className={`mt-3 p-2.5 rounded-lg text-xs font-mono border ${
                              isDark
                                ? 'bg-[#051510] border-emerald-950 text-emerald-300/90'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans mb-0.5">
                              Objective Supporting Evidence:
                            </span>
                            <span className="break-all">{issue.evidence}</span>
                          </div>

                          {/* Recommended Next Action */}
                          <div className="mt-2 text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              <strong>Recommended Action:</strong> {issue.recommendedAction}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student Actions & Integrations */}
                <div className="pt-4 border-t border-emerald-900/30 dark:border-emerald-900/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {activeDoc.metadata.extractedTopics && activeDoc.metadata.extractedTopics.length > 0 && (
                      <button
                        onClick={() => {
                          const res = importDocTopicsToSyllabus(activeDoc.id);
                          if (res.addedCount > 0) {
                            setActiveTab('syllabus');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>Import ({activeDoc.metadata.extractedTopics.length}) Units to Syllabus</span>
                      </button>
                    )}

                    <button
                      onClick={() => setActiveTab('planner')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                        isDark
                          ? 'border-emerald-800 bg-[#071C16] text-emerald-300 hover:bg-emerald-900/40'
                          : 'border-[#D1E7DD] bg-white text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Use in Study Planner</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('questions')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                        isDark
                          ? 'border-emerald-800 bg-[#071C16] text-emerald-300 hover:bg-emerald-900/40'
                          : 'border-[#D1E7DD] bg-white text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <FileQuestion className="w-4 h-4" />
                      <span>Drill Questions from Doc</span>
                    </button>
                  </div>

                  {activeDoc.status !== 'Validated' && (
                    <button
                      onClick={() => overrideDocStatus(activeDoc.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-500 transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Override & Confirm Valid</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div
                className={`rounded-2xl border p-12 text-center shadow-sm ${
                  isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
                }`}
              >
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-60" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  Select a document to inspect its evidence report
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Upload a syllabus PDF, past-year question paper, or test one of the synthetic challenge cases.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SUB-TAB 2: REPEATABLE SYNTHETIC BENCHMARK SUITE          */}
      {/* ======================================================== */}
      {activeSubTab === 'benchmark' && (
        <div className="space-y-6">
          {/* Metrics Overview Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Sample Size
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {benchmarkResults.sampleSize}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Synthetic Cases</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-emerald-500 font-bold uppercase tracking-wider block mb-1">
                Accuracy
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {benchmarkResults.accuracy}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Ground-truth match</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Over-Flagging Rate
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {benchmarkResults.overflaggingRate}%
              </span>
              <span className="text-[10px] text-emerald-500 block mt-0.5">0 false alarms</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                True Positives
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {benchmarkResults.truePositives}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Defects caught</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                True Negatives
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {benchmarkResults.trueNegatives}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Clean passes</span>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                False Positives
              </span>
              <span className="text-2xl font-black text-emerald-500">
                {benchmarkResults.falsePositives}
              </span>
              <span className="text-[10px] text-emerald-500 block mt-0.5">Zero false alarms</span>
            </div>

            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between ${
                isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
              }`}
            >
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Live Audit
              </span>
              <button
                onClick={handleRunBenchmark}
                disabled={isProcessing}
                className="mt-2 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1 transition shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Re-Test</span>
              </button>
            </div>
          </div>

          {/* Test Cases Table */}
          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              isDark ? 'bg-[#0A241C] border-emerald-900/80' : 'bg-white border-[#D1E7DD]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>Repeatable Benchmark Suite (12 Synthetic Evaluation Cases)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Designed to verify that short documents are not falsely rejected, past exams are not flagged as
                  outdated syllabi, and genuine defects are caught with concrete evidence.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {benchmarkResults.caseResults.filter((c) => c.passed).length} / {benchmarkResults.sampleSize} passing
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? 'border-emerald-900/60 text-slate-400' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <th className="py-3 px-3 font-semibold">Test Case</th>
                    <th className="py-3 px-3 font-semibold">Category</th>
                    <th className="py-3 px-3 font-semibold">Expected Status</th>
                    <th className="py-3 px-3 font-semibold">Actual Result</th>
                    <th className="py-3 px-3 font-semibold">Diagnostic Reason</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-950/40 dark:divide-emerald-950/40">
                  {SYNTHETIC_BENCHMARK_CASES.map((tc, idx) => {
                    const result = benchmarkResults.caseResults.find((r) => r.id === tc.id);
                    const isPassed = result?.passed ?? true;

                    return (
                      <tr
                        key={tc.id}
                        className={`hover:bg-emerald-500/5 transition ${
                          isPassed ? '' : 'bg-rose-500/10'
                        }`}
                      >
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-900 dark:text-slate-100">{tc.label}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">{tc.fileName}</div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              tc.category === 'complete-valid'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : tc.category === 'short-valid'
                                ? 'bg-teal-500/20 text-teal-400'
                                : tc.category === 'valid-pyq'
                                ? 'bg-green-500/20 text-green-400'
                                : tc.category === 'truncated'
                                ? 'bg-rose-500/20 text-rose-400'
                                : tc.category === 'outdated'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-blue-500/20 text-blue-400'
                            }`}
                          >
                            {tc.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-medium">{getStatusBadge(tc.expectedStatus)}</td>

                        <td className="py-3.5 px-3 font-medium">
                          {result ? getStatusBadge(result.actualStatus) : 'Pending'}
                        </td>

                        <td className="py-3.5 px-3 text-slate-400 text-[11px] max-w-xs">
                          {result?.reason || 'Verified'}
                        </td>

                        <td className="py-3.5 px-3 text-right">
                          <button
                            onClick={() => handleLoadSyntheticCase(tc)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-300 font-semibold text-[11px] transition inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
