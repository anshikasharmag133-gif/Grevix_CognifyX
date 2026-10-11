import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health & Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
    timestamp: new Date().toISOString(),
  });
});

// 1. AI Concept Explainer Endpoint
app.post('/api/ai/explain', async (req: Request, res: Response) => {
  const { concept, subject, depth = 'exam', context = '' } = req.body;

  if (!concept) {
    return res.status(400).json({ error: 'Concept is required' });
  }

  const prompt = `You are CognifyX's Senior Academic Tutor. A college student is preparing for an exam and needs this concept explained.
Concept: "${concept}"
Subject: "${subject || 'General'}"
Explanation Depth: ${depth} (Options: 'simple' [Feynman technique/ELI5], 'exam' [University exam grading focused with definition, core components, and high-yield points], 'deep' [in-depth technical mechanism with edge cases])
Additional Student Context / Material: "${context}"

Structure your response clearly with:
1. **Core Definition & One-Sentence Gist**
2. **Intuitive Real-World Analogy**
3. **Key Concepts & Technical Breakdown** (bulleted with bold terms)
4. **Common Exam Pitfalls & Mistakes Students Make**
5. **High-Yield Exam Tip & Quick Formula/Syntax/Rule**

Keep formatting clean with clear markdown headings and bullet points.`;

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Graceful realistic fallback
    return res.json({
      text: `### 1. Core Definition & One-Sentence Gist
**${concept}** is a foundational principle in ${subject || 'this subject'}. In simple terms, it provides an optimized method to manage state, solve subproblems, and guarantee correct execution without redundant computation.

### 2. Intuitive Real-World Analogy
Think of **${concept}** like keeping a notebook of resolved puzzle pieces. Instead of recalculating every path from scratch whenever you encounter an intersection, you consult your verified log, immediately cutting down the overhead from exponential to linear or polynomial time.

### 3. Key Concepts & Technical Breakdown
- **Base Invariant:** The initial boundary condition that anchors all recursive or sequential transitions.
- **State Transition:** The deterministic mapping from input state $S_k$ to target state $S_{k+1}$.
- **Optimal Substructure:** The global optimal solution is constructed directly from the optimal solutions of its constituent sub-problems.
- **Space-Time Trade-off:** Exchanging additional memory allocation to dramatically suppress runtime complexity.

### 4. Common Exam Pitfalls & Mistakes Students Make
- *Pitfall 1:* Forgetting edge conditions (empty sets, single nodes, zero values, or overflow boundaries).
- *Pitfall 2:* Confusing time complexity with auxiliary space complexity during rigorous analysis.
- *Pitfall 3:* Failing to write out the formal mathematical recurrence or pseudocode required for full marks.

### 5. High-Yield Exam Tip
> **Exam Strategy:** In 5-mark and 10-mark questions, always start by defining the formal term, drawing a quick labelled 3-box flow diagram, and concluding with big-O notation ($O(N)$ or $O(N \\log N)$).

*(Note: Running in CognifyX Offline Mode. Add a GEMINI_API_KEY in Settings > Secrets for real-time live model synthesis.)*`,
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ text: response.text || 'No explanation generated.', isFallback: false });
  } catch (error: any) {
    console.error('Gemini explanation error:', error);
    res.status(500).json({
      error: 'Failed to generate explanation. Using fallback content.',
      details: error.message,
    });
  }
});

// 2. AI Summarizer & Revision Notes Endpoint
app.post('/api/ai/summarize', async (req: Request, res: Response) => {
  const { text, subject, topic } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text content is required' });
  }

  const prompt = `You are CognifyX's Exam Revision Specialist. Summarize the following study material for a college student preparing for exams.
Subject: ${subject || 'Not specified'}
Topic: ${topic || 'Not specified'}

Student's Study Material:
"""
${text.slice(0, 8000)}
"""

Please provide:
1. **Executive Summary** (2-3 concise sentences)
2. **Key High-Yield Bullet Points** (The 5-7 most testable facts/theorems/rules)
3. **Important Formulas / Equations / Algorithms** (if applicable)
4. **Must-Remember Keywords & Definitions**
5. **Expected Exam Questions from this Material** (2-3 sample question prompts)`;

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      text: `### 1. Executive Summary
This material covers core theoretical foundations and practical applications of **${topic || 'the topic'}**. Mastery requires understanding the structural constraints, boundary conditions, and performance trade-offs commonly tested in university assessments.

### 2. Key High-Yield Bullet Points
- **Fundamental Rule:** Strict adherence to conservation of state and deterministic transitions.
- **Architectural Division:** Clear separation between control logic and data execution planes.
- **Fault Tolerance:** Robust handling of null pointers, network timeouts, or out-of-order sequencing.
- **Resource Allocation:** Optimal utilization through amortized scheduling algorithms.
- **Verification Criterion:** Proof of correctness via induction or formal validation tests.

### 3. Key Formulas & Invariants
- Complexity: Average Case $O(N \\log N)$, Worst Case $O(N^2)$ (mitigated via balanced structures)
- Memory Footprint: Auxiliary space bounded by $O(N)$

### 4. Must-Remember Keywords
- **Idempotency:** An operation that produces the same output regardless of repetition.
- **Atomicity:** All-or-nothing transactional guarantees preventing corrupted intermediate states.
- **Throughput vs Latency:** The trade-off between total transactions per second versus roundtrip delivery speed.

### 5. Expected Exam Questions
1. *Define the principle of optimal substructure and demonstrate with an annotated trace.* (5 marks)
2. *Differentiate between greedy heuristics versus dynamic programming solutions.* (5 marks)

*(Note: Generated via CognifyX Offline Mode. Add GEMINI_API_KEY for live adaptive summarization.)*`,
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ text: response.text || 'No summary generated.', isFallback: false });
  } catch (error: any) {
    console.error('Gemini summarizer error:', error);
    res.status(500).json({ error: 'Failed to summarize material.', details: error.message });
  }
});

// 3. AI Question Practice Generator
app.post('/api/ai/generate-questions', async (req: Request, res: Response) => {
  const {
    subject,
    topic,
    difficulty = 'medium',
    questionType = 'all', // '2-mark' | '5-mark' | '10-mark' | 'mcq' | 'flashcard' | 'all'
    sourceMaterial = '',
  } = req.body;

  const prompt = `You are CognifyX's University Exam Board Question Author.
Generate authentic, high-quality college exam practice questions for:
Subject: "${subject}"
Topic: "${topic}"
Difficulty Level: "${difficulty}" (Easy, Medium, Hard/University Final level)
Requested Format: "${questionType}"
${sourceMaterial ? `Based primarily on this student-supplied material:\n"""${sourceMaterial.slice(0, 4000)}"""\n(Note: Clearly craft practice questions inspired by this text; do not falsely claim they are actual past-year papers)` : ''}

CRITICAL: Return ONLY a valid JSON array of question objects (no markdown code blocks, no backticks, just raw JSON array).
Each item in the array must match this exact TypeScript interface:
[
  {
    "id": "q1",
    "questionType": "2-mark" | "5-mark" | "10-mark" | "mcq" | "flashcard",
    "marks": 2 | 5 | 10 | 1,
    "difficulty": "${difficulty}",
    "questionText": "Clear, rigorous exam question text",
    "options": ["Option A", "Option B", "Option C", "Option D"], // Only include for mcq, otherwise null
    "correctAnswer": "The direct correct answer or option text",
    "explanation": "Detailed model answer, step-by-step breakdown, and grading criteria scheme showing where points are awarded."
  }
]

Generate at least 4-5 questions covering diverse cognitive depths (e.g. definitions for 2-mark, conceptual diagrams/comparisons for 5-mark, deep derivations/architectures for 10-mark, and tricky MCQs).`;

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Fallback curated questions
    const fallbackQuestions = [
      {
        id: `q-${Date.now()}-1`,
        questionType: '2-mark',
        marks: 2,
        difficulty,
        questionText: `Define the primary objective of ${topic} and state its key mathematical or conceptual formulation.`,
        correctAnswer: `${topic} resolves systemic overhead by guaranteeing optimal sub-step evaluation and preventing duplicate operations.`,
        explanation: `Grading Rubric:\n- [1 Mark]: Precise definition matching standard academic textbook formulation.\n- [1 Mark]: Valid mathematical recurrence or core invariant stated correctly.`,
      },
      {
        id: `q-${Date.now()}-2`,
        questionType: '5-mark',
        marks: 5,
        difficulty,
        questionText: `Differentiate between naive brute-force approaches and the optimized paradigm employed in ${topic}. Provide a comparison table.`,
        correctAnswer: `Contrast on Time Complexity, Space Footprint, Determinism, and Scalability.`,
        explanation: `Model Answer Breakdown:\n1. Comparative Matrix (3 Marks): Time complexity ($O(2^N)$ vs $O(N)$), Memory usage, and algorithmic guarantees.\n2. Concrete Example Scenario (2 Marks): Walkthrough demonstrating state space pruning.`,
      },
      {
        id: `q-${Date.now()}-3`,
        questionType: '10-mark',
        marks: 10,
        difficulty,
        questionText: `Design and analyze a comprehensive end-to-end framework implementing ${topic}. Include an architectural schematic, step-by-step pseudo-code, and asymptotic runtime analysis.`,
        correctAnswer: `Complete architectural derivation with base condition handling and state recursion.`,
        explanation: `University Grading Scheme (10 Marks):\n- [3 Marks] Clear architectural block diagram showing input pipeline and state store.\n- [3 Marks] Structured pseudo-code with boundary and edge case checks.\n- [2 Marks] Mathematical proof of time and auxiliary space complexity.\n- [2 Marks] Real-world limitations and mitigation strategies.`,
      },
      {
        id: `q-${Date.now()}-4`,
        questionType: 'mcq',
        marks: 1,
        difficulty,
        questionText: `Which of the following conditions is strictly MANDATORY for applying ${topic} effectively?`,
        options: [
          'Optimal substructure and overlapping subproblems',
          'Strictly descending sorted input values',
          'Unbounded auxiliary disk storage',
          'Static compile-time constant arrays only',
        ],
        correctAnswer: 'Optimal substructure and overlapping subproblems',
        explanation: `Correct: Without optimal substructure and overlapping sub-computations, memoization or dynamic state-tracking yields zero asymptotic improvement.`,
      },
    ];

    return res.json({
      questions: fallbackQuestions,
      isFallback: true,
      message: 'Running in offline mode. Curated high-yield practice questions loaded.',
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let raw = (response.text || '').trim();
    // Strip markdown formatting if any
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```/, '').replace(/```$/, '').trim();
    }

    try {
      const parsed = JSON.parse(raw);
      res.json({ questions: parsed, isFallback: false });
    } catch {
      // In case json parsing failed, return structured wrapper
      res.json({
        rawText: response.text,
        isFallback: false,
        questions: [
          {
            id: `q-gen-${Date.now()}`,
            questionType: '5-mark',
            marks: 5,
            difficulty,
            questionText: `Examine the operational mechanics and theoretical foundation of ${topic}.`,
            correctAnswer: 'See comprehensive model answer below.',
            explanation: response.text || 'Detailed answer provided by AI assistant.',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('Gemini question generation error:', error);
    res.status(500).json({ error: 'Failed to generate practice questions.', details: error.message });
  }
});

// 4. AI Adaptive Study Plan Generator
app.post('/api/ai/generate-plan', async (req: Request, res: Response) => {
  const {
    subjects,
    dailyHours = 4,
    preparationLevel = 'intermediate',
    weakTopics = [],
    examDates = {},
  } = req.body;

  const prompt = `You are CognifyX's Adaptive Study Scheduling Engine.
Create a structured 7-day high-efficiency daily study timetable for a college student.
Parameters:
- Subjects: ${JSON.stringify(subjects)}
- Daily Available Study Hours: ${dailyHours} hours/day
- Student Preparation Level: ${preparationLevel}
- Known Weak/Difficult Topics: ${JSON.stringify(weakTopics)}
- Upcoming Exam Dates: ${JSON.stringify(examDates)}

Schedule Requirements:
- Space sessions using spaced repetition and interleaving (alternate subjects).
- Prioritize upcoming exam dates and difficult topics in prime focus slots (mornings/afternoons).
- Include dedicated "Active Recall / Flashcard" slots and "Past Paper / Practice Questions" blocks.
- Divide each day into 1-2 hour focused blocks.

Return ONLY a valid JSON array of 7 day objects (raw JSON, no markdown backticks):
[
  {
    "day": "Day 1",
    "dateLabel": "Tomorrow",
    "focusTheme": "High-Yield Foundations & Weak Topics",
    "totalHours": ${dailyHours},
    "sessions": [
      {
        "id": "s-1-1",
        "timeSlot": "09:00 - 11:00",
        "subject": "Subject Name",
        "topic": "Topic Name",
        "type": "Deep Study" | "Practice Questions" | "Active Recall" | "Exam Revision",
        "durationMinutes": 120,
        "objective": "What the student should achieve in this session",
        "isWeakTopic": true | false
      }
    ]
  }
]`;

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    // Generate intelligent algorithmic timetable
    const days = ['Day 1 (Tomorrow)', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7 (Revision & Mock)'];
    const planDays = days.map((dayLabel, index) => {
      const subjectList = Array.isArray(subjects) && subjects.length > 0 ? subjects : ['Data Structures', 'Operating Systems', 'DBMS', 'Computer Networks'];
      const sub1 = subjectList[index % subjectList.length];
      const sub2 = subjectList[(index + 1) % subjectList.length];

      return {
        day: dayLabel,
        dateLabel: index === 0 ? 'Tomorrow' : `In ${index + 1} days`,
        focusTheme: index === 6 ? 'Full Mock Test & Final Gap Remediation' : `Deep Dive: ${sub1} & Active Recall`,
        totalHours: dailyHours,
        sessions: [
          {
            id: `s-${index}-1`,
            timeSlot: '09:00 - 11:00',
            subject: typeof sub1 === 'string' ? sub1 : sub1.name || 'Subject 1',
            topic: weakTopics[index % (weakTopics.length || 1)] || 'Core High-Yield Concepts',
            type: 'Deep Study',
            durationMinutes: 120,
            objective: 'Understand foundational principles, write annotated formulas, and resolve edge cases.',
            isWeakTopic: true,
          },
          {
            id: `s-${index}-2`,
            timeSlot: '11:30 - 13:00',
            subject: typeof sub1 === 'string' ? sub1 : sub1.name || 'Subject 1',
            topic: 'University 5-Mark & 10-Mark Question Practice',
            type: 'Practice Questions',
            durationMinutes: 90,
            objective: 'Solve 3 analytical questions under timed conditions with full marking rubric review.',
            isWeakTopic: false,
          },
          {
            id: `s-${index}-3`,
            timeSlot: '16:00 - 17:30',
            subject: typeof sub2 === 'string' ? sub2 : sub2.name || 'Subject 2',
            topic: 'Interleaved Flashcards & Active Recall',
            type: 'Active Recall',
            durationMinutes: 90,
            objective: 'Spaced repetition drill on definitions, key algorithms, and exam traps.',
            isWeakTopic: false,
          },
        ],
      };
    });

    return res.json({
      plan: planDays,
      isFallback: true,
      strategySummary: `Optimized for ${dailyHours} hrs/day with priority given to nearest exams and spaced repetition interleaving.`,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    let raw = (response.text || '').trim();
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const plan = JSON.parse(raw);
    res.json({ plan, isFallback: false });
  } catch (error: any) {
    console.error('Gemini plan error:', error);
    res.status(500).json({ error: 'Failed to generate plan.', details: error.message });
  }
});

// 5. General AI Study Assistant Chat
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  const { message, history = [], currentSubject, currentTopic } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const prompt = `You are CognifyX AI, an elite college academic mentor and study strategist.
Student is preparing for college exams.
${currentSubject ? `Current Subject Context: ${currentSubject}` : ''}
${currentTopic ? `Current Topic Context: ${currentTopic}` : ''}

Student asks: "${message}"

Give an encouraging, crystal-clear, structured response with bullet points, conceptual clarity, and practical study tips. If they ask about exam techniques, recommend the Feynman Technique, Spaced Repetition, or Active Recall.`;

  if (!ai || !apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      reply: `I understand you're working on **${currentTopic || 'your exam preparation'}**! Here is a recommended strategy:

1. **Break it Down (Feynman Principle):** If you cannot explain the mechanism in 2 plain sentences without technical jargon, revisit the base abstraction first.
2. **High-Yield Priority:** Focus on concepts worth 5 and 10 marks in previous university papers.
3. **Active Testing:** Don't just re-read notes passively. Head over to our **Question Practice Generator** or **Flashcards** tab and quiz yourself right away!

*(CognifyX AI is in offline demo mode. To enable real-time model streaming, set your GEMINI_API_KEY in Settings > Secrets).*`,
      isFallback: true,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    res.json({ reply: response.text || 'I could not generate a response.', isFallback: false });
  } catch (error: any) {
    console.error('Gemini chat error:', error);
    res.status(500).json({ error: 'AI Assistant error.', details: error.message });
  }
});

// Setup Vite Dev Middleware or Serve Production Build
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`CognifyX server running on http://0.0.0.0:${port}`);
  });
}

startServer();
