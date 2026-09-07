'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  X,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';

export interface ClientLessonSection {
  id: string;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  highlightNote?: string;
  calloutType?: 'info' | 'warning' | 'tip';
  sequenceOrder?: number;
}

export interface ClientLessonAntiPattern {
  id?: string;
  title: string;
  mistakeCode: string;
  correctionCode: string;
  explanation: string;
  sequenceOrder?: number;
}

export interface ClientLessonKnowledgeCheck {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sequenceOrder?: number;
}

export interface ClientLesson {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  masteryLevel: number;
  whyYouAreLearningThis: string;
  keyTakeaways: string[];
  sections: ClientLessonSection[];
  antiPatterns: ClientLessonAntiPattern[];
  knowledgeCheck?: ClientLessonKnowledgeCheck[];
}

export interface LearnClientProps {
  lesson: ClientLesson;
}

export function LearnClient({ lesson }: LearnClientProps) {
  const router = useRouter();

  // Knowledge check state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    const kc = lesson.knowledgeCheck?.find((q) => q.id === questionId);
    if (kc) {
      if (optionIndex === kc.correctIndex) {
        toast.success('Correct answer!');
      } else {
        toast.error('Incorrect option. Review explanation below.');
      }
    }
  };

  const handleStartPractice = () => {
    router.push(`/practice?topicId=${lesson.topicId}`);
  };

  return (
    <div id="learn-view" className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200 p-4 sm:p-6">
      {/* Lesson Header Banner */}
      <div className="p-6 sm:p-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs relative overflow-hidden border-t-3 border-t-[#8B2635] dark:border-t-[#E08A95]">
        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="px-2.5 py-0.5 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] font-bold uppercase font-mono tracking-[0.2em] text-[9px]">
            TREATISE & LESSON
          </span>
          <span className="text-[#9E9A91]">•</span>
          <span className="flex items-center gap-1 text-[#5C5852] dark:text-[#9E9A91] font-mono text-[11px]">
            <Clock className="w-3.5 h-3.5" /> ~{lesson.estimatedMinutes} mins
          </span>
          <span className="text-[#9E9A91]">•</span>
          <span className="text-[#5C5852] dark:text-[#9E9A91] font-mono text-[11px]">
            Difficulty: {lesson.difficulty}
          </span>
          <span className="text-[#9E9A91]">•</span>
          <span className="text-[#121212] dark:text-[#F4F2EC] font-mono text-[11px] font-bold">
            {lesson.masteryLevel}% Mastery Index
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight">
          {lesson.title}
        </h1>
        <p className="text-base font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2 max-w-3xl leading-relaxed">
          {lesson.subtitle}
        </p>

        {/* Pedagogical Objective */}
        <div className="mt-5 p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1E1D19] border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#8B2635] dark:text-[#E08A95] block mb-1">
            PEDAGOGICAL OBJECTIVE
          </span>
          <p className="font-serif italic text-xs leading-relaxed text-[#121212] dark:text-[#F4F2EC]">
            "{lesson.whyYouAreLearningThis}"
          </p>
        </div>

        {/* Action Jump */}
        <div className="mt-5 flex items-center justify-between pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
          <div className="flex items-center gap-2 text-xs text-[#5C5852] dark:text-[#9E9A91] font-mono">
            <span>Topic ID:</span>
            <span className="px-2 py-0.5 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-[10px] font-medium text-[#121212] dark:text-[#F4F2EC]">
              {lesson.topicId}
            </span>
          </div>

          <button
            type="button"
            onClick={handleStartPractice}
            className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:text-[#8B2635] dark:hover:text-[#E08A95] underline cursor-pointer"
          >
            I already know this → Proceed to Practice
          </button>
        </div>
      </div>

      {/* Main Content Layout with Sticky TOC */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left 3 Columns: Lesson Narrative & Sections */}
        <div className="lg:col-span-3 space-y-10">
          {lesson.sections.map((section) => (
            <div key={section.id} id={section.id} className="space-y-4">
              <h2 className="text-2xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2">
                {section.title}
              </h2>

              <div className="text-sm font-serif text-[#121212] dark:text-[#EAE7DF] leading-relaxed whitespace-pre-line">
                {section.content}
              </div>

              {/* Highlight Note */}
              {section.highlightNote && (
                <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1E1D19] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs text-[#121212] dark:text-[#F4F2EC] flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95] shrink-0 mt-0.5" />
                  <p className="font-serif leading-relaxed italic">{section.highlightNote}</p>
                </div>
              )}

              {/* Code Snippet */}
              {section.codeSnippet && (
                <div className="rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#121212] overflow-hidden shadow-xs">
                  {section.codeSnippet.caption && (
                    <div className="px-4 py-2 border-b border-[#2C2A26] bg-[#1A1916] text-xs text-[#A6A299] font-mono flex items-center justify-between">
                      <span>{section.codeSnippet.caption}</span>
                      <span className="text-[10px] uppercase tracking-widest">
                        {section.codeSnippet.language}
                      </span>
                    </div>
                  )}
                  <pre className="p-4 text-xs font-mono text-[#F4F2EC] overflow-x-auto leading-relaxed">
                    <code>{section.codeSnippet.code}</code>
                  </pre>
                </div>
              )}
            </div>
          ))}

          {/* CONCEPT VISUALIZATION DIAGRAM */}
          <div id="visualization" className="space-y-4 pt-4">
            <h2 className="text-2xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2">
              Concept Architecture: Runtime Mechanics
            </h2>
            <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#A6A299] leading-relaxed">
              Optical breakdown of execution frames and persistent heap memory:
            </p>

            <div className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] font-mono text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B]">
                  <div className="text-[10px] font-bold text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-[0.2em] mb-2">
                    Execution Stack (Transient)
                  </div>
                  <div className="space-y-2">
                    <div className="p-2.5 rounded-xs bg-[#FFFFFF] dark:bg-[#141412] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC]">
                      [1] Execution Context (Invoked) <span className="text-[#8B2635] dark:text-[#E08A95] text-[10px] font-bold">(Active)</span>
                    </div>
                    <div className="p-2.5 rounded-xs bg-[#FFFFFF] dark:bg-[#141412] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC]">
                      [2] Global Environment
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xs border border-[#8B2635]/40 dark:border-[#E08A95]/40 bg-[#8B2635]/5 dark:bg-[#8B2635]/10">
                  <div className="text-[10px] font-bold text-[#8B2635] dark:text-[#E08A95] uppercase tracking-[0.2em] mb-2">
                    Heap Memory (Persisted Context)
                  </div>
                  <div className="p-3.5 rounded-xs border border-[#8B2635]/20 bg-[#FFFFFF] dark:bg-[#141412]">
                    <div className="text-[#8B2635] dark:text-[#E08A95] font-bold text-[11px] mb-1">
                      Lexical Environment Record
                    </div>
                    <div className="text-[#121212] dark:text-[#F4F2EC] space-y-0.5 text-[11px]">
                      <div>State bindings & scope chains;</div>
                      <div className="text-[#5C5852] dark:text-[#9E9A91] text-[10px]">
                        Reference count &gt; 0 (Retained)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] text-center text-[#5C5852] dark:text-[#9E9A91] text-[11px] font-serif">
                Garbage Collector State: Reachable from live closures? <strong className="text-[#8B2635] dark:text-[#E08A95]">YES</strong> → Retained.
              </div>
            </div>
          </div>

          {/* COMMON MISTAKES / ANTI-PATTERNS */}
          {lesson.antiPatterns && lesson.antiPatterns.length > 0 && (
            <div id="common-mistakes" className="space-y-4 pt-4">
              <h2 className="text-2xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2">
                Common Production Traps to Avoid
              </h2>

              <div className="space-y-4">
                {lesson.antiPatterns.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-3"
                  >
                    <div className="flex items-center gap-2 text-[#8B2635] dark:text-[#E08A95] text-xs font-serif font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{mistake.title}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                      {/* Mistake */}
                      <div className="p-3.5 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/5 dark:bg-[#8B2635]/10">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#8B2635] dark:text-[#E08A95] block mb-1">
                          The Bug
                        </span>
                        <pre className="text-[#121212] dark:text-[#F4F2EC] whitespace-pre-wrap">
                          <code>{mistake.mistakeCode}</code>
                        </pre>
                      </div>

                      {/* Fix */}
                      <div className="p-3.5 rounded-xs border border-[#1F3A2B]/30 bg-[#1F3A2B]/5 dark:bg-[#1F3A2B]/10">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-[#1F3A2B] dark:text-[#4E876A] block mb-1">
                          The Fix
                        </span>
                        <pre className="text-[#121212] dark:text-[#F4F2EC] whitespace-pre-wrap">
                          <code>{mistake.correctionCode}</code>
                        </pre>
                      </div>
                    </div>

                    <p className="text-xs font-serif text-[#5C5852] dark:text-[#B5B1A7] leading-relaxed pt-1">
                      {mistake.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KEY TAKEAWAYS */}
          <div id="summary" className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1C1B18] space-y-3">
            <h3 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
              <CheckCircle2 className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
              <span>Core Theoretical Axioms</span>
            </h3>
            <ul className="space-y-2">
              {lesson.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs font-serif text-[#121212] dark:text-[#F4F2EC] leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-none bg-[#8B2635] dark:bg-[#E08A95] mt-1.5 shrink-0" />
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* INLINE KNOWLEDGE CHECK QUIZ */}
          {lesson.knowledgeCheck && lesson.knowledgeCheck.length > 0 && (
            <div id="knowledge-check" className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2">
                <h2 className="text-2xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#8B2635] dark:text-[#E08A95]" />
                  <span>Knowledge Calibration Quiz</span>
                </h2>
                <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-wider">
                  {lesson.knowledgeCheck.length} Checkpoint Questions
                </span>
              </div>

              <div className="space-y-6">
                {lesson.knowledgeCheck.map((kc, qIdx) => {
                  const selectedOpt = selectedAnswers[kc.id];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === kc.correctIndex;

                  return (
                    <div
                      key={kc.id}
                      className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-3"
                    >
                      <p className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                        {qIdx + 1}. {kc.question}
                      </p>

                      <div className="space-y-2">
                        {kc.options.map((opt, oIdx) => {
                          const isThisSelected = selectedOpt === oIdx;
                          let optStyle =
                            'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#141412] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC]';
                          if (isAnswered) {
                            if (oIdx === kc.correctIndex) {
                              optStyle = 'border-[#1F3A2B] bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] font-bold';
                            } else if (isThisSelected) {
                              optStyle = 'border-[#8B2635] bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => handleSelectOption(kc.id, oIdx)}
                              disabled={isAnswered}
                              className={`w-full p-3 rounded-xs border text-xs font-serif text-left transition-all flex items-center justify-between cursor-pointer ${optStyle}`}
                            >
                              <span>{opt}</span>
                              {isAnswered && oIdx === kc.correctIndex && (
                                <Check className="w-4 h-4 text-[#1F3A2B] dark:text-[#4E876A] shrink-0 ml-2" />
                              )}
                              {isAnswered && isThisSelected && !isCorrect && (
                                <X className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95] shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isAnswered && (
                        <div
                          className={`p-3 rounded-xs text-xs font-serif leading-relaxed ${
                            isCorrect
                              ? 'bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] border border-[#1F3A2B]/20'
                              : 'bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] border border-[#8B2635]/20'
                          }`}
                        >
                          <span className="font-bold">{isCorrect ? 'Correct:' : 'Review this:'} </span>
                          {kc.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Call to Action for Practice */}
          <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#1A1916] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                Ready to reinforce this concept?
              </h3>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
                Take on today’s targeted problems to test real execution semantics and edge cases.
              </p>
            </div>

            <Button
              id="start-practice-from-lesson-btn"
              onClick={handleStartPractice}
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Commence Practice Exercises
            </Button>
          </div>
        </div>

        {/* Right 1 Column: Sticky Desktop Table of Contents */}
        <div className="hidden lg:block">
          <div className="sticky top-24 p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5C5852] dark:text-[#9E9A91] block pb-2 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
              SECTION INDEX
            </span>
            <nav className="space-y-1.5 text-xs font-serif">
              {lesson.sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="block text-[#5C5852] dark:text-[#B5B1A7] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors truncate"
                >
                  {section.title}
                </a>
              ))}
              <a href="#visualization" className="block text-[#5C5852] dark:text-[#B5B1A7] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors">
                Concept Architecture
              </a>
              {lesson.antiPatterns && lesson.antiPatterns.length > 0 && (
                <a href="#common-mistakes" className="block text-[#5C5852] dark:text-[#B5B1A7] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors">
                  Common Mistakes
                </a>
              )}
              <a href="#summary" className="block text-[#5C5852] dark:text-[#B5B1A7] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors">
                Key Takeaways
              </a>
              {lesson.knowledgeCheck && lesson.knowledgeCheck.length > 0 && (
                <a href="#knowledge-check" className="block text-[#8B2635] dark:text-[#E08A95] font-bold">
                  Knowledge Quiz ({lesson.knowledgeCheck.length})
                </a>
              )}
            </nav>

            <div className="pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
              <button
                type="button"
                onClick={handleStartPractice}
                className="w-full py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#121212] hover:text-white dark:hover:bg-[#F4F2EC] dark:hover:text-[#121212] text-[#121212] dark:text-[#F4F2EC] font-serif font-bold text-xs transition-colors cursor-pointer text-center block"
              >
                Jump to Practice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
