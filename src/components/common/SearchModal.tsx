'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, BookOpen, Layers, ArrowRight, X, Code } from 'lucide-react';
import { useUIStore } from '@/providers/ui-store';

export function SearchModal() {
  const router = useRouter();
  const { isSearchOpen, setIsSearchOpen } = useUIStore();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    topics?: any[];
    lessons?: any[];
    questions?: any[];
    skills?: any[];
  }>({});
  const [isSearching, setIsSearching] = useState(false);

  // Keyboard shortcut listener for ⌘K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  // Fetch search results from /api/search?q=...
  useEffect(() => {
    if (!isSearchOpen) return;

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (err) {
        console.error('Failed to fetch search results:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  if (!isSearchOpen) return null;

  const topics = results.topics || [];
  const skills = results.skills || [];
  const questions = results.questions || [];

  return (
    <div
      id="search-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#121212]/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        id="search-modal-card"
        className="w-full max-w-xl rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
          <Search className="w-4 h-4 text-[#9E9A91]" />
          <input
            id="spotlight-search-input"
            type="text"
            placeholder="Search canon, topics, architectural paradigms, or skills..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent font-serif text-sm text-[#121212] dark:text-[#F4F2EC] placeholder-[#9E9A91] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#9E9A91] hover:text-[#121212] dark:hover:text-[#F4F2EC]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Topics & Lessons Section */}
          {topics.length > 0 && (
            <div>
              <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
                Curricular Modules & Lessons
              </div>
              <div className="space-y-1">
                {topics.map((topic: any) => (
                  <div
                    key={topic.id || topic._id}
                    onClick={() => {
                      router.push(`/learn/${topic.id}`);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xs hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95] shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] group-hover:text-[#8B2635] dark:group-hover:text-[#E08A95] transition-colors">
                          {topic.title}
                        </p>
                        <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] line-clamp-1">
                          {topic.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] text-[#5C5852] dark:text-[#9E9A91] px-2 py-0.5 rounded-xs">
                        {topic.categoryLabel || 'Module'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9E9A91] group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {skills.length > 0 && (
            <div>
              <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
                Canon Disciplines
              </div>
              <div className="space-y-1">
                {skills.map((skill: any) => (
                  <div
                    key={skill.id || skill._id}
                    onClick={() => {
                      router.push('/skills');
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xs hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Layers className="w-4 h-4 text-[#1F3A2B] dark:text-[#4E876A] shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] group-hover:text-[#1F3A2B] dark:group-hover:text-[#4E876A] transition-colors">
                          {skill.name}
                        </p>
                        <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] line-clamp-1">
                          {skill.description}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] px-2 py-0.5 rounded-xs font-medium">
                      {skill.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practice Questions Section */}
          {questions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
                Practicum Exercises
              </div>
              <div className="space-y-1">
                {questions.map((q: any) => (
                  <div
                    key={q.id || q._id}
                    onClick={() => {
                      router.push(`/practice?topicId=${q.topicId || 'js-event-loop'}`);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xs hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Code className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95] shrink-0" />
                      <div>
                        <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] group-hover:text-[#8B2635] transition-colors">
                          {q.title}
                        </p>
                        <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91] line-clamp-1">
                          {q.whyThisMatters || q.prompt}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && skills.length === 0 && questions.length === 0 && !isSearching && (
            <div className="p-8 text-center font-serif text-xs italic text-[#5C5852] dark:text-[#9E9A91]">
              No canonical modules or disciplines found matching "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#F4F1EA] dark:bg-[#151412] border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
          <span>Index dynamically harmonized with database</span>
          <span className="font-mono text-[10px]">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
