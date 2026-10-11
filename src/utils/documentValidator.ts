import {
  DocumentType,
  ValidationStatus,
  ReadabilityStatus,
  ValidationIssue,
  DocumentMetadata,
  ValidatedDocument,
  StudentProfile,
  BenchmarkCase,
  BenchmarkResults,
} from '../types';

/**
 * Extracts metadata from text content using deterministic heuristics and regex.
 */
export function extractDocumentMetadata(text: string): DocumentMetadata {
  const charCount = text ? text.trim().length : 0;
  const isShortDocument = charCount > 0 && charCount < 1200;

  if (charCount === 0) {
    return { charCount: 0, isShortDocument: true };
  }

  // 1. Academic Year detection
  let academicYear: string | undefined;
  const yearRangeMatch = text.match(/\b(20[12][0-9]\s*[-–/]\s*(?:20)?[12][0-9])\b/i);
  const termYearMatch = text.match(/\b(Fall|Spring|Summer|Winter|Autumn)\s*(20[12][0-9])\b/i);
  const monthYearMatch = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)\s*(20[12][0-9])\b/i);
  const examYearMatch = text.match(/\b(?:EXAMINATION|EXAM|SESSION)\s*[-–:]*\s*(?:[A-Za-z]+\s+)?(20[12][0-9])\b/i);
  const regMatch = text.match(/\b(20[12][0-9])\s*(?:Regulation|Curriculum|Syllabus|Scheme|Batch|AY|Session)\b/i);

  if (yearRangeMatch) {
    academicYear = yearRangeMatch[1].replace(/\s+/g, '');
  } else if (termYearMatch) {
    academicYear = `${termYearMatch[1]} ${termYearMatch[2]}`;
  } else if (monthYearMatch) {
    academicYear = `${monthYearMatch[1]} ${monthYearMatch[2]}`;
  } else if (regMatch) {
    academicYear = `${regMatch[1]} Regulation`;
  } else if (examYearMatch) {
    academicYear = `Session ${examYearMatch[1]}`;
  }

  // 2. Semester detection
  let semester: string | undefined;
  const semMatch = text.match(/\b(?:Semester|Sem|Term)\s*[:\-\s]*([1-8]|I|II|III|IV|V|VI|VII|VIII)\b/i);
  const ordinalSemMatch = text.match(/\b([1-8](?:st|nd|rd|th)\s*(?:Semester|Sem|Term))\b/i);

  if (semMatch) {
    semester = `Semester ${semMatch[1].toUpperCase()}`;
  } else if (ordinalSemMatch) {
    semester = ordinalSemMatch[1];
  }

  // 3. Course Identifier (e.g. CS-301, CS302, MATH-201, ECE-401)
  let courseIdentifier: string | undefined;
  const courseMatch = text.match(/\b([A-Z]{2,4}\s*[-–]?\s*[0-9]{3,4}[A-Z]?)\b/);
  if (courseMatch) {
    courseIdentifier = courseMatch[1].replace(/\s+/g, '-').toUpperCase();
  }

  // 4. Document Date
  let documentDate: string | undefined;
  const dateMatch = text.match(/\b(?:Date|Issued|Published|Effective|Exam Date)\s*[:\-\s]*([A-Za-z]+\s+[0-9]{1,2},?\s+20[12][0-9]|[0-9]{1,2}[-–/.][0-9]{1,2}[-–/.](?:20)?[12][0-9]|20[12][0-9]-[0-9]{2}-[0-9]{2})\b/i);
  if (dateMatch) {
    documentDate = dateMatch[1];
  }

  // 5. Syllabus Version
  let syllabusVersion: string | undefined;
  const verMatch = text.match(/\b(?:Version|Ver|Rev|Revision|v)\s*[:\-\s]*([0-9]+(?:\.[0-9]+)*|[A-Z0-9]+)\b/i);
  if (verMatch) {
    syllabusVersion = `v${verMatch[1]}`;
  }

  // 6. Extracted Topics / Units
  const topicLines: string[] = [];
  const unitMatches = text.matchAll(/(?:Unit|Module|Chapter)\s*([0-9IVX]+)\s*[:\-\s]+([^\n\r.]+)/gi);
  for (const m of unitMatches) {
    const title = m[2].trim();
    if (title.length > 3 && title.length < 80) {
      topicLines.push(`Unit ${m[1]}: ${title}`);
    }
  }

  return {
    academicYear,
    semester,
    courseIdentifier,
    documentDate,
    syllabusVersion,
    extractedTopics: topicLines.length > 0 ? topicLines : undefined,
    charCount,
    isShortDocument,
  };
}

/**
 * Validates any student uploaded document according to the GREVIX Challenge Card 1 requirements.
 * Enforces evidence-based detection, never flags simply because a document is short,
 * distinguishes past-year papers from outdated syllabi, and handles uncertainty cautiously.
 */
export function validateDocument(
  fileName: string,
  rawContent: string,
  fileSize: number,
  documentType: DocumentType,
  profile: StudentProfile
): ValidatedDocument {
  const issues: ValidationIssue[] = [];
  const text = (rawContent || '').trim();
  const charCount = text.length;

  // 1. Check for Empty File or Parsing Failure
  if (!text || charCount === 0 || fileSize === 0) {
    issues.push({
      id: 'iss-empty-file',
      severity: 'error',
      category: 'readability',
      title: 'Empty File or No Extracted Text',
      description: 'The uploaded file contains zero extractable text characters.',
      evidence: `File "${fileName}" has ${fileSize} bytes and 0 text characters.`,
      recommendedAction: 'Re-upload a valid document with readable text or content.',
    });

    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fileName,
      fileSize,
      documentType,
      uploadTimestamp: new Date().toISOString(),
      status: 'Potential issue',
      readability: 'unreadable-empty',
      readabilityDetails: 'Zero text characters extracted.',
      metadata: { charCount: 0, isShortDocument: true },
      issues,
      extractedContent: '',
    };
  }

  // 2. Check Readability / OCR Needs
  let readability: ReadabilityStatus = 'clean';
  let readabilityDetails = 'Text is clean, structured, and legible.';

  // Check if content looks like a raw binary PDF stream with low character density
  const isBinaryPdf = text.startsWith('%PDF') || text.includes('endstream') || text.includes('/FlateDecode');
  const printableChars = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  const printableRatio = charCount > 0 ? printableChars.length / charCount : 0;

  const pdfStructureKeywords = /\b(?:obj|endobj|stream|endstream|xref|trailer|startxref|Catalog|Pages|Page|Contents|Length|Filter|FlateDecode|Type|Root|Kids|Count|Parent|size)\b/gi;
  const nonPdfContent = text
    .replace(/%PDF[^\n\r]*/gi, '')
    .replace(pdfStructureKeywords, '')
    .replace(/[\x00-\x1F\x7F-\x9F0-9<>/[\](){}=%\s\\]/g, '');
  const isScannedPdfNoText = isBinaryPdf && nonPdfContent.length < 35;

  if (isScannedPdfNoText) {
    readability = 'low-density-ocr-needed';
    readabilityDetails = 'Scanned image PDF with no embedded digital text layer.';
    issues.push({
      id: 'iss-ocr-needed',
      severity: 'error',
      category: 'readability',
      title: 'Scanned Document Requiring OCR',
      description: 'Document appears to be an image-only scan without a selectable digital text layer.',
      evidence: `PDF binary stream detected with only ${nonPdfContent.length} substantive text characters and no extractable study content.`,
      recommendedAction: 'Upload a text-based PDF or run an OCR scanner before uploading.',
    });
  } else if (printableRatio < 0.65) {
    readability = 'parsing-failed';
    readabilityDetails = 'High density of unreadable non-printable binary characters.';
    issues.push({
      id: 'iss-unreadable-binary',
      severity: 'error',
      category: 'readability',
      title: 'Corrupted or Binary Encoding',
      description: 'Extracted content has a high proportion of unreadable non-alphanumeric symbols.',
      evidence: `Only ${Math.round(printableRatio * 100)}% printable text detected in character stream.`,
      recommendedAction: 'Export document as plain text (.txt), Markdown (.md), or clean PDF.',
    });
  }

  // 3. Extract Metadata
  const metadata = extractDocumentMetadata(text);

  // 4. Truncation & Incomplete Content Check
  // IMPORTANT: Do NOT assume a short document is incomplete!
  // Only detect missing/truncated content with concrete evidence.
  let hasTruncationEvidence = false;

  // Evidence A: Abrupt dangling sentence at the end (e.g. ends mid-word or without terminal punctuation on sentence fragment)
  const trailingChunk = text.slice(-120).trim();
  const endsAbruptly =
    /\b(?:and|the|of|with|Unit|Module|Question|Q\.|part|cont\.|etc\.)\s*$/i.test(trailingChunk) ||
    (/[a-zA-Z0-9,]$/.test(trailingChunk) &&
      !trailingChunk.endsWith('.') &&
      !trailingChunk.endsWith(';') &&
      !trailingChunk.endsWith('}') &&
      !trailingChunk.endsWith(']') &&
      !trailingChunk.endsWith(')') &&
      (trailingChunk.includes('Unit') || trailingChunk.includes('Question') || trailingChunk.includes('following')));

  // Evidence B: Page number header mismatch e.g. "Page 1 of 4"
  const pageMatch = text.match(/\bPage\s+([0-9]+)\s+of\s+([0-9]+)\b/i);
  const isPageTruncated = pageMatch && parseInt(pageMatch[1], 10) === 1 && parseInt(pageMatch[2], 10) > 1 && charCount < 3000;

  // Evidence C: Table of Contents / Unit count mismatch
  const mentionsUnitsTotal = text.match(/\b(?:consists\s+of|total\s+of)\s+([4-6])\s+(?:units|modules)\b/i);
  let missingLaterUnits = false;
  if (mentionsUnitsTotal) {
    const expectedUnits = parseInt(mentionsUnitsTotal[1], 10);
    const hasUnit1 = /Unit\s*1\b|Module\s*1\b/i.test(text);
    const hasLastUnit = new RegExp(`Unit\\s*${expectedUnits}\\b|Module\\s*${expectedUnits}\\b`, 'i').test(text);
    if (hasUnit1 && !hasLastUnit) {
      missingLaterUnits = true;
    }
  }

  // Evidence D: Question Paper truncation e.g. "Total Questions: 10" but only Q1-Q3 exist
  let missingQuestions = false;
  if (documentType === 'question-paper' || documentType === 'assignment') {
    const totalQMatch = text.match(/\b(?:Total\s+Questions|Answer\s+all)\s*[:\-\s]*([5-9]|[1-9][0-9])\b/i);
    if (totalQMatch) {
      const totalExpected = parseInt(totalQMatch[1], 10);
      const hasQ1 = /Question\s*1\b|Q1\b/i.test(text);
      const hasQEnd = new RegExp(`Question\\s*${totalExpected}\\b|Q${totalExpected}\\b`, 'i').test(text);
      if (hasQ1 && !hasQEnd && charCount < 2500) {
        missingQuestions = true;
      }
    }
  }

  if (endsAbruptly) {
    hasTruncationEvidence = true;
    issues.push({
      id: 'iss-abrupt-ending',
      severity: 'error',
      category: 'incomplete',
      title: 'Truncated Document Ending',
      description: 'Document cuts off mid-sentence or mid-section with missing concluding topics.',
      evidence: `Ends with dangling text: "${trailingChunk.slice(-60)}"`,
      recommendedAction: 'Upload the complete multi-page document to ensure all units are covered.',
    });
  }

  if (isPageTruncated && pageMatch) {
    hasTruncationEvidence = true;
    issues.push({
      id: 'iss-page-truncation',
      severity: 'error',
      category: 'incomplete',
      title: 'Missing Pages Detected',
      description: `Document header explicitly specifies ${pageMatch[2]} total pages, but only Page 1 is present.`,
      evidence: `Header reads: "${pageMatch[0]}" while character count is only ${charCount} chars.`,
      recommendedAction: 'Export all pages of the document, not just the first page.',
    });
  }

  if (missingLaterUnits && mentionsUnitsTotal) {
    hasTruncationEvidence = true;
    issues.push({
      id: 'iss-missing-units',
      severity: 'error',
      category: 'incomplete',
      title: 'Missing Curriculum Units',
      description: `Course outline defines ${mentionsUnitsTotal[1]} units, but later units are absent.`,
      evidence: `Text states "${mentionsUnitsTotal[0]}" but units 4-${mentionsUnitsTotal[1]} are not found.`,
      recommendedAction: 'Attach the full syllabus including all modules.',
    });
  }

  if (missingQuestions) {
    hasTruncationEvidence = true;
    issues.push({
      id: 'iss-missing-questions',
      severity: 'error',
      category: 'incomplete',
      title: 'Incomplete Question Set',
      description: 'The problem paper states a higher question count than what was extracted.',
      evidence: 'Earlier questions are present but concluding numbered problems are missing.',
      recommendedAction: 'Ensure all pages of the question paper are attached.',
    });
  }

  // 5. Outdated Document Detection (Requirement 2 & 4)
  // Extract target year from profile (e.g. 2026)
  const currentTargetYearMatch = (profile.targetExamYear || '2026').match(/20[12][0-9]/);
  const currentYearInt = currentTargetYearMatch ? parseInt(currentTargetYearMatch[0], 10) : 2026;

  let isOutdated = false;
  let isUncertain = false;

  if (metadata.academicYear) {
    const docYearMatch = metadata.academicYear.match(/20[12][0-9]/);
    if (docYearMatch) {
      const docYearInt = parseInt(docYearMatch[0], 10);

      // Nuance: If document is a previous-year question paper, older years (e.g., 2023, 2024) are completely VALID historical tests!
      if (documentType === 'question-paper') {
        if (docYearInt < 2018) {
          issues.push({
            id: 'iss-very-old-pyq',
            severity: 'warning',
            category: 'outdated',
            title: 'Legacy Exam Paper (>8 Years Old)',
            description: 'This past paper is from over 8 years ago; grading patterns may have evolved.',
            evidence: `Document stamped: "${metadata.academicYear}".`,
            recommendedAction: 'Can be used for practice, but prioritize recent 2023-2025 question patterns.',
          });
        }
      } else if (documentType === 'syllabus' || documentType === 'assignment') {
        // For syllabus, if year is significantly before current curriculum (e.g. <= 2022 when student is 2026):
        if (docYearInt <= currentYearInt - 3) {
          isOutdated = true;
          issues.push({
            id: 'iss-outdated-syllabus',
            severity: 'error',
            category: 'outdated',
            title: 'Outdated Curriculum / Regulation Detected',
            description: `Document specifies Academic Year / Regulation ${metadata.academicYear}, which precedes your current ${currentYearInt} examination session.`,
            evidence: `Found regulation stamp: "${metadata.academicYear}" (Student session: ${profile.targetExamYear}).`,
            recommendedAction: 'Verify with your department whether this older regulation syllabus is still in force.',
          });
        }
      }
    }
  } else {
    // If NO academic year was found:
    // Requirement 2: "If there is insufficient evidence, display 'Needs verification' rather than claiming that the file is outdated."
    isUncertain = true;
    issues.push({
      id: 'iss-uncertain-year',
      severity: 'info',
      category: 'metadata',
      title: 'Academic Year Unstated (Needs Verification)',
      description: 'Document has no explicit academic year or regulation stamp in its text.',
      evidence: 'No date or year range matching 20XX found in document header or footer.',
      recommendedAction: 'Confirm with your course coordinator that this document applies to the current session.',
    });
  }

  // Check Semester mismatch
  if (metadata.semester && profile.semester) {
    const profileSemNum = profile.semester.match(/[1-8]/)?.[0];
    const docSemNum = metadata.semester.match(/[1-8]/)?.[0];
    if (profileSemNum && docSemNum && profileSemNum !== docSemNum) {
      issues.push({
        id: 'iss-sem-mismatch',
        severity: 'warning',
        category: 'metadata',
        title: 'Semester Discrepancy',
        description: `Document specifies ${metadata.semester}, whereas your profile is set to ${profile.semester}.`,
        evidence: `Extracted: "${metadata.semester}" vs Student Profile: "${profile.semester}".`,
        recommendedAction: 'Confirm whether this is an elective, backlog, or prerequisite course.',
      });
    }
  }

  // 6. Determine Final Overall Validation Status
  // Statuses: 'Validated' | 'Needs verification' | 'Potential issue'
  let status: ValidationStatus = 'Validated';

  const hasErrors = issues.some((i) => i.severity === 'error');
  const hasWarnings = issues.some((i) => i.severity === 'warning');
  const hasInfo = issues.some((i) => i.severity === 'info');

  if (hasErrors || isOutdated || hasTruncationEvidence || readability !== 'clean') {
    status = 'Potential issue';
  } else if (hasWarnings || isUncertain || hasInfo) {
    status = 'Needs verification';
  } else {
    status = 'Validated';
  }

  return {
    id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    fileName,
    fileSize,
    documentType,
    uploadTimestamp: new Date().toISOString(),
    status,
    readability,
    readabilityDetails,
    metadata,
    issues,
    extractedContent: text,
  };
}

/**
 * 12 Clearly Labeled Synthetic Examples representing complete, incomplete, outdated, and uncertain documents.
 * Used for live, repeatable benchmark measurement to evaluate detector accuracy and over-flagging rate.
 */
export const SYNTHETIC_BENCHMARK_CASES: BenchmarkCase[] = [
  {
    id: 'tc-1',
    label: 'Complete Current Syllabus (Fall 2026)',
    documentType: 'syllabus',
    category: 'complete-valid',
    fileName: 'CS301_Data_Structures_Fall2026_Syllabus.txt',
    expectedStatus: 'Validated',
    text: `APEX INSTITUTE OF TECHNOLOGY
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
ACADEMIC YEAR: 2026-2027 | SEMESTER: 5 | FALL 2026
COURSE: CS-301 DATA STRUCTURES & ALGORITHMS

COURSE OBJECTIVES & SYLLABUS:
Unit 1: Linear Collections & Asymptotic Analysis
Asymptotic notations, big-O, omega, theta. Master Theorem for divide and conquer recurrences. Arrays, amortized resizing, linked lists.

Unit 2: Hierarchical Structures & Self-Balancing Trees
Binary Search Trees, balance invariant. AVL Tree rotations (LL, RR, LR, RL). Red-Black tree principles and B+ Tree indexing.

Unit 3: Non-Linear Structures & Graph Algorithms
Graph representations, BFS and DFS. Single source shortest paths: Dijkstra with Min-Heap, Bellman-Ford for negative weights. Minimum spanning trees: Kruskal and Prim.

Unit 4: Advanced Algorithmic Paradigms
Dynamic Programming: Optimal substructure and overlapping subproblems. 0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication. Greedy heuristics and Huffman coding.

Unit 5: Complexity Theory & NP-Completeness
Tractable vs Intractable problems. Classes P, NP, NP-Complete, and NP-Hard. Reduction techniques and Cook-Levin theorem.

Grading Scheme: Mid-Term (30%), Assignments (20%), Final University Exam (50%).`,
  },
  {
    id: 'tc-2',
    label: 'Short Single-Page Elective Syllabus (Valid, Short)',
    documentType: 'syllabus',
    category: 'short-valid',
    fileName: 'CS309_Quantum_Computing_Elective_Outline.txt',
    expectedStatus: 'Validated',
    text: `COURSE OUTLINE: CS-309 QUANTUM COMPUTING (ELECTIVE)
ACADEMIC YEAR: 2026-2027 | SEMESTER 5 | FALL 2026

Course Overview:
Introductory 2-credit elective covering quantum bits, superposition, entanglement, and quantum logic gates.

Core Units:
Unit 1: Mathematical Foundations - Hilbert spaces, Dirac notation, qubits.
Unit 2: Quantum Circuit Model - Hadamard, Pauli-X/Y/Z, CNOT, Phase gates.
Unit 3: Foundational Quantum Algorithms - Deutsch-Jozsa and Grover search algorithm.

Assessment: Bi-weekly lab assignments and project submission.`,
  },
  {
    id: 'tc-3',
    label: 'Previous-Year Exam Paper 2024 (Valid Historical PYQ)',
    documentType: 'question-paper',
    category: 'valid-pyq',
    fileName: 'CS302_Operating_Systems_Final_Exam_Nov2024.txt',
    expectedStatus: 'Validated',
    text: `UNIVERSITY SEMESTER EXAMINATION - NOVEMBER 2024
COURSE: CS-302 OPERATING SYSTEMS | SEMESTER 5
TIME: 3 HOURS | MAXIMUM MARKS: 100

PART A (Answer all questions, 10 x 2 = 20 Marks)
1. Define Belady's Anomaly and name the page replacement algorithm that suffers from it.
2. Differentiate between counting semaphores and binary semaphores with a mutex example.
3. State the four Coffman conditions necessary for deadlock to occur.
4. What is Translation Lookaside Buffer (TLB) reach?

PART B (Answer any 4 questions, 4 x 20 = 80 Marks)
5. Explain the Producer-Consumer problem using semaphores. Provide complete pseudocode.
6. Consider reference string: 7, 0, 1, 2, 0, 3, 0, 4, 2, 3 with 3 frames. Calculate page faults under LRU vs Optimal.
7. Explain Banker's Algorithm for deadlock avoidance with safety algorithm matrices.
8. Describe multi-level feedback queue CPU scheduling with preemptive criteria.`,
  },
  {
    id: 'tc-4',
    label: 'Truncated Syllabus (Page 1 of 4 with Dangling Text)',
    documentType: 'syllabus',
    category: 'truncated',
    fileName: 'CS303_DBMS_Syllabus_Incomplete_Scan.txt',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'incomplete',
    text: `APEX UNIVERSITY | Page 1 of 4
DEPARTMENT OF INFORMATION TECHNOLOGY
ACADEMIC YEAR: 2026-2027 | SEMESTER: 5
COURSE: CS-303 DATABASE MANAGEMENT SYSTEMS
Course consists of 5 units covering relational modeling to distributed transactions.

Unit 1: Relational Data Model & ER Diagrams
Entities, relationships, constraints, relational algebra operators: select, project, cartesian product, joins.

Unit 2: SQL and Query Optimization
DDL, DML, subqueries, group by, aggregations, window functions. Cost-based query evaluation and indexing.

Unit 3: Relational Normalization & Depend`,
  },
  {
    id: 'tc-5',
    label: 'Outdated Legacy Syllabus (2018 Regulation)',
    documentType: 'syllabus',
    category: 'outdated',
    fileName: 'CS304_Computer_Networks_R18_Old_Syllabus.txt',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'outdated',
    text: `ANNA UNIVERSITY CHENNAI
R-2018 REGULATIONS (ACADEMIC YEAR 2018-2019)
COURSE CODE: CS-8591 COMPUTER NETWORKS

Unit 1: Introduction to Physical & Data Link Layer
Network types, topologies, OSI reference model, framing, HDLC, stop and wait ARQ, go-back-N.

Unit 2: Media Access & Ethernet
CSMA/CD, standard Ethernet, fast Ethernet, wireless LAN 802.11b standards.

Unit 3: Network Layer & IPv4
Classful IP addressing, RIP routing, distance vector algorithms.

Unit 4: Transport Layer & TCP/UDP
TCP state transitions, socket programming in C, UDP header structure.

Unit 5: Application Layer
DNS, FTP, SMTP, and HTTP/1.0 protocol specifications.`,
  },
  {
    id: 'tc-6',
    label: 'Undated Syllabus (Uncertain - Needs Verification)',
    documentType: 'syllabus',
    category: 'uncertain-no-date',
    fileName: 'Algorithms_Course_Handout_Unspecified_Date.txt',
    expectedStatus: 'Needs verification',
    expectedIssueCategory: 'metadata',
    text: `ADVANCED ALGORITHMS COURSE HANDOUT
Instructor: Dr. V. Ramanathan | Department of Computer Science

Course Syllabus:
Unit 1: Divide and Conquer, Master Theorem, Median-of-Medians selection.
Unit 2: Dynamic Programming, Matrix Chain Multiplication, Bellman-Ford algorithm.
Unit 3: Greedy Algorithms, Minimum Spanning Trees, Matroids.
Unit 4: Flow Networks, Ford-Fulkerson algorithm, Max-Flow Min-Cut theorem.
Unit 5: Randomized Algorithms, Quickselect, Monte Carlo vs Las Vegas methods.

Prerequisites: Basic programming proficiency and discrete mathematics.`,
  },
  {
    id: 'tc-7',
    label: 'Empty / Zero Character File',
    documentType: 'syllabus',
    category: 'unreadable',
    fileName: 'corrupted_upload_0bytes.txt',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'readability',
    text: ``,
  },
  {
    id: 'tc-8',
    label: 'Scanned Image PDF Without OCR Layer',
    documentType: 'syllabus',
    category: 'unreadable',
    fileName: 'scanned_handwritten_notes_no_ocr.pdf',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'readability',
    text: `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 45 /Filter /FlateDecode >>\nstream\nx\x9c\x03\x00\x00\x00\x00\x01\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\n%%EOF`,
  },
  {
    id: 'tc-9',
    label: 'Short Weekly Assignment (3 Problems, Valid)',
    documentType: 'assignment',
    category: 'short-valid',
    fileName: 'CS301_Assignment_3_Dynamic_Programming.txt',
    expectedStatus: 'Validated',
    text: `ASSIGNMENT 3: DYNAMIC PROGRAMMING
COURSE: CS-301 | SEMESTER 5 | FALL 2026
DUE DATE: OCTOBER 24, 2026 | MAX SCORE: 30 MARKS

Problem 1 (10 Marks):
Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum. Implement Kadane's algorithm in O(N) time and O(1) space.

Problem 2 (10 Marks):
Formulate the 0/1 Knapsack recurrence relation for item weights W = [2, 3, 4, 5] and profits P = [3, 4, 5, 8] with capacity C = 8. Show the completed 2D table.

Problem 3 (10 Marks):
Explain why memoization avoids exponential call stack blowup in computing Fibonacci numbers. Compare auxiliary memory footprint with bottom-up tabulation.`,
  },
  {
    id: 'tc-10',
    label: 'Truncated Assignment (Cuts Off at Problem 2)',
    documentType: 'assignment',
    category: 'truncated',
    fileName: 'CS302_Assignment_2_Truncated.txt',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'incomplete',
    text: `DEPARTMENT OF COMPUTER SCIENCE | FALL 2026
CS-302 OPERATING SYSTEMS - ASSIGNMENT 2 (TOTAL QUESTIONS: 6)
Answer all questions before Friday 5:00 PM.

Question 1: Explain the critical section problem and state the three requirements for a valid solution: mutual exclusion, progress, and bounded waiting.

Question 2: Implement Peterson's algorithm for two processes and prove that it satisfies mutual exclusion using shared variables flag and`,
  },
  {
    id: 'tc-11',
    label: 'Operating Systems Lab Syllabus (Fall 2026, Valid)',
    documentType: 'syllabus',
    category: 'complete-valid',
    fileName: 'CS302L_Operating_Systems_Lab_Fall2026.txt',
    expectedStatus: 'Validated',
    text: `LABORATORY MANUAL & SYLLABUS: CS-302L OPERATING SYSTEMS LAB
ACADEMIC YEAR: 2026-2027 | SEMESTER: 5 | FALL 2026
DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING

List of Laboratory Experiments:
1. Unix System Calls: Process creation, execution, and termination (fork, exec, wait, exit).
2. CPU Scheduling: Implementation of FCFS, SJF, Priority, and Round Robin algorithms.
3. Inter-Process Communication: Pipes, FIFOs, and POSIX shared memory.
4. Synchronization: Solving Producer-Consumer problem using POSIX counting semaphores.
5. Deadlock Detection: Implementation of Banker's Algorithm for safety verification.
6. Memory Management: Simulation of First-Fit, Best-Fit, and Worst-Fit allocation.
7. Page Replacement: Simulation of FIFO, LRU, and Optimal page replacement algorithms.
8. File Allocation: Simulation of Sequential, Indexed, and Linked file structures.

Evaluation: Continuous Lab Performance (40 Marks), Final Practical Exam (60 Marks).`,
  },
  {
    id: 'tc-12',
    label: 'Truncated Question Paper (Missing Section B)',
    documentType: 'question-paper',
    category: 'truncated',
    fileName: 'CS303_Midterm_Paper_Cutoff.txt',
    expectedStatus: 'Potential issue',
    expectedIssueCategory: 'incomplete',
    text: `MID-SEMESTER EXAMINATION | FALL 2026
COURSE: CS-303 DATABASE MANAGEMENT SYSTEMS
TIME: 90 MINUTES | TOTAL QUESTIONS: 8 | MAXIMUM MARKS: 50

Section A (Compulsory Questions 1 to 4):
Question 1: Define 3NF and compare it with BCNF.
Question 2: What is a lossless join decomposition? Give a 3-attribute example.
Question 3: Explain the ACID properties with respect to transaction rollback.`,
  },
];

/**
 * Executes the synthetic evaluation benchmark suite against the live validator engine.
 * Computes exact measured statistics: Sample Size, True Positives, False Positives,
 * True Negatives, False Negatives, Accuracy, and Over-Flagging Rate.
 */
export function runBenchmarkEvaluation(profile: StudentProfile): BenchmarkResults {
  const cases = SYNTHETIC_BENCHMARK_CASES;
  let tp = 0;
  let fp = 0;
  let tn = 0;
  let fn = 0;

  const caseResults = cases.map((tc) => {
    const result = validateDocument(
      tc.fileName,
      tc.text,
      tc.text.length,
      tc.documentType,
      profile
    );

    const actualStatus = result.status;
    const expectedStatus = tc.expectedStatus;

    // Ground Truth Definition:
    // A document is "Defective / Problematic" (Positive class) if it is truncated, outdated, unreadable, or missing required critical data.
    // A document is "Clean / Non-Problematic" (Negative class) if it is valid (complete syllabus, short valid syllabus, valid PYQ, etc.).
    const isActuallyDefective = tc.expectedStatus === 'Potential issue';
    const isFlaggedAsDefective = actualStatus === 'Potential issue';

    let isMatch = actualStatus === expectedStatus;

    if (isActuallyDefective) {
      if (isFlaggedAsDefective) {
        tp++;
      } else {
        fn++;
      }
    } else {
      // Non-defective document
      if (isFlaggedAsDefective) {
        fp++; // Over-flagging error!
      } else {
        tn++; // Properly not over-flagged
      }
    }

    let reason = '';
    if (isMatch) {
      reason = `Properly identified as "${actualStatus}" based on evidence.`;
    } else {
      reason = `Mismatch: Predicted "${actualStatus}" but expected "${expectedStatus}".`;
    }

    return {
      id: tc.id,
      label: tc.label,
      passed: isMatch,
      actualStatus,
      expectedStatus,
      reason,
    };
  });

  const sampleSize = cases.length;
  const accuracy = Math.round(((tp + tn) / sampleSize) * 100);
  const totalNegatives = tn + fp;
  const overflaggingRate = totalNegatives > 0 ? Math.round((fp / totalNegatives) * 100) : 0;

  return {
    sampleSize,
    truePositives: tp,
    falsePositives: fp,
    trueNegatives: tn,
    falseNegatives: fn,
    accuracy,
    overflaggingRate,
    caseResults,
  };
}
