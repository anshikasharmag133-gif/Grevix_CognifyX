import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Subject,
  Topic,
  StudyTask,
  Flashcard,
  PracticeQuestion,
  DayPlan,
  StudentProfile,
  StudyPlanConfig,
  FlashcardMastery,
  ValidatedDocument,
} from '../types';
import {
  initialProfile,
  initialSubjects,
  initialTodayTasks,
  initialFlashcards,
  initialQuestions,
  initial7DayPlan,
  initialDocuments,
} from '../data/seedData';

interface StudyContextType {
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  subjects: Subject[];
  todayTasks: StudyTask[];
  flashcards: Flashcard[];
  questions: PracticeQuestion[];
  planDays: DayPlan[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Focus Timer
  isFocusTimerOpen: boolean;
  setIsFocusTimerOpen: (open: boolean) => void;
  currentFocusTopic: string | null;
  setCurrentFocusTopic: (topic: string | null) => void;
  // Subject & Topic actions
  addSubject: (subject: Subject) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (subjectId: string) => void;
  addTopic: (subjectId: string, topic: Omit<Topic, 'id' | 'subjectId'>) => void;
  updateTopic: (subjectId: string, topicId: string, updates: Partial<Topic>) => void;
  deleteTopic: (subjectId: string, topicId: string) => void;
  // Today's Task actions
  toggleTaskComplete: (taskId: string) => void;
  addTask: (task: Omit<StudyTask, 'id'>) => void;
  deleteTask: (taskId: string) => void;
  // Flashcard actions
  updateFlashcardMastery: (cardId: string, mastery: FlashcardMastery) => void;
  addFlashcard: (card: Omit<Flashcard, 'id'>) => void;
  deleteFlashcard: (cardId: string) => void;
  // Question bank actions
  addQuestion: (question: Omit<PracticeQuestion, 'id'>) => void;
  updateQuestion: (questionId: string, updates: Partial<PracticeQuestion>) => void;
  // Plan actions
  setPlanDays: React.Dispatch<React.SetStateAction<DayPlan[]>>;
  togglePlanSessionComplete: (dayIndex: number, sessionId: string) => void;
  // GREVIX Challenge Card 1: Document Validation
  documents: ValidatedDocument[];
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  addDocument: (doc: ValidatedDocument) => void;
  removeDocument: (docId: string) => void;
  dismissDocIssue: (docId: string, issueId: string) => void;
  overrideDocStatus: (docId: string, status?: 'Validated') => void;
  importDocTopicsToSyllabus: (docId: string, targetSubjectId?: string) => { addedCount: number; subjectName: string };
  // Storage & Reset
  resetToSampleData: () => void;
  clearAllData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonStr: string) => { success: boolean; message: string };
  recordStudySession: (subjectId: string, minutes: number) => void;
  totalStudyMinutesToday: number;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toast: ToastNotification | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'cognifyx_profile_v2',
  SUBJECTS: 'cognifyx_subjects_v2',
  TASKS: 'cognifyx_tasks_v2',
  FLASHCARDS: 'cognifyx_flashcards_v2',
  QUESTIONS: 'cognifyx_questions_v2',
  PLAN: 'cognifyx_plan_v2',
  MINUTES_TODAY: 'cognifyx_minutes_today_v2',
  DOCUMENTS: 'cognifyx_documents_v2',
};

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialProfile;
    } catch {
      return initialProfile;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [todayTasks, setTodayTasks] = useState<StudyTask[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTodayTasks;
    } catch {
      return initialTodayTasks;
    }
  });

  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
      return saved ? JSON.parse(saved) : initialFlashcards;
    } catch {
      return initialFlashcards;
    }
  });

  const [questions, setQuestions] = useState<PracticeQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : initialQuestions;
    } catch {
      return initialQuestions;
    }
  });

  const [planDays, setPlanDays] = useState<DayPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
      return saved ? JSON.parse(saved) : initial7DayPlan;
    } catch {
      return initial7DayPlan;
    }
  });

  const [totalStudyMinutesToday, setTotalStudyMinutesToday] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MINUTES_TODAY);
      return saved ? JSON.parse(saved) : 105; // 105 mins from completed morning session
    } catch {
      return 105;
    }
  });

  const [documents, setDocuments] = useState<ValidatedDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    return initialDocuments[0]?.id || null;
  });

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState<boolean>(false);
  const [currentFocusTopic, setCurrentFocusTopic] = useState<string | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('cognifyx_theme_v2');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cognifyx_theme_v2', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.warn('Theme storage error:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [toast, setToast] = useState<ToastNotification | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}`;
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 4500);
  };

  const hideToast = () => {
    setToast(null);
  };

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(todayTasks));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [todayTasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(flashcards));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [flashcards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(planDays));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [planDays]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MINUTES_TODAY, JSON.stringify(totalStudyMinutesToday));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [totalStudyMinutesToday]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [documents]);

  // Subject actions
  const addSubject = (subject: Subject) => {
    setSubjects((prev) => [...prev, subject]);
  };

  const updateSubject = (updated: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const deleteSubject = (subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  const addTopic = (subjectId: string, topicData: Omit<Topic, 'id' | 'subjectId'>) => {
    const newTopic: Topic = {
      ...topicData,
      id: `top-${Date.now()}`,
      subjectId,
    };
    setSubjects((prev) =>
      prev.map((s) => (s.id === subjectId ? { ...s, topics: [...s.topics, newTopic] } : s))
    );
  };

  const updateTopic = (subjectId: string, topicId: string, updates: Partial<Topic>) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
        };
      })
    );
  };

  const deleteTopic = (subjectId: string, topicId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s;
        return {
          ...s,
          topics: s.topics.filter((t) => t.id !== topicId),
        };
      })
    );
  };

  // Task actions
  const toggleTaskComplete = (taskId: string) => {
    setTodayTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const newCompleted = !t.completed;
        if (newCompleted) {
          setTotalStudyMinutesToday((mins) => mins + t.durationMinutes);
        } else {
          setTotalStudyMinutesToday((mins) => Math.max(0, mins - t.durationMinutes));
        }
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : undefined,
        };
      })
    );
  };

  const addTask = (taskData: Omit<StudyTask, 'id'>) => {
    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTodayTasks((prev) => [...prev, newTask]);
  };

  const deleteTask = (taskId: string) => {
    setTodayTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Flashcard actions
  const updateFlashcardMastery = (cardId: string, mastery: FlashcardMastery) => {
    setFlashcards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              mastery,
              lastReviewed: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );
  };

  const addFlashcard = (cardData: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = {
      ...cardData,
      id: `fc-${Date.now()}`,
    };
    setFlashcards((prev) => [newCard, ...prev]);
  };

  const deleteFlashcard = (cardId: string) => {
    setFlashcards((prev) => prev.filter((c) => c.id !== cardId));
  };

  // Questions actions
  const addQuestion = (questionData: Omit<PracticeQuestion, 'id'>) => {
    const newQuestion: PracticeQuestion = {
      ...questionData,
      id: `q-${Date.now()}`,
    };
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const updateQuestion = (questionId: string, updates: Partial<PracticeQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  // Plan Session Toggle
  const togglePlanSessionComplete = (dayIndex: number, sessionId: string) => {
    setPlanDays((prev) => {
      const copy = [...prev];
      if (!copy[dayIndex]) return prev;
      const day = { ...copy[dayIndex] };
      day.sessions = day.sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const willComplete = !s.completed;
        if (willComplete) {
          setTotalStudyMinutesToday((m) => m + s.durationMinutes);
        }
        return { ...s, completed: willComplete };
      });
      copy[dayIndex] = day;
      return copy;
    });
  };

  // Log study session from Focus Pomodoro timer
  const recordStudySession = (_subjectId: string, minutes: number) => {
    setTotalStudyMinutesToday((prev) => prev + minutes);
  };

  // GREVIX Challenge Card 1: Document Validation Actions
  const addDocument = (doc: ValidatedDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    setSelectedDocId(doc.id);
    const toastType = doc.status === 'Potential issue' ? 'error' : doc.status === 'Needs verification' ? 'info' : 'success';
    showToast(`Analyzed "${doc.fileName}" (${doc.status})`, toastType);
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== docId);
      if (selectedDocId === docId) {
        setSelectedDocId(remaining[0]?.id || null);
      }
      return remaining;
    });
    showToast('Document removed from workspace', 'info');
  };

  const dismissDocIssue = (docId: string, issueId: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;
        const updatedIssues = doc.issues.map((iss) =>
          iss.id === issueId ? { ...iss, dismissed: true } : iss
        );

        const activeErrors = updatedIssues.filter((i) => !i.dismissed && i.severity === 'error');
        const activeWarnings = updatedIssues.filter((i) => !i.dismissed && i.severity === 'warning');
        const activeInfo = updatedIssues.filter((i) => !i.dismissed && i.severity === 'info');

        let newStatus = doc.status;
        if (activeErrors.length === 0 && activeWarnings.length === 0 && activeInfo.length === 0) {
          newStatus = 'Validated';
        } else if (activeErrors.length === 0) {
          newStatus = 'Needs verification';
        }

        return {
          ...doc,
          issues: updatedIssues,
          status: newStatus,
        };
      })
    );
    showToast('Validation warning dismissed', 'info');
  };

  const overrideDocStatus = (docId: string, status: 'Validated' = 'Validated') => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, status, studentOverride: true } : doc
      )
    );
    showToast('Document verified and confirmed for study planning', 'success');
  };

  const importDocTopicsToSyllabus = (docId: string, targetSubjectId?: string) => {
    const doc = documents.find((d) => d.id === docId);
    if (!doc) return { addedCount: 0, subjectName: '' };

    let topicTitles: string[] = [];
    if (doc.metadata.extractedTopics && doc.metadata.extractedTopics.length > 0) {
      topicTitles = doc.metadata.extractedTopics;
    } else {
      const lines = doc.extractedContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (/^(?:Unit|Module|Chapter|[0-9]+\.)\s+/i.test(trimmed) && trimmed.length > 5 && trimmed.length < 120) {
          topicTitles.push(trimmed);
        }
      }
    }

    if (topicTitles.length === 0) {
      showToast('No syllabus modules could be automatically extracted from this document.', 'error');
      return { addedCount: 0, subjectName: '' };
    }

    let targetSubject = subjects.find((s) => s.id === targetSubjectId);
    if (!targetSubject && doc.metadata.courseIdentifier) {
      targetSubject = subjects.find(
        (s) =>
          s.code.toLowerCase().includes(doc.metadata.courseIdentifier!.toLowerCase()) ||
          s.name.toLowerCase().includes(doc.metadata.courseIdentifier!.toLowerCase())
      );
    }
    if (!targetSubject && subjects.length > 0) {
      targetSubject = subjects[0];
    }

    let finalSubjectName = targetSubject ? targetSubject.name : 'Imported Course';

    if (!targetSubject) {
      const newSubId = `sub-${Date.now()}`;
      const newSubject: Subject = {
        id: newSubId,
        name: doc.fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
        code: doc.metadata.courseIdentifier || 'IMP-101',
        color: 'emerald',
        examDate: '2026-11-25',
        targetGrade: 'A',
        topics: topicTitles.map((title, idx) => ({
          id: `top-imp-${Date.now()}-${idx}`,
          subjectId: newSubId,
          title: title.replace(/^Unit\s*[0-9IVX]+:\s*/i, ''),
          moduleOrUnit: title.match(/^Unit\s*[0-9IVX]+/i)?.[0] || `Unit ${idx + 1}`,
          priority: 'high',
          status: 'not-started',
          difficulty: 'moderate',
          estimatedHours: 4,
          completedHours: 0,
        })),
      };
      setSubjects((prev) => [...prev, newSubject]);
      finalSubjectName = newSubject.name;
    } else {
      const newTopics: Topic[] = topicTitles.map((title, idx) => ({
        id: `top-imp-${Date.now()}-${idx}`,
        subjectId: targetSubject!.id,
        title: title.replace(/^Unit\s*[0-9IVX]+:\s*/i, ''),
        moduleOrUnit: title.match(/^Unit\s*[0-9IVX]+/i)?.[0] || `Unit ${idx + 1}`,
        priority: 'high',
        status: 'not-started',
        difficulty: 'moderate',
        estimatedHours: 4,
        completedHours: 0,
      }));
      setSubjects((prev) =>
        prev.map((s) => (s.id === targetSubject!.id ? { ...s, topics: [...s.topics, ...newTopics] } : s))
      );
    }

    showToast(`Successfully added ${topicTitles.length} topics into "${finalSubjectName}"!`, 'success');
    return { addedCount: topicTitles.length, subjectName: finalSubjectName };
  };

  // Reset to realistic demo data
  const resetToSampleData = () => {
    setProfile(initialProfile);
    setSubjects(initialSubjects);
    setTodayTasks(initialTodayTasks);
    setFlashcards(initialFlashcards);
    setQuestions(initialQuestions);
    setPlanDays(initial7DayPlan);
    setDocuments(initialDocuments);
    setSelectedDocId(initialDocuments[0]?.id || null);
    setTotalStudyMinutesToday(105);
  };

  // Clear data for blank slate
  const clearAllData = () => {
    setSubjects([]);
    setTodayTasks([]);
    setFlashcards([]);
    setQuestions([]);
    setPlanDays([]);
    setDocuments([]);
    setSelectedDocId(null);
    setTotalStudyMinutesToday(0);
  };

  // Export JSON
  const exportDataJSON = () => {
    const data = {
      profile,
      subjects,
      todayTasks,
      flashcards,
      questions,
      planDays,
      documents,
      totalStudyMinutesToday,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  };

  // Safe import JSON with clear file detection
  const importDataJSON = (jsonStr: string): { success: boolean; message: string } => {
    if (!jsonStr || typeof jsonStr !== 'string') {
      return { success: false, message: 'The uploaded file is empty.' };
    }

    const trimmed = jsonStr.trim();
    if (trimmed.startsWith('%PDF')) {
      return {
        success: false,
        message:
          'The uploaded file is a PDF document, not a CognifyX JSON backup file. To analyze syllabus notes or question papers, use the Document Validator tab.',
      };
    }

    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      return {
        success: false,
        message: 'The file is not a valid JSON document. Please select a .json backup file.',
      };
    }

    try {
      const data = JSON.parse(trimmed);
      if (typeof data !== 'object' || data === null) {
        return { success: false, message: 'Invalid backup file structure.' };
      }
      if (data.subjects && Array.isArray(data.subjects)) setSubjects(data.subjects);
      if (data.todayTasks && Array.isArray(data.todayTasks)) setTodayTasks(data.todayTasks);
      if (data.flashcards && Array.isArray(data.flashcards)) setFlashcards(data.flashcards);
      if (data.questions && Array.isArray(data.questions)) setQuestions(data.questions);
      if (data.planDays && Array.isArray(data.planDays)) setPlanDays(data.planDays);
      if (data.documents && Array.isArray(data.documents)) setDocuments(data.documents);
      if (data.profile) setProfile(data.profile);
      if (typeof data.totalStudyMinutesToday === 'number') {
        setTotalStudyMinutesToday(data.totalStudyMinutesToday);
      }
      return { success: true, message: 'Study plan and subjects successfully restored!' };
    } catch {
      return {
        success: false,
        message: 'Could not parse JSON. The file might be corrupted or in an incompatible format.',
      };
    }
  };

  return (
    <StudyContext.Provider
      value={{
        profile,
        setProfile,
        subjects,
        todayTasks,
        flashcards,
        questions,
        planDays,
        documents,
        selectedDocId,
        setSelectedDocId,
        addDocument,
        removeDocument,
        dismissDocIssue,
        overrideDocStatus,
        importDocTopicsToSyllabus,
        activeTab,
        setActiveTab,
        isFocusTimerOpen,
        setIsFocusTimerOpen,
        currentFocusTopic,
        setCurrentFocusTopic,
        addSubject,
        updateSubject,
        deleteSubject,
        addTopic,
        updateTopic,
        deleteTopic,
        toggleTaskComplete,
        addTask,
        deleteTask,
        updateFlashcardMastery,
        addFlashcard,
        deleteFlashcard,
        addQuestion,
        updateQuestion,
        setPlanDays,
        togglePlanSessionComplete,
        resetToSampleData,
        clearAllData,
        exportDataJSON,
        importDataJSON,
        recordStudySession,
        totalStudyMinutesToday,
        theme,
        toggleTheme,
        toast,
        showToast,
        hideToast,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
