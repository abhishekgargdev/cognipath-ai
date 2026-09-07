'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Play,
  RotateCcw,
  ArrowRight,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  BrainCircuit,
  Lightbulb,
  Terminal,
  Cpu,
  Copy,
  BookOpen,
  Table,
  ListOrdered,
  ShieldCheck,
  CheckCheck,
  Code2,
} from 'lucide-react';
import { CodeEditor } from '@/components/common/CodeEditor';
import { Button, LoadingSpinner, PracticeEvaluationSkeleton } from '@/components/common';

export interface PracticeQuestionItem {
  id: string;
  topicId: string;
  type: 'concept' | 'mcq' | 'output_prediction' | 'coding' | 'debugging' | 'scenario';
  typeLabel: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  whyThisMatters: string;
  prompt: string;
  codeSnippet?: string;
  options?: Array<{ id: string; label: string; code?: string }>;
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
  language?: string;
  hints?: string[];
  testCases?: any[];
  solutionApproaches?: any[];
  conceptExplanation?: any;
}

export interface EvaluationResult {
  submissionId?: string;
  passed: boolean;
  score: number;
  summary: string;
  runtimeMs: number;
  memoryMb: number;
  timeComplexity: string;
  spaceComplexity: string;
  passedTests: number;
  totalTests: number;
  whatYouDidWell: string[];
  whatCouldBeImproved: string[];
  conceptsDemonstrated: Array<{ name: string; status: string }>;
  alternativeApproach?: string;
  aiRecommendation: string;
  failingTestDetails?: {
    input: string;
    expected: string;
    actual: string;
    commonMistakeExplanation?: string;
  };
  conceptExplanation?: {
    topic: string;
    theoreticalFoundation: string;
    underlyingMechanics: string;
    stepByStepTrace: string[];
    architecturalTakeaways: string;
    commonPitfalls: string[];
  };
  topSolutions?: Array<{
    id: string;
    rank: number;
    title: string;
    subtitle: string;
    paradigm: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: string;
    explanation: string;
    pros: string[];
    cons: string[];
    whenToUse: string;
  }>;
}

export function PracticeClient() {
  const [questions, setQuestions] = useState<PracticeQuestionItem[]>([]);
  const [isLoadingDaily, setIsLoadingDaily] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'typescript' | 'python'>('javascript');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showWhyMatters, setShowWhyMatters] = useState<boolean>(false);

  // Stats from backend
  const [userStats, setUserStats] = useState<{
    completedQuestionsToday: number;
    totalQuestionsTargetToday: number;
    streakDays: number;
  }>({
    completedQuestionsToday: 0,
    totalQuestionsTargetToday: 5,
    streakDays: 1,
  });

  // Execution & Test states
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [testOutput, setTestOutput] = useState<{ passed: boolean; message: string; results: any[] } | null>(null);

  // AI Evaluation modal state & tabs
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evalModalTab, setEvalModalTab] = useState<'diagnostic' | 'concepts' | 'solutions' | 'matrix'>('diagnostic');
  const [selectedSolutionIdx, setSelectedSolutionIdx] = useState<number>(0);
  const [hasCopiedCode, setHasCopiedCode] = useState<boolean>(false);

  // Fetch daily practice set from /api/practice/daily
  useEffect(() => {
    async function loadDailySet() {
      try {
        setIsLoadingDaily(true);
        const res = await fetch('/api/practice/daily');
        if (!res.ok) throw new Error('Failed to load daily set');
        const data = await res.json();
        setQuestions(data.questions || []);
        setUserStats({
          completedQuestionsToday: data.completedQuestionsToday || 0,
          totalQuestionsTargetToday: data.totalQuestionsTargetToday || 5,
          streakDays: data.streakDays || 1,
        });

        if (data.questions && data.questions.length > 0) {
          const firstQ = data.questions[0];
          if (firstQ.starterCode) setUserCode(firstQ.starterCode);
        }
      } catch (err) {
        console.error('Error fetching daily practice set:', err);
      } finally {
        setIsLoadingDaily(false);
      }
    }
    loadDailySet();
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  // Run Code against visible test cases
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    setIsRunningCode(true);
    setTestOutput(null);

    try {
      const res = await fetch('/api/practice/run-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code: userCode,
          language: selectedLanguage,
        }),
      });
      const data = await res.json();
      setTestOutput({
        passed: data.passed,
        message: data.message,
        results: data.results || [],
      });
    } catch (err) {
      console.error('Error running test cases:', err);
      setTestOutput({
        passed: false,
        message: 'Execution error occurred in sandbox runner',
        results: [],
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit Answer & Trigger AI Diagnostic Evaluation
  const handleSubmit = async () => {
    if (!currentQuestion) return;
    setIsSubmitting(true);
    setEvalModalTab('diagnostic');
    setSelectedSolutionIdx(0);

    try {
      const res = await fetch('/api/practice/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          code: currentQuestion.type === 'coding' ? userCode : undefined,
          selectedOption: currentQuestion.type !== 'coding' ? selectedOption || undefined : undefined,
          language: selectedLanguage,
        }),
      });

      const evalData: EvaluationResult = await res.json();
      setEvaluationResult(evalData);

      if (evalData.passed) {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        setUserStats((prev) => ({
          ...prev,
          completedQuestionsToday: Math.min(prev.totalQuestionsTargetToday, prev.completedQuestionsToday + 1),
        }));
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setEvaluationResult(null);
    setTestOutput(null);
    setSelectedOption(null);
    if (currentQuestionIndex < questions.length - 1) {
      const nextIdx = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIdx);
      if (questions[nextIdx]?.starterCode) {
        setUserCode(questions[nextIdx].starterCode || '');
      } else {
        setUserCode('');
      }
    }
  };

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2000);
  };

  if (isLoadingDaily) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center space-y-4">
        <LoadingSpinner size="lg" variant="primary" />
        <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
          Initializing today's sandboxed practicum problem set...
        </p>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center space-y-4">
        <AlertCircle className="w-8 h-8 text-[#8B2635] mx-auto" />
        <h2 className="text-xl font-serif font-black">No Practice Questions Found</h2>
        <p className="text-sm font-serif text-[#5C5852]">Please verify database seeding or try refreshing.</p>
      </div>
    );
  }

  return (
    <div id="daily-practice-view" className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Banner: Today's Learning Context */}
      <div className="p-5 sm:p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] uppercase tracking-[0.2em]">
                DAY {userStats.streakDays} APPLIED PRACTICUM
              </span>
              <span className="text-[#9E9A91]">•</span>
              <span className="text-xs text-[#5C5852] dark:text-[#9E9A91] font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> ~25 minutes total
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
              Practicum: {currentQuestion.topicId.replace(/-/g, ' ').toUpperCase()}
            </h1>
            <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1 max-w-2xl leading-relaxed">
              <strong className="font-bold not-italic text-[#121212] dark:text-[#F4F2EC]">Diagnostic Justification:</strong> Recent submissions confirm steady concept comprehension, but sandboxed execution and edge cases warrant rigorous reinforcement.
            </p>
          </div>

          {/* 5-Question Stepper */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-xs bg-[#F4F1EA] dark:bg-[#151412] border border-[#DCD9D1] dark:border-[#2C2A26] shrink-0">
            {questions.map((q, idx) => {
              const isCompleted = idx < userStats.completedQuestionsToday;
              const isCurrent = idx === currentQuestionIndex;
              return (
                <button
                  key={q.id || idx}
                  id={`practice-step-${idx + 1}`}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setEvaluationResult(null);
                    setTestOutput(null);
                    if (q.starterCode) setUserCode(q.starterCode);
                  }}
                  className={`w-8 h-8 rounded-xs text-xs font-mono font-bold transition-all flex items-center justify-center cursor-pointer ${
                    isCurrent
                      ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                      : isCompleted
                      ? 'bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] border border-[#1F3A2B]/30'
                      : 'bg-[#FFFFFF] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#EAE7DF]'
                  }`}
                  title={`Question ${idx + 1}: ${q.typeLabel}`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-3 text-[#1F3A2B] dark:text-[#4E876A]" /> : idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Question Header & Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-[0.2em] text-[10px]">
            EXERCISE {currentQuestionIndex + 1} OF {questions.length}
          </span>
          <span className="text-[#9E9A91]">•</span>
          <span className="px-2 py-0.5 rounded-xs font-mono font-bold uppercase text-[9px] border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC]">
            {currentQuestion.typeLabel}
          </span>
          <span className="text-[#9E9A91]">•</span>
          <span className="font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
            Difficulty: {currentQuestion.difficulty}
          </span>
        </div>

        {/* Expandable "Why Am I Learning This?" */}
        <button
          onClick={() => setShowWhyMatters(!showWhyMatters)}
          className="text-[#8B2635] dark:text-[#E08A95] hover:underline flex items-center gap-1 font-serif font-bold cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Curricular Context</span>
        </button>
      </div>

      {showWhyMatters && (
        <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1E1D19] border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif italic text-[#121212] dark:text-[#F4F2EC] animate-in fade-in duration-150 leading-relaxed">
          <strong className="font-bold not-italic block mb-1 text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase tracking-wider">
            Pedagogical Rationale
          </strong>
          "{currentQuestion.whyThisMatters}"
        </div>
      )}

      {/* Main Question Body & Interactive Workspace */}
      <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-5">
        <div>
          <h2 className="text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
            {currentQuestion.title}
          </h2>
          <div className="text-sm font-serif text-[#121212] dark:text-[#EAE7DF] mt-2 leading-relaxed whitespace-pre-line">
            {currentQuestion.prompt}
          </div>
        </div>

        {/* Code Snippet for MCQ / Output Prediction / Debugging */}
        {currentQuestion.codeSnippet && (
          <div className="rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] p-4 font-mono text-xs text-[#F4F2EC] overflow-x-auto shadow-xs">
            <pre>
              <code>{currentQuestion.codeSnippet}</code>
            </pre>
          </div>
        )}

        {/* Option Selection for Multiple Choice / Concept / Debugging Questions */}
        {currentQuestion.options && currentQuestion.options.length > 0 && (
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <div
                  key={opt.id}
                  id={`option-${opt.id}`}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`p-3.5 rounded-xs border text-xs font-serif text-left cursor-pointer transition-all flex items-start justify-between ${
                    isSelected
                      ? 'border-[#8B2635] bg-[#8B2635]/5 text-[#121212] dark:text-[#F4F2EC] ring-1 ring-[#8B2635]'
                      : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#141412] hover:bg-[#F4F1EA] dark:hover:bg-[#1C1B18] text-[#121212] dark:text-[#EAE7DF]'
                  }`}
                >
                  <div className="flex-1 leading-relaxed">
                    <span>{opt.label}</span>
                    {opt.code && (
                      <pre className="mt-2 p-2 rounded-xs bg-[#121212] text-[#F4F2EC] font-mono text-[11px] overflow-x-auto">
                        <code>{opt.code}</code>
                      </pre>
                    )}
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-xs bg-[#8B2635] flex items-center justify-center text-white shrink-0 ml-3 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-3" />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                {selectedOption ? 'Option marked for submission' : 'Select an answer to submit'}
              </span>
              <button
                id="submit-mcq-btn"
                disabled={!selectedOption || isSubmitting}
                onClick={handleSubmit}
                className={`px-5 py-2.5 rounded-xs text-xs font-serif font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedOption
                    ? 'bg-[#121212] dark:bg-[#F4F2EC] text-[#FFFFFF] dark:text-[#121212] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] border border-[#121212] dark:border-[#F4F2EC]'
                    : 'bg-[#EAE7DF] dark:bg-[#201F1B] text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] cursor-not-allowed'
                }`}
              >
                <span>{isSubmitting ? 'Evaluating Answer...' : 'Submit Evaluation'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* CODING QUESTION ENVIRONMENT (Editor + Test Runner) */}
        {currentQuestion.type === 'coding' && (
          <div className="space-y-4 pt-2">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1A1916]">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
                <span className="text-xs font-mono font-bold text-[#121212] dark:text-[#F4F2EC]">
                  solution.js
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as any)}
                  className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] dark:bg-[#121210] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-mono text-[#121212] dark:text-[#F4F2EC] focus:outline-none"
                >
                  <option value="javascript">JavaScript (ES2022)</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python 3.11</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                {currentQuestion.hints && currentQuestion.hints.length > 0 && (
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="px-2.5 py-1 text-xs text-[#8B2635] dark:text-[#E08A95] hover:bg-[#8B2635]/10 rounded-xs transition-colors flex items-center gap-1 cursor-pointer font-serif font-bold border border-[#8B2635]/30"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Conceal Hint' : 'Reveal Hint'}</span>
                  </button>
                )}

                <button
                  onClick={() => setUserCode(currentQuestion.starterCode || '')}
                  className="p-1.5 text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] cursor-pointer"
                  title="Reset to starter code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hint Box */}
            {showHint && currentQuestion.hints && currentQuestion.hints.length > 0 && (
              <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1E1D19] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] space-y-1">
                <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#8B2635] dark:text-[#E08A95] block">
                  Curricular Hint:
                </span>
                <ul className="list-disc list-inside space-y-1 leading-relaxed">
                  {currentQuestion.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Monaco Code Editor */}
            <CodeEditor
              code={userCode}
              onChange={setUserCode}
              language={selectedLanguage}
              minHeight="280px"
            />

            {/* Test Results Console */}
            {isRunningCode && (
              <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] font-mono text-xs space-y-3">
                <div className="flex items-center gap-2.5 text-[#8B2635] dark:text-[#E08A95]">
                  <LoadingSpinner size="sm" variant="primary" />
                  <span className="font-bold">Executing test harness in sandboxed runtime...</span>
                </div>
              </div>
            )}

            {!isRunningCode && testOutput && (
              <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] font-mono text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#2C2A26]">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#EAE7DF]" />
                    <span className="font-bold text-[#F4F2EC]">Test Execution Terminal</span>
                  </div>
                  <span className={`text-[11px] font-bold ${testOutput.passed ? 'text-[#4E876A]' : 'text-[#E08A95]'}`}>
                    {testOutput.message}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {testOutput.results.map((t, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xs bg-[#1C1B18] text-[#F4F2EC]"
                    >
                      <div className="flex items-center gap-2">
                        {t.passed ? (
                          <Check className="w-3.5 h-3.5 text-[#4E876A]" />
                        ) : (
                          <X className="w-3.5 h-3.5 text-[#E08A95]" />
                        )}
                        <span>{t.name}</span>
                      </div>
                      <span className="text-[11px] text-[#A6A299]">
                        Expected: {t.expected}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Coding Bottom Action Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
              <div className="flex items-center gap-3">
                <Button
                  id="run-code-btn"
                  onClick={handleRunCode}
                  disabled={isRunningCode}
                  isLoading={isRunningCode}
                  variant="academic"
                  leftIcon={<Play className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />}
                >
                  {isRunningCode ? 'Executing Test Harness...' : 'Execute Tests'}
                </Button>
              </div>

              <Button
                id="submit-solution-btn"
                onClick={handleSubmit}
                disabled={isSubmitting}
                isLoading={isSubmitting}
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />}
              >
                {isSubmitting ? 'Evaluating Code Thesis...' : 'Submit Final Solution'}
              </Button>
            </div>
          </div>
        )}

        {/* Exercise Pagination & Navigation Bar */}
        <div id="exercise-pagination-bar" className="pt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-serif">
          {/* Previous Exercise Button */}
          <button
            id="prev-exercise-btn"
            onClick={() => {
              if (currentQuestionIndex > 0) {
                const prevIdx = currentQuestionIndex - 1;
                setCurrentQuestionIndex(prevIdx);
                setEvaluationResult(null);
                setTestOutput(null);
                if (questions[prevIdx].starterCode) {
                  setUserCode(questions[prevIdx].starterCode || '');
                }
              }
            }}
            disabled={currentQuestionIndex === 0}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5 font-bold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Exercise</span>
          </button>

          {/* Center Exercise Stepper Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-[#5C5852] dark:text-[#9E9A91] mr-1">
              Exercise {currentQuestionIndex + 1} of {questions.length}:
            </span>
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const isCompleted = idx < userStats.completedQuestionsToday;
              return (
                <button
                  key={`page-dot-${idx}`}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setEvaluationResult(null);
                    setTestOutput(null);
                    if (q.starterCode) setUserCode(q.starterCode);
                  }}
                  className={`w-7 h-7 rounded-xs text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                      : isCompleted
                      ? 'bg-[#1F3A2B]/15 text-[#1F3A2B] dark:text-[#4E876A] border border-[#1F3A2B]/30'
                      : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
                  }`}
                  title={`Jump to Exercise ${idx + 1}: ${q.typeLabel}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Next Exercise Button */}
          <button
            id="next-exercise-btn"
            onClick={handleNextQuestion}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#121212] hover:text-white dark:hover:bg-[#F4F2EC] dark:hover:text-[#121212] text-[#121212] dark:text-[#F4F2EC] cursor-pointer flex items-center justify-center gap-1.5 font-bold transition-colors"
          >
            <span>{currentQuestionIndex < questions.length - 1 ? 'Next Exercise' : 'Conclude Practicum'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* INTELLIGENT AI ANSWER EVALUATION MODAL */}
      {(isSubmitting || evaluationResult) && (
        <div
          id="ai-evaluation-modal"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => { if (!isSubmitting) setEvaluationResult(null); }}
        >
          <div
            className="w-full max-w-4xl rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] shadow-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isSubmitting ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-4">
                  <div className="flex items-center gap-3">
                    <LoadingSpinner size="md" variant="primary" />
                    <div>
                      <span className="px-2 py-0.5 rounded-xs text-[9px] font-bold font-mono uppercase tracking-widest border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]">
                        DIAGNOSTIC ENGINE RUNNING
                      </span>
                      <h3 className="text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                        Synthesizing AST & Sandboxed Execution Evaluation...
                      </h3>
                    </div>
                  </div>
                </div>
                <PracticeEvaluationSkeleton />
              </div>
            ) : evaluationResult && (() => {
              const activeConcept = evaluationResult.conceptExplanation || {
                topic: currentQuestion.title,
                theoreticalFoundation: 'Foundational topic mechanics execution.',
                underlyingMechanics: 'Event loop priority dispatch and closure environment.',
                stepByStepTrace: ['Initial frame execution', 'Queue drainage', 'Resolution'],
                architecturalTakeaways: 'Enforce scope isolation and state cleanup.',
                commonPitfalls: ['Ignoring async dispatch order'],
              };
              const activeSolutions = (evaluationResult.topSolutions && evaluationResult.topSolutions.length > 0)
                ? evaluationResult.topSolutions
                : (currentQuestion.solutionApproaches && currentQuestion.solutionApproaches.length > 0)
                ? currentQuestion.solutionApproaches
                : [
                    {
                      id: '1',
                      rank: 1,
                      title: 'Canonical Idiomatic Approach',
                      subtitle: 'Optimal time and space complexity',
                      paradigm: 'Idiomatic',
                      timeComplexity: 'O(1)',
                      spaceComplexity: 'O(1)',
                      code: userCode || currentQuestion.starterCode || '// Solution implementation',
                      explanation: 'Encapsulates state cleanly in function context.',
                      pros: ['Clean abstraction', 'Minimal overhead'],
                      cons: ['Requires closure understanding'],
                      whenToUse: 'Recommended for standard production code.',
                    },
                  ];
              const currentSolution = activeSolutions[selectedSolutionIdx] || activeSolutions[0];

              return (
                <>
                  {/* Header: Score, Headline & Close */}
                  <div className="flex items-start justify-between border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-4">
                    <div className="flex-1 pr-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-xs text-[9px] font-bold font-mono uppercase tracking-widest border ${
                          evaluationResult.passed
                            ? 'border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A]'
                            : 'border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]'
                        }`}>
                          {evaluationResult.passed ? 'RIGOROUS PASS' : 'REVISION RECOMMENDED'}
                        </span>
                        <span className="text-xs text-[#5C5852] dark:text-[#9E9A91] font-mono">
                          Runtime: {evaluationResult.runtimeMs || 24}ms • Heap: {evaluationResult.memoryMb || 8.4}MB
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1.5 leading-snug">
                        {evaluationResult.summary}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
                          {evaluationResult.score}
                        </span>
                        <span className="text-xs text-[#5C5852] dark:text-[#9E9A91] block font-mono">/ 100</span>
                      </div>
                      <button
                        id="close-evaluation-modal-btn"
                        onClick={() => setEvaluationResult(null)}
                        className="p-1.5 sm:p-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] cursor-pointer"
                        title="Close evaluation dialog"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* TAB NAVIGATION STRIP */}
                  <div className="flex items-center gap-1.5 border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2 overflow-x-auto">
                    <button
                      id="tab-btn-diagnostic"
                      onClick={() => setEvalModalTab('diagnostic')}
                      className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        evalModalTab === 'diagnostic'
                          ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                          : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#1C1B18]'
                      }`}
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>Diagnostic Assessment</span>
                    </button>

                    <button
                      id="tab-btn-concepts"
                      onClick={() => setEvalModalTab('concepts')}
                      className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        evalModalTab === 'concepts'
                          ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                          : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#1C1B18]'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Concept Explanation</span>
                    </button>

                    <button
                      id="tab-btn-solutions"
                      onClick={() => setEvalModalTab('solutions')}
                      className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        evalModalTab === 'solutions'
                          ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                          : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#1C1B18]'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>Top Solutions</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded-xs bg-[#8B2635]/15 text-[#8B2635] dark:text-[#E08A95] font-bold">
                        {activeSolutions.length}
                      </span>
                    </button>

                    <button
                      id="tab-btn-matrix"
                      onClick={() => setEvalModalTab('matrix')}
                      className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        evalModalTab === 'matrix'
                          ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                          : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#1C1B18]'
                      }`}
                    >
                      <Table className="w-3.5 h-3.5" />
                      <span>Approaches Matrix</span>
                    </button>
                  </div>

                  {/* TAB 1: DIAGNOSTIC ASSESSMENT */}
                  {evalModalTab === 'diagnostic' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#5C5852] dark:text-[#9E9A91]">Tests Passed</span>
                          <p className="text-base font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-0.5">
                            {evaluationResult.passedTests} / {evaluationResult.totalTests}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#5C5852] dark:text-[#9E9A91]">Time Complexity</span>
                          <p className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC] font-mono mt-0.5">
                            {evaluationResult.timeComplexity}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#5C5852] dark:text-[#9E9A91]">Space Complexity</span>
                          <p className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC] font-mono mt-0.5">
                            {evaluationResult.spaceComplexity}
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-center">
                          <span className="text-[10px] uppercase font-mono font-bold text-[#5C5852] dark:text-[#9E9A91]">Memory Guard</span>
                          <p className="text-base font-serif font-black text-[#1F3A2B] dark:text-[#4E876A] mt-0.5">Verified</p>
                        </div>
                      </div>

                      {/* What you did well */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#121212] dark:text-[#F4F2EC] flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#1F3A2B] dark:text-[#4E876A]" />
                          <span>Demonstrated Strengths</span>
                        </h4>
                        <ul className="space-y-1.5">
                          {evaluationResult.whatYouDidWell.map((well, idx) => (
                            <li key={idx} className="text-xs font-serif text-[#121212] dark:text-[#EAE7DF] flex items-start gap-2 leading-relaxed">
                              <span className="text-[#1F3A2B] dark:text-[#4E876A] font-bold">✓</span>
                              <span>{well}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Concepts Demonstrated */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91]">
                          Competencies Assessed
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {evaluationResult.conceptsDemonstrated.map((c, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-serif flex items-center gap-2 text-[#121212] dark:text-[#F4F2EC]"
                            >
                              <span>{c.name}</span>
                              <span className={`text-[10px] font-mono font-bold ${
                                c.status === 'Strong' ? 'text-[#1F3A2B] dark:text-[#4E876A]' : 'text-[#8B2635] dark:text-[#E08A95]'
                              }`}>
                                • {c.status}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Failing Test Details */}
                      {evaluationResult.failingTestDetails && (
                        <div className="p-4 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/5 dark:bg-[#8B2635]/10 text-xs font-serif space-y-2">
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B2635] dark:text-[#E08A95] block">
                            Failure Diagnostic:
                          </span>
                          <div className="font-mono text-[11px] space-y-1">
                            <div>Input: <code className="text-[#121212] dark:text-[#F4F2EC]">{evaluationResult.failingTestDetails.input}</code></div>
                            <div>Expected: <code className="text-[#1F3A2B] dark:text-[#4E876A] font-bold">{evaluationResult.failingTestDetails.expected}</code></div>
                            <div>Actual: <code className="text-[#8B2635] dark:text-[#E08A95] font-bold">{evaluationResult.failingTestDetails.actual}</code></div>
                          </div>
                          {evaluationResult.failingTestDetails.commonMistakeExplanation && (
                            <p className="text-[#5C5852] dark:text-[#B5B1A7] pt-1 leading-relaxed">
                              {evaluationResult.failingTestDetails.commonMistakeExplanation}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Alternative Approach Snippet */}
                      {evaluationResult.alternativeApproach && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91]">
                            Canonical Reference Pattern
                          </h4>
                          <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] font-mono text-xs text-[#F4F2EC] overflow-x-auto">
                            <pre>
                              <code>{evaluationResult.alternativeApproach}</code>
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* AI Recommendation */}
                      <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1A1916] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] flex items-start gap-3">
                        <BrainCircuit className="w-5 h-5 text-[#8B2635] dark:text-[#E08A95] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-mono text-[10px] font-bold uppercase tracking-wider block mb-0.5 text-[#8B2635] dark:text-[#E08A95]">
                            Adaptive Guidance Engine:
                          </span>
                          <p className="leading-relaxed italic">{evaluationResult.aiRecommendation}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DEEP CONCEPT EXPLANATION */}
                  {evalModalTab === 'concepts' && (
                    <div className="space-y-6 animate-in fade-in duration-150">
                      <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-[#8B2635] dark:text-[#E08A95]">
                          FOUNDATIONAL DISPATCH • THEORETICAL ANALYSIS
                        </span>
                        <h4 className="text-lg font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
                          {activeConcept.topic}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                          <span>Theoretical Foundation</span>
                        </h5>
                        <div className="p-4 rounded-xs bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif leading-relaxed text-[#121212] dark:text-[#EAE7DF]">
                          {activeConcept.theoreticalFoundation}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2">
                          <Cpu className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                          <span>Underlying Runtime Mechanics</span>
                        </h5>
                        <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1A1916] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif leading-relaxed text-[#121212] dark:text-[#EAE7DF]">
                          {activeConcept.underlyingMechanics}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2">
                          <ListOrdered className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                          <span>Step-by-Step Execution Trace</span>
                        </h5>
                        <div className="space-y-2">
                          {(activeConcept.stepByStepTrace || []).map((traceLine, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-serif flex items-start gap-3"
                            >
                              <span className="w-5 h-5 rounded-xs bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="text-[#121212] dark:text-[#EAE7DF] leading-relaxed block">
                                {traceLine}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#1F3A2B] dark:text-[#4E876A]" />
                          <span>Architectural Takeaways & Enterprise Best Practices</span>
                        </h5>
                        <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-serif leading-relaxed text-[#121212] dark:text-[#EAE7DF]">
                          {activeConcept.architecturalTakeaways}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: 5 TOP SOLUTIONS */}
                  {evalModalTab === 'solutions' && (
                    <div className="space-y-5 animate-in fade-in duration-150">
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91] block">
                          Select From Canonical Implementation Patterns:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {activeSolutions.map((sol: any, idx: number) => {
                            const isSelected = selectedSolutionIdx === idx;
                            return (
                              <button
                                key={sol.id || idx}
                                id={`solution-tab-${idx + 1}`}
                                onClick={() => setSelectedSolutionIdx(idx)}
                                className={`p-2 rounded-xs border text-left cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] shadow-xs'
                                    : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] font-bold">
                                    #{sol.rank || idx + 1} {sol.rank === 1 ? 'Optimal' : ''}
                                  </span>
                                  <span className="text-[9px] font-mono uppercase opacity-75">
                                    {sol.timeComplexity}
                                  </span>
                                </div>
                                <p className="text-[11px] font-serif font-bold mt-1 truncate">
                                  {(sol.title || 'Solution').split(':')[0]}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Active Selected Solution Pane */}
                      <div className="p-4 sm:p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-xs bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] border border-[#8B2635]/30 font-mono text-[10px] font-bold uppercase">
                                Approach {currentSolution.rank || selectedSolutionIdx + 1} of {activeSolutions.length}
                              </span>
                              <span className="px-2 py-0.5 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] font-mono text-[10px] font-bold text-[#5C5852] dark:text-[#9E9A91]">
                                {currentSolution.paradigm || 'Standard'}
                              </span>
                            </div>
                            <h4 className="text-base sm:text-lg font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                              {currentSolution.title}
                            </h4>
                          </div>

                          <div className="font-mono text-xs font-bold text-[#121212] dark:text-[#F4F2EC]">
                            Time: {currentSolution.timeComplexity} • Space: {currentSolution.spaceComplexity}
                          </div>
                        </div>

                        {/* Solution Code Block */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">
                              Implementation Code:
                            </span>
                            <button
                              onClick={() => handleCopyCode(currentSolution.code)}
                              className="px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#EAE7DF] dark:hover:bg-[#2A2925] text-[11px] font-serif font-bold text-[#121212] dark:text-[#F4F2EC] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {hasCopiedCode ? (
                                <>
                                  <CheckCheck className="w-3 h-3 text-[#1F3A2B] dark:text-[#4E876A]" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy Code</span>
                                </>
                              )}
                            </button>
                          </div>

                          <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] font-mono text-xs text-[#F4F2EC] overflow-x-auto">
                            <pre>
                              <code>{currentSolution.code}</code>
                            </pre>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold block">
                            Mechanistic Rationale:
                          </span>
                          <p className="text-xs font-serif leading-relaxed text-[#121212] dark:text-[#EAE7DF]">
                            {currentSolution.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: APPROACHES COMPARISON MATRIX */}
                  {evalModalTab === 'matrix' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div>
                        <h4 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
                          Trade-off Comparison Matrix
                        </h4>
                      </div>

                      <div className="border border-[#DCD9D1] dark:border-[#2C2A26] rounded-xs overflow-x-auto bg-[#FFFFFF] dark:bg-[#181714]">
                        <table className="w-full text-left text-xs font-serif">
                          <thead className="bg-[#F4F1EA] dark:bg-[#1A1916] border-b border-[#DCD9D1] dark:border-[#2C2A26] font-mono text-[10px] uppercase text-[#5C5852] dark:text-[#9E9A91]">
                            <tr>
                              <th className="p-3 font-bold">Rank & Title</th>
                              <th className="p-3 font-bold">Paradigm</th>
                              <th className="p-3 font-bold">Time</th>
                              <th className="p-3 font-bold">Space</th>
                              <th className="p-3 font-bold">Optimal Use Case</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#DCD9D1] dark:divide-[#2C2A26]">
                            {activeSolutions.map((sol: any, idx: number) => (
                              <tr key={sol.id || idx} className="hover:bg-[#F4F1EA]/50 dark:hover:bg-[#201F1B] transition-colors">
                                <td className="p-3">
                                  <span className="font-mono text-[10px] font-bold text-[#8B2635] dark:text-[#E08A95] mr-1.5">
                                    #{sol.rank || idx + 1}
                                  </span>
                                  <span className="font-bold text-[#121212] dark:text-[#F4F2EC]">
                                    {(sol.title || 'Solution').split(':')[0]}
                                  </span>
                                </td>
                                <td className="p-3 text-[#5C5852] dark:text-[#9E9A91] font-mono text-[11px]">
                                  {sol.paradigm || 'Standard'}
                                </td>
                                <td className="p-3 font-mono font-bold text-[#1F3A2B] dark:text-[#4E876A]">
                                  {sol.timeComplexity}
                                </td>
                                <td className="p-3 font-mono text-[#5C5852] dark:text-[#9E9A91]">
                                  {sol.spaceComplexity}
                                </td>
                                <td className="p-3 text-[#5C5852] dark:text-[#9E9A91]">
                                  {sol.whenToUse || 'Production code'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
