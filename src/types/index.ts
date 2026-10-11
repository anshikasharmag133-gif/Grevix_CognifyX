export type TopicStatus = 'not-started' | 'in-progress' | 'completed';
export type TopicPriority = 'high' | 'medium' | 'low';
export type TopicDifficulty = 'easy' | 'moderate' | 'difficult';

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  moduleOrUnit: string;
  priority: TopicPriority;
  status: TopicStatus;
  difficulty: TopicDifficulty;
  estimatedHours: number;
  completedHours: number;
  notes?: string;
  lastRevisedDate?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind color accent e.g. 'emerald', 'teal', 'green', 'mint'
  examDate: string; // YYYY-MM-DD
  targetGrade?: string; // e.g. 'A+', '90%+'
  description?: string;
  topics: Topic[];
}

export type TaskType = 'study' | 'practice' | 'revision' | 'exam-prep';

export interface StudyTask {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  topicId?: string;
  title: string;
  timeSlot: string; // e.g. "09:00 - 10:30"
  durationMinutes: number;
  type: TaskType;
  completed: boolean;
  completedAt?: string;
  isWeakTopic?: boolean;
  notes?: string;
}

export type QuestionType = '2-mark' | '5-mark' | '10-mark' | 'mcq' | 'flashcard' | 'short';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface PracticeQuestion {
  id: string;
  subjectId: string;
  topic: string;
  questionType: QuestionType;
  marks: number;
  difficulty: DifficultyLevel;
  questionText: string;
  options?: string[]; // for MCQs
  correctAnswer: string;
  explanation: string;
  studentAnswer?: string;
  isAnswerRevealed?: boolean;
  studentSelfEvaluation?: 'correct' | 'partially-correct' | 'needs-review';
  isUserSourceMaterial?: boolean;
}

export type FlashcardMastery = 'unlearned' | 'need-practice' | 'mastered';

export interface Flashcard {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  answer: string;
  keyPoints?: string[];
  mastery: FlashcardMastery;
  lastReviewed?: string;
}

export interface PlanSession {
  id: string;
  timeSlot: string;
  subject: string;
  topic: string;
  type: 'Deep Study' | 'Practice Questions' | 'Active Recall' | 'Exam Revision';
  durationMinutes: number;
  objective: string;
  isWeakTopic?: boolean;
  completed?: boolean;
}

export interface DayPlan {
  day: string;
  dateLabel: string;
  focusTheme: string;
  totalHours: number;
  sessions: PlanSession[];
}

export interface StudyPlanConfig {
  subjects: string[];
  dailyHours: number;
  preparationLevel: 'beginner' | 'intermediate' | 'revision';
  weakTopics: string[];
  examDates: Record<string, string>;
  targetScore: string;
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface StudySessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  subjectId: string;
  minutesSpent: number;
  completedTasks: number;
}

export interface StudentProfile {
  name: string;
  college: string;
  degree: string;
  semester: string;
  targetExamYear: string;
  studyStreak: number;
  weeklyGoalHours: number;
}

// ==========================================
// GREVIX CHALLENGE CARD 1: DOCUMENT VALIDATION TYPES
// ==========================================

export type DocumentType = 'syllabus' | 'question-paper' | 'assignment' | 'notes';
export type ValidationStatus = 'Validated' | 'Needs verification' | 'Potential issue';
export type ReadabilityStatus = 'clean' | 'low-density-ocr-needed' | 'unreadable-empty' | 'parsing-failed';

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'outdated' | 'incomplete' | 'readability' | 'metadata' | 'format';
  title: string;
  description: string;
  evidence: string; // Verbatim snippet or objective metric
  recommendedAction: string;
  dismissed?: boolean;
}

export interface DocumentMetadata {
  academicYear?: string;
  semester?: string;
  courseIdentifier?: string;
  documentDate?: string;
  syllabusVersion?: string;
  extractedTopics?: string[];
  pageCountEstimated?: number;
  charCount: number;
  isShortDocument?: boolean;
}

export interface ValidatedDocument {
  id: string;
  fileName: string;
  fileSize: number;
  documentType: DocumentType;
  uploadTimestamp: string;
  status: ValidationStatus;
  readability: ReadabilityStatus;
  readabilityDetails: string;
  metadata: DocumentMetadata;
  issues: ValidationIssue[];
  extractedContent: string;
  isSyntheticTest?: boolean;
  studentOverride?: boolean;
}

export interface BenchmarkCase {
  id: string;
  label: string;
  documentType: DocumentType;
  category: 'complete-valid' | 'short-valid' | 'truncated' | 'outdated' | 'uncertain-no-date' | 'unreadable' | 'valid-pyq';
  text: string;
  fileName: string;
  expectedStatus: ValidationStatus;
  expectedIssueCategory?: 'outdated' | 'incomplete' | 'readability' | 'metadata';
}

export interface BenchmarkResults {
  sampleSize: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  accuracy: number;
  overflaggingRate: number;
  caseResults: {
    id: string;
    label: string;
    passed: boolean;
    actualStatus: ValidationStatus;
    expectedStatus: ValidationStatus;
    reason: string;
  }[];
}
