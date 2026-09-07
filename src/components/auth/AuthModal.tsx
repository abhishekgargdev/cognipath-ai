'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Sparkles, ArrowRight, UserCheck } from 'lucide-react';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleDemoSignIn = async () => {
    setIsLoading(true);
    await signIn('credentials', {
      email: email || 'demo@cognipath.ai',
      callbackUrl: '/',
    });
    setIsLoading(false);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await signIn('google', { callbackUrl: '/' });
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      setSubmittedMessage(`Password reset link dispatched to ${email || 'your email'}.`);
      setTimeout(() => {
        setIsForgotPassword(false);
        setSubmittedMessage(null);
      }, 2500);
      return;
    }

    handleDemoSignIn();
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#121212]/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        id="auth-modal-card"
        className="w-full max-w-md rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          id="close-auth-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC] p-1 cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/10 mx-auto flex items-center justify-center text-[#8B2635] dark:text-[#E08A95] mb-3 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
            {isForgotPassword 
              ? 'Recover Access Credentials'
              : authModalMode === 'login' 
              ? 'Access Academic Registry' 
              : 'Enroll in CogniPath AI'}
          </h2>
          <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-1">
            {isForgotPassword 
              ? 'Enter registered email to dispatch cryptographic recovery dispatch.'
              : 'Your personalized pedagogical syllabus awaits your verification.'}
          </p>
        </div>

        {submittedMessage ? (
          <div className="p-4 rounded-xs bg-[#1F3A2B]/10 border border-[#1F3A2B]/30 text-[#1F3A2B] dark:text-[#4E876A] font-serif text-xs text-center">
            {submittedMessage}
          </div>
        ) : (
          <>
            {/* Primary Auth Actions: Google & Quick Demo */}
            {!isForgotPassword && (
              <div className="space-y-2.5 mb-5">
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC] font-serif text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Authenticate via Google
                </button>

                <button
                  type="button"
                  id="demo-signin-btn"
                  onClick={handleDemoSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xs border border-[#8B2635]/40 bg-[#8B2635]/10 hover:bg-[#8B2635]/20 text-[#8B2635] dark:text-[#E08A95] font-serif text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
                  Continue as Demo Scholar
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#DCD9D1] dark:border-[#2C2A26]"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#FFFFFF] dark:bg-[#181714] px-2 text-[#9E9A91] font-mono text-[9px] tracking-widest">
                      Or institutional email
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {authModalMode === 'signup' && !isForgotPassword && (
                <div>
                  <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1">
                    Scholar Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full px-3 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-[#121212] dark:text-[#F4F2EC] font-serif text-xs focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@example.com"
                  className="w-full px-3 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-[#121212] dark:text-[#F4F2EC] font-serif text-xs focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
                />
              </div>

              {!isForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                      Secret Passphrase
                    </label>
                    {authModalMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(true)}
                        className="text-[11px] font-serif italic text-[#8B2635] dark:text-[#E08A95] hover:underline cursor-pointer"
                      >
                        Recover credential?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-[#121212] dark:text-[#F4F2EC] font-serif text-xs focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2 border border-[#121212] dark:border-[#F4F2EC] disabled:opacity-50"
              >
                <span>
                  {isForgotPassword
                    ? 'Dispatch Recovery Link'
                    : authModalMode === 'login'
                    ? 'Verify Credentials'
                    : 'Establish Scholar Account'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Toggle between login / signup */}
            <div className="mt-5 text-center text-xs font-serif text-[#5C5852] dark:text-[#9E9A91]">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-[#8B2635] dark:text-[#E08A95] font-serif font-bold hover:underline cursor-pointer"
                >
                  Return to sign in
                </button>
              ) : authModalMode === 'login' ? (
                <span>
                  Unregistered candidate?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('signup')}
                    className="text-[#8B2635] dark:text-[#E08A95] font-serif font-bold hover:underline cursor-pointer"
                  >
                    Enroll today
                  </button>
                </span>
              ) : (
                <span>
                  Existing enrolled scholar?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('login')}
                    className="text-[#8B2635] dark:text-[#E08A95] font-serif font-bold hover:underline cursor-pointer"
                  >
                    Authenticate
                  </button>
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
