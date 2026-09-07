import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, BookOpen, Layers, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { mockSkillsCatalog } from '../../data/mockData';

export const SearchModal: React.FC = () => {
  const { 
    isSearchOpen, 
    setIsSearchOpen, 
    roadmapMilestones, 
    setActiveView, 
    setSelectedTopicId,
    startTopicLearning
  } = useApp();

  const [query, setQuery] = useState('');

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

  if (!isSearchOpen) return null;

  // Gather all roadmap topics
  const allTopics = roadmapMilestones.flatMap(ms => ms.nodes);

  // Filter topics
  const filteredTopics = query.trim()
    ? allTopics.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
      )
    : allTopics.slice(0, 4);

  // Filter skills
  const filteredSkills = query.trim()
    ? mockSkillsCatalog.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      )
    : mockSkillsCatalog.slice(0, 3);

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
          {/* Topics Section */}
          <div>
            <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
              Curricular Modules & Lessons
            </div>
            <div className="space-y-1">
              {filteredTopics.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => {
                    startTopicLearning(topic.id);
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
                      {topic.categoryLabel}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#9E9A91] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <div className="px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] font-bold text-[#8B2635] dark:text-[#E08A95]">
              Canon Disciplines
            </div>
            <div className="space-y-1">
              {filteredSkills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => {
                    setActiveView('skills');
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
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#F4F1EA] dark:bg-[#151412] border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
          <span>Index dynamically harmonized with syllabus DAG</span>
          <span className="font-mono text-[10px]">Return to inspect</span>
        </div>
      </div>
    </div>
  );
};
