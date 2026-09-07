import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Settings as SettingsIcon, 
  Clock, 
  Moon, 
  Sun, 
  Bell, 
  Check, 
  Sparkles,
  Save,
  RotateCcw
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, setUser, theme, toggleTheme, setActiveView } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [targetGoal, setTargetGoal] = useState(user.targetGoal);
  const [dailyMinutes, setDailyMinutes] = useState(user.dailyCommitmentMinutes);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prev => ({
      ...prev,
      name,
      email,
      targetGoal,
      dailyCommitmentMinutes: dailyMinutes
    }));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div id="settings-view" className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
          Apparatus & Disciplinary Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Curator Profile & Heuristic Calibration
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          Supervise pedagogical parameters, career trajectory benchmarks, daily time budgets, and typographic presentation.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details Card */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            <span>Scholar Dossier</span>
          </h3>

          <div className="flex items-center gap-4 pb-2">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-14 h-14 rounded-full object-cover border border-[#DCD9D1] dark:border-[#2C2A26]"
            />
            <div>
              <p className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">{user.name}</p>
              <p className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] font-mono text-[9px] uppercase tracking-wider font-semibold">
                {user.experienceLevel} Tier
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>

            <div>
              <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1.5">
                Targeted Career Discipline
              </label>
              <input
                type="text"
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>
          </div>
        </div>

        {/* Learning Pacing & Time Commitment */}
        <div className="p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
          <h3 className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
            <span>Temporal Commitment Calibration</span>
          </h3>

          <div className="space-y-2">
            <label className="block text-xs font-serif text-[#121212] dark:text-[#F4F2EC]">
              Targeted Daily Diligence: <span className="font-bold text-[#8B2635] dark:text-[#E08A95]">{dailyMinutes} minutes / day</span>
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
            Palette & Typography Presentation
          </h3>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => { if (theme !== 'light') toggleTheme(); }}
              className={`p-3 rounded-xs border flex items-center gap-2 text-xs font-serif font-bold cursor-pointer ${
                theme === 'light'
                  ? 'border-[#121212] bg-[#F4F1EA] text-[#121212]'
                  : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] text-[#5C5852] dark:text-[#9E9A91]'
              }`}
            >
              <Sun className="w-4 h-4 text-[#8B2635]" />
              <span>Editorial Journal (Light)</span>
            </button>

            <button
              type="button"
              onClick={() => { if (theme !== 'dark') toggleTheme(); }}
              className={`p-3 rounded-xs border flex items-center gap-2 text-xs font-serif font-bold cursor-pointer ${
                theme === 'dark'
                  ? 'border-[#F4F2EC] bg-[#201F1B] text-[#F4F2EC]'
                  : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] text-[#5C5852] dark:text-[#9E9A91]'
              }`}
            >
              <Moon className="w-4 h-4 text-[#E08A95]" />
              <span>Nocturnal Ink (Dark)</span>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => setActiveView('onboarding')}
            className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Re-initiate Diagnostic Induction Survey</span>
          </button>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-xs font-mono font-bold text-[#1F3A2B] dark:text-[#4E876A] flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> Dossier Updated!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-xs flex items-center gap-2 border border-[#121212] dark:border-[#F4F2EC] shadow-xs cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Commit Dossier Preferences</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
