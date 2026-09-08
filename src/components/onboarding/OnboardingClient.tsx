'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  X,
  BrainCircuit,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/common';
import { defaultSkillsCatalog } from '@/lib/data/skills-catalog';

type CareerGoal =
  | 'Full Stack Developer'
  | 'AI Engineer'
  | 'Backend Engineer'
  | 'Frontend Developer'
  | 'Technical Interview Preparation'
  | 'Software Engineer'
  | string;

type ExperienceLevel = 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';

interface SkillProficiency {
  skillId: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const GOAL_OPTIONS: { id: string; label: string; icon: string; desc: string }[] = [
  { id: 'Full Stack Developer', label: 'Full Stack Engineer', icon: '💻', desc: 'React, Node.js, relational schema design, APIs, and modern distributed architecture.' },
  { id: 'AI Engineer', label: 'AI Systems Engineer', icon: '🤖', desc: 'LLM pipelines, RAG architecture, cognitive agents, Python, and model inference.' },
  { id: 'Backend Engineer', label: 'Backend Architect', icon: '⚙️', desc: 'High-throughput APIs, distributed concurrency, SQL tuning, and microservices.' },
  { id: 'Frontend Developer', label: 'Frontend Specialist', icon: '🎨', desc: 'Modern React, Next.js, render lifecycle performance, and responsive interfaces.' },
  { id: 'Technical Interview Preparation', label: 'Technical Interview Prep', icon: '🎯', desc: 'DSA, Big-O asymptotic analysis, system design blueprints, and mock reviews.' },
  { id: 'Software Engineer', label: 'Software Engineer', icon: '🚀', desc: 'Core programming, architectural paradigms, clean design, and cloud toolchains.' },
];

const REASON_OPTIONS = [
  'Switch careers into technical engineering',
  'Land a competitive software developer appointment',
  'Attain promotion to Senior Staff Architect',
  'Build and deploy independent software products',
  'Prepare for rigorous technical examinations',
  'Deepen fundamental architectural scholarship',
];

const TIME_OPTIONS = [
  { minutes: 15, label: '15 mins / day', desc: 'Micro-scholarship cadence' },
  { minutes: 30, label: '30 mins / day', desc: 'Recommended equilibrium', recommended: true },
  { minutes: 45, label: '45 mins / day', desc: 'Accelerated acquisition' },
  { minutes: 60, label: '1 hour / day', desc: 'Rigorous immersion' },
  { minutes: 120, label: '2+ hours / day', desc: 'Full-time dedicated study' },
];

const PREFERENCE_OPTIONS = [
  'Concept Treatises',
  'Practical Implementations',
  'Interactive Coding',
  'Architectural Schematics',
  'Diagnostic Debugging',
  'Industrial Case Studies',
  'Rigorous Technical Inquiries',
  'Structural Code Reviews',
];

export function OnboardingClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 6;

  // Form State
  const [selectedGoal, setSelectedGoal] = useState<CareerGoal>('Full Stack Developer');
  const [customGoal, setCustomGoal] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<SkillProficiency[]>([
    { skillId: 'js', name: 'JavaScript', level: 'Intermediate' },
    { skillId: 'react', name: 'React', level: 'Intermediate' },
    { skillId: 'nodejs', name: 'Node.js', level: 'Beginner' },
    { skillId: 'sql', name: 'SQL & PostgreSQL', level: 'Beginner' },
  ]);
  const [skillCategoryFilter, setSkillCategoryFilter] = useState<string>('All');
  const [commaSkillsInput, setCommaSkillsInput] = useState<string>('');
  const [overallExperience, setOverallExperience] = useState<ExperienceLevel>('Intermediate');
  const [selectedReason, setSelectedReason] = useState<string>('Switch careers into technical engineering');
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [preferences, setPreferences] = useState<string[]>([
    'Concept Treatises',
    'Interactive Coding',
    'Diagnostic Debugging',
    'Architectural Schematics',
  ]);

  // Submission & Generation State
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const generationLog = [
    'Analyzing target role: ' + (customGoal || selectedGoal) + '...',
    'Mapping selected skills and calculating prerequisite DAG...',
    'Invoking CogniPath AI Abstraction Layer for roadmap synthesis...',
    'Benchmarking current experience level & strengths...',
    'Sequencing modular learning nodes & milestones...',
    'Persisting user syllabus profile & node progress to MongoDB...',
    'Personalized AI learning roadmap successfully generated!',
  ];

  useEffect(() => {
    if (currentStep === 6 && !isSubmitting) {
      setIsSubmitting(true);
      setSubmitError(null);

      // Animate progress log while triggering API submit
      const interval = setInterval(() => {
        setGenerationStep((prev) => (prev < generationLog.length - 2 ? prev + 1 : prev));
      }, 800);

      const submitOnboarding = async () => {
        try {
          const res = await fetch('/api/onboarding/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              targetGoal: selectedGoal,
              customGoal,
              experienceLevel: overallExperience,
              selectedSkills,
              learningReason: selectedReason,
              dailyCommitmentMinutes: dailyMinutes,
              learningPreferences: preferences,
            }),
          });

          clearInterval(interval);

          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to complete onboarding');
          }

          setGenerationStep(generationLog.length - 1);
          toast.success('Curricular blueprint successfully synthesized!');

          setTimeout(() => {
            router.push('/dashboard');
          }, 1200);
        } catch (err: any) {
          clearInterval(interval);
          setIsSubmitting(false);
          const errorMsg = err.message || 'An error occurred during roadmap generation.';
          setSubmitError(errorMsg);
          toast.error(errorMsg);
        }
      };

      submitOnboarding();

      return () => clearInterval(interval);
    }
  }, [currentStep, isSubmitting, customGoal, selectedGoal, overallExperience, selectedSkills, selectedReason, dailyMinutes, preferences, generationLog.length, router]);

  const toggleSkill = (skillId: string, skillName: string) => {
    if (selectedSkills.some((s) => s.skillId === skillId)) {
      setSelectedSkills((prev) => prev.filter((s) => s.skillId !== skillId));
    } else {
      setSelectedSkills((prev) => [...prev, { skillId, name: skillName, level: 'Beginner' }]);
    }
  };

  const handleAddCommaSkills = () => {
    if (!commaSkillsInput.trim()) return;
    const items = commaSkillsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    setSelectedSkills((prev) => {
      const next = [...prev];
      items.forEach((rawName) => {
        const exists = next.some((s) => s.name.toLowerCase() === rawName.toLowerCase());
        if (!exists) {
          const match = defaultSkillsCatalog.find((cs) => cs.name.toLowerCase() === rawName.toLowerCase());
          next.push({
            skillId: match ? match.id : `custom-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
            name: match ? match.name : rawName,
            level: 'Beginner',
          });
        }
      });
      return next;
    });
    setCommaSkillsInput('');
  };

  const updateSkillLevel = (skillId: string, level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setSelectedSkills((prev) =>
      prev.map((s) => (s.skillId === skillId ? { ...s, level } : s))
    );
  };

  const togglePreference = (pref: string) => {
    setPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    );
  };

  const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Databases', 'Engineering', 'AI'];
  const filteredCatalog =
    skillCategoryFilter === 'All'
      ? defaultSkillsCatalog
      : defaultSkillsCatalog.filter((s) => s.category === skillCategoryFilter);

  return (
    <div
      id="onboarding-container"
      className="min-h-screen bg-[#F9F7F2] dark:bg-[#121210] text-[#121212] dark:text-[#F4F2EC] flex flex-col justify-between p-4 sm:p-8 selection:bg-[#EAE7DF]"
    >
      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212] shadow-xs">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <span className="font-serif font-black text-sm tracking-tight text-[#121212] dark:text-[#F4F2EC]">
            CogniPath <span className="text-[#8B2635] dark:text-[#E08A95] font-serif italic">AI</span>
          </span>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-wider text-[10px]">
            Syllabus Section {currentStep} of {totalSteps}
          </span>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((st) => (
              <div
                key={st}
                className={`h-1.5 rounded-xs transition-all ${
                  st === currentStep
                    ? 'w-6 bg-[#121212] dark:bg-[#F4F2EC]'
                    : st < currentStep
                    ? 'w-3 bg-[#8B2635] dark:bg-[#E08A95]'
                    : 'w-3 bg-[#DCD9D1] dark:bg-[#2C2A26]'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Step Content */}
      <div className="max-w-3xl w-full mx-auto my-auto py-8">
        {/* STEP 1 */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                01 Objective Trajectory
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                What architectural discipline are you working toward?
              </h1>
              <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2">
                We construct your learning syllabus backwards from your exact technical career destination.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GOAL_OPTIONS.map((goal) => {
                const isSelected = selectedGoal === goal.id && !customGoal;
                return (
                  <div
                    key={goal.id}
                    id={`goal-option-${goal.id}`}
                    onClick={() => {
                      setSelectedGoal(goal.id);
                      setCustomGoal('');
                    }}
                    className={`p-4 rounded-xs border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#201F1B] shadow-xs'
                        : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-2xl">{goal.icon}</span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212]">
                          <Check className="w-3.5 h-3.5 stroke-3" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-sm text-[#121212] dark:text-[#F4F2EC] mt-2">{goal.label}</h3>
                    <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1 leading-relaxed">{goal.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <label className="block text-xs font-serif font-bold text-[#5C5852] dark:text-[#A6A299] mb-1.5">
                Or designate a custom technical archetype:
              </label>
              <input
                id="custom-goal-input"
                type="text"
                placeholder="e.g. Distributed Systems Infrastructure Lead, Quantitative Developer..."
                value={customGoal}
                onChange={(e) => {
                  setCustomGoal(e.target.value);
                  if (e.target.value) setSelectedGoal(e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] font-serif text-sm text-[#121212] dark:text-[#F4F2EC] placeholder-[#9E9A91] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                02 Competency Matrix
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                Which technical competencies do you aim to master?
              </h1>
              <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2">
                Select the languages, frameworks, and paradigms. Our engine computes their prerequisite dependency graph.
              </p>
            </div>

            {selectedSkills.length > 0 && (
              <div className="p-3 rounded-xs bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] flex flex-wrap gap-2 items-center">
                <span className="text-xs font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold mr-1">
                  Designated ({selectedSkills.length}):
                </span>
                {selectedSkills.map((s) => (
                  <span
                    key={s.skillId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#121212] dark:text-[#F4F2EC] font-serif text-xs font-bold"
                  >
                    {s.name}
                    <button
                      type="button"
                      onClick={() => toggleSkill(s.skillId, s.name)}
                      className="text-[#8B2635] dark:text-[#E08A95] hover:text-[#121212] dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            <div className="p-3.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] space-y-2">
              <label className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] flex items-center justify-between">
                <span>Quick Add Skills (Comma-Separated):</span>
                <span className="text-[10px] font-mono text-[#5C5852] dark:text-[#9E9A91] font-normal">Press Enter to add</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="onboarding-comma-skills-input"
                  type="text"
                  placeholder="e.g. React, TypeScript, GraphQL, Docker, Rust..."
                  value={commaSkillsInput}
                  onChange={(e) => setCommaSkillsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCommaSkills();
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] placeholder-[#9E9A91] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
                />
                <button
                  type="button"
                  onClick={handleAddCommaSkills}
                  disabled={!commaSkillsInput.trim()}
                  className="px-4 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] text-white dark:text-[#121212] text-xs font-serif font-bold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSkillCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold transition-colors border ${
                    skillCategoryFilter === cat
                      ? 'bg-[#121212] dark:bg-[#F4F2EC] text-white dark:text-[#121212] border-[#121212] dark:border-[#F4F2EC]'
                      : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#A6A299] border-[#DCD9D1] dark:border-[#2C2A26] hover:text-[#121212] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCatalog.map((skill) => {
                const isSelected = selectedSkills.some((s) => s.skillId === skill.id);
                return (
                  <div
                    key={skill.id}
                    id={`skill-chip-${skill.id}`}
                    onClick={() => toggleSkill(skill.id, skill.name)}
                    className={`p-3 rounded-xs border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#201F1B] ring-1 ring-[#121212] dark:ring-[#F4F2EC]'
                        : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#121212] dark:text-[#F4F2EC] hover:border-[#121212] dark:hover:border-[#F4F2EC]'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-serif font-bold text-xs truncate">{skill.name}</p>
                      <p className="text-[10px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] capitalize">{skill.category}</p>
                    </div>
                    {isSelected ? (
                      <div className="w-4 h-4 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212] shrink-0 ml-1">
                        <Check className="w-3 h-3 stroke-3" />
                      </div>
                    ) : (
                      <span className="text-[9px] text-[#9E9A91] font-mono shrink-0 uppercase">
                        {skill.difficulty.slice(0, 3)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                03 Baseline Diagnostic
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                Where does your proficiency currently sit?
              </h1>
              <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2">
                We calibrate topic pacing and difficulty so you never waste time re-learning what you already know.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {(['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'] as ExperienceLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setOverallExperience(lvl)}
                  className={`p-3.5 rounded-xs border text-center transition-all ${
                    overallExperience === lvl
                      ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC] ring-1 ring-[#121212] dark:ring-[#F4F2EC]'
                      : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#A6A299] hover:border-[#121212] dark:hover:text-[#F4F2EC]'
                  }`}
                >
                  <p className="font-serif font-bold text-xs">{lvl}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                Calibrate baseline tier for chosen competencies:
              </label>
              <div className="divide-y divide-[#DCD9D1] dark:divide-[#2C2A26] max-h-60 overflow-y-auto border border-[#DCD9D1] dark:border-[#2C2A26] rounded-xs bg-[#FFFFFF] dark:bg-[#181714] p-1">
                {selectedSkills.map((skill) => (
                  <div key={skill.skillId} className="flex items-center justify-between p-2.5">
                    <span className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{skill.name}</span>
                    <div className="flex gap-1">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => updateSkillLevel(skill.skillId, lvl)}
                          className={`px-2.5 py-1 rounded-xs text-[10px] font-mono uppercase tracking-wider transition-colors border ${
                            skill.level === lvl
                              ? 'bg-[#121212] dark:bg-[#F4F2EC] text-white dark:text-[#121212] border-[#121212] dark:border-[#F4F2EC] font-bold'
                              : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#A6A299] hover:text-[#121212]'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                04 Strategic Intent
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                What is your central imperative for learning?
              </h1>
              <p className="text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-2">
                Understanding your fundamental driver allows the synthesizer to adjust algorithmic rigor vs pragmatic delivery velocity.
              </p>
            </div>

            <div className="space-y-2.5">
              {REASON_OPTIONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <div
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`p-3.5 rounded-xs border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#201F1B] ring-1 ring-[#121212] dark:ring-[#F4F2EC]'
                        : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#A6A299] hover:border-[#121212]'
                    }`}
                  >
                    <span className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{reason}</span>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212]">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
                05 Cadence & Didactic Style
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] mt-1">
                What daily time commitment can you sustainably preserve?
              </h1>
              <p className="text-sm font-serif italic text-[#8B2635] dark:text-[#E08A95] font-medium mt-1">
                "Disciplined consistency surpasses sporadic intensity."
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {TIME_OPTIONS.map((time) => {
                const isSelected = dailyMinutes === time.minutes;
                return (
                  <div
                    key={time.minutes}
                    onClick={() => setDailyMinutes(time.minutes)}
                    className={`p-3.5 rounded-xs border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#FFFFFF] dark:bg-[#201F1B] ring-1 ring-[#121212] dark:ring-[#F4F2EC]'
                        : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#A6A299] hover:border-[#121212]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Clock className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
                      {time.recommended && (
                        <span className="text-[9px] font-mono uppercase font-bold border border-[#8B2635]/30 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95] px-1.5 py-0.5 rounded-xs">
                          Optimal
                        </span>
                      )}
                    </div>
                    <p className="font-serif font-bold text-xs text-[#121212] dark:text-[#F4F2EC] mt-2">{time.label}</p>
                    <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-0.5">{time.desc}</p>
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-2">
                Preferred Didactic Modes: (Select all applicable)
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFERENCE_OPTIONS.map((pref) => {
                  const isChecked = preferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold border transition-colors ${
                        isChecked
                          ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#121212] dark:bg-[#F4F2EC] text-white dark:text-[#121212]'
                          : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#A6A299] hover:border-[#121212] dark:hover:text-white'
                      }`}
                    >
                      {pref}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6 */}
        {currentStep === 6 && (
          <div className="space-y-6 text-center max-w-lg mx-auto py-6 animate-in fade-in duration-300">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
              <div className="w-16 h-16 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#121212] dark:bg-[#F4F2EC] flex items-center justify-center text-white dark:text-[#121212] shadow-xs">
                <BrainCircuit className="w-8 h-8 animate-pulse" />
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
                Synthesizing Curricular Blueprint
              </h2>
              <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
                The CogniPath AI engine is generating your customized daily learning roadmap.
              </p>
            </div>

            {submitError && (
              <div className="p-4 rounded-xs bg-[#8B2635]/10 border border-[#8B2635] text-[#8B2635] text-xs font-serif text-left">
                <p className="font-bold">Roadmap Generation Failed</p>
                <p className="mt-1">{submitError}</p>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="mt-3 px-3 py-1 bg-[#8B2635] text-white rounded-xs font-serif font-bold text-xs"
                >
                  Return to Edit Options
                </button>
              </div>
            )}

            {!submitError && (
              <div className="p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-left font-mono text-xs space-y-2 shadow-xs">
                {generationLog.map((log, index) => {
                  if (index > generationStep) return null;
                  const isCurrent = index === generationStep;
                  return (
                    <div
                      key={log}
                      className={`flex items-center gap-2 ${
                        isCurrent
                          ? 'text-[#8B2635] dark:text-[#E08A95] font-bold'
                          : 'text-[#5C5852] dark:text-[#9E9A91]'
                      }`}
                    >
                      {index < generationStep ? (
                        <Check className="w-3.5 h-3.5 text-[#1F3A2B] dark:text-[#4E876A] shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-[#8B2635] dark:border-[#E08A95] border-t-transparent animate-spin shrink-0" />
                      )}
                      <span className="truncate">{log}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      {currentStep < 6 && (
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between pt-6 border-t border-[#DCD9D1] dark:border-[#2C2A26]">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xs text-xs font-serif font-bold text-[#5C5852] dark:text-[#A6A299] hover:text-[#121212] dark:hover:text-[#F4F2EC] transition-colors cursor-pointer ${
              currentStep === 1 ? 'opacity-0 pointer-events-none' : ''
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>

          <Button
            id="onboarding-next-step-btn"
            type="button"
            onClick={() => setCurrentStep((prev) => prev + 1)}
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {currentStep === 5 ? 'Synthesize Syllabus' : 'Proceed'}
          </Button>
        </div>
      )}
    </div>
  );
}
