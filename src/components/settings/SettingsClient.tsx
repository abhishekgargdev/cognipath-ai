'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Clock,
  Moon,
  Sun,
  Check,
  Save,
  RotateCcw,
  BookOpen,
  Award,
  Sparkles,
  Tag,
} from 'lucide-react';
import { useUIStore } from '@/providers/ui-store';
import { Button, SettingsSkeleton } from '@/components/common';
import { toast } from 'sonner';

export function SettingsClient() {
  const router = useRouter();
  const { theme, setTheme } = useUIStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [targetGoal, setTargetGoal] = useState('');
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [experienceLevel, setExperienceLevel] = useState<'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [learningReason, setLearningReason] = useState('');
  const [enrolledSkills, setEnrolledSkills] = useState<Array<{ skillId: string; name: string; level?: string }>>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/users/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setName(data.user.name || '');
            setEmail(data.user.email || '');
          }
          if (data.profile) {
            setTargetGoal(data.profile.targetGoal || 'Full Stack Architect');
            setDailyMinutes(data.profile.dailyCommitmentMinutes || 30);
            setExperienceLevel(data.profile.experienceLevel || 'Intermediate');
            setLearningReason(data.profile.learningReason || '');
            if (data.profile.theme) {
              setTheme(data.profile.theme);
            }
          }
          if (data.skills && Array.isArray(data.skills)) {
            setEnrolledSkills(data.skills);
          }
        }
      } catch (err) {
        console.error('Failed to load profile settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [setTheme]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          targetGoal,
          experienceLevel,
          dailyCommitmentMinutes: dailyMinutes,
          learningReason,
          theme,
        }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        toast.success('Profile preferences successfully committed');
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        toast.error('Failed to update profile preferences');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      toast.error('An unexpected error occurred while saving preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div id="settings-view" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
          Profile & Learning Setup
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Account Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          Manage your personal dossier, target goals, daily study budget, enrolled skills, and visual presentation.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details Card */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            <span>Personal Dossier</span>
          </h3>

          <div className="flex items-center gap-4 pb-2">
            <div className="w-14 h-14 rounded-full bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] flex items-center justify-center font-serif text-xl font-bold border border-[#DCD9D1] dark:border-[#2C2A26] shrink-0">
              {(name || email || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                {name || 'Learner'}
              </p>
              <p className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">{email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] font-mono text-[9px] uppercase tracking-wider font-semibold">
                {experienceLevel} Tier
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5">
                Target Career / Goal
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="e.g. Full Stack Developer, AI Engineer"
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                <span>Experience Level</span>
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              >
                <option value="Complete Beginner">Complete Beginner</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#8B2635] dark:text-[#E08A95]" />
                <span>Primary Motivation / Objective</span>
              </label>
              <input
                type="text"
                value={learningReason}
                onChange={(e) => setLearningReason(e.target.value)}
                placeholder="e.g. Preparing for interviews, Upskilling at work"
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>
          </div>
        </div>

        {/* Enrolled Skills Overview */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
              <span>Enrolled Skills ({enrolledSkills.length})</span>
            </h3>
            <button
              type="button"
              onClick={() => router.push('/skills')}
              className="text-xs font-serif font-bold text-[#8B2635] dark:text-[#E08A95] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Manage Skills</span>
            </button>
          </div>

          {enrolledSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2 pt-1">
              {enrolledSkills.map((s) => (
                <span
                  key={s.skillId}
                  className="px-3 py-1.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] flex items-center gap-1.5"
                >
                  <span className="font-semibold">{s.name}</span>
                  {s.level && (
                    <span className="text-[9px] font-mono text-[#8B2635] dark:text-[#E08A95] uppercase font-bold">
                      • {s.level}
                    </span>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
              No skills enrolled yet. Visit the Skills page or complete onboarding to select skills.
            </p>
          )}
        </div>

        {/* Learning Pacing & Time Commitment */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            <span>Daily Time Commitment</span>
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-serif text-[#121212] dark:text-[#F4F2EC]">
              Targeted Daily Commitment: <span className="font-bold text-[#8B2635] dark:text-[#E08A95]">{dailyMinutes} minutes / day</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDailyMinutes(mins)}
                  className={`px-3.5 py-2 rounded-xs text-xs font-serif transition-colors cursor-pointer border ${
                    dailyMinutes === mins
                      ? 'border-[#121212] dark:border-[#F4F2EC] bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] font-bold'
                      : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#EAE7DF]'
                  }`}
                >
                  {mins} mins
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Appearance & Interface Theme */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
            Palette & Presentation Theme
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-3 rounded-xs border flex items-center gap-2 text-xs font-serif font-bold cursor-pointer ${
                theme === 'light'
                  ? 'border-[#121212] bg-[#F4F1EA] text-[#121212]'
                  : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] text-[#5C5852] dark:text-[#9E9A91]'
              }`}
            >
              <Sun className="w-4 h-4 text-[#8B2635]" />
              <span>Editorial Light</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-3 rounded-xs border flex items-center gap-2 text-xs font-serif font-bold cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#F4F2EC] bg-[#201F1B] text-[#F4F2EC]'
                  : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] text-[#5C5852] dark:text-[#9E9A91]'
              }`}
            >
              <Moon className="w-4 h-4 text-[#E08A95]" />
              <span>Nocturnal Dark</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/onboarding?mode=edit')}
            className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-run Onboarding Survey</span>
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-mono font-bold text-[#1F3A2B] dark:text-[#4E876A] flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Preferences Saved!
              </span>
            )}
            <Button
              type="submit"
              disabled={isSaving}
              isLoading={isSaving}
              loadingText="Saving Preferences..."
              variant="primary"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
