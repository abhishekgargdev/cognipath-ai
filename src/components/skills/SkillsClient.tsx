'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  TrendingUp,
  Clock,
  Check,
  Plus,
  X,
  Tag,
  BookMarked,
  Sparkles,
} from 'lucide-react';
import { Pagination } from '@/components/common/Pagination';
import { SkillsSkeleton } from '@/components/common';
import { toast } from 'sonner';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites: string[];
  relatedSkills: string[];
  estHours: number;
  careerRelevance: string;
  description: string;
  trending: boolean;
}

export function SkillsClient() {
  const router = useRouter();
  const [skillsCatalog, setSkillsCatalog] = useState<SkillItem[]>([]);
  const [userSelectedSkills, setUserSelectedSkills] = useState<Array<{ skillId: string; name: string; level?: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'catalog' | 'enrolled'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [commaInput, setCommaInput] = useState('');
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Databases', 'Engineering', 'AI'];

  useEffect(() => {
    async function loadSkills() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/skills');
        if (res.ok) {
          const data = await res.json();
          setSkillsCatalog(data.skills || []);
          if (data.userSkills && Array.isArray(data.userSkills)) {
            setUserSelectedSkills(data.userSkills);
          }
        }
      } catch (err) {
        console.error('Failed to load skills catalog:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSkills();
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const isSkillSelected = (skillId: string, skillName: string) => {
    return userSelectedSkills.some(
      (s) => s.skillId === skillId || s.name.toLowerCase() === skillName.toLowerCase()
    );
  };

  const syncUserSkills = async (nextSkills: Array<{ skillId: string; name: string; level?: string }>) => {
    try {
      setIsSyncing(true);
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedSkills: nextSkills }),
      });

      if (res.ok) {
        toast.success('Skills roster updated! Curriculum roadmap recalculated.');
        router.refresh();
      } else {
        toast.error('Failed to sync skill roster.');
      }
    } catch (err) {
      console.error('Failed to sync skills:', err);
      toast.error('Error updating skills roster.');
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSkill = async (skillId: string, skillName: string) => {
    let nextSkills = [...userSelectedSkills];
    const exists = isSkillSelected(skillId, skillName);

    if (exists) {
      nextSkills = nextSkills.filter(
        (s) => s.skillId !== skillId && s.name.toLowerCase() !== skillName.toLowerCase()
      );
    } else {
      nextSkills.push({ skillId, name: skillName, level: 'Beginner' });
    }

    setUserSelectedSkills(nextSkills);
    await syncUserSkills(nextSkills);
  };

  const parsedCandidateSkills = commaInput
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const handleAddCommaSkills = async (inputToProcess: string = commaInput) => {
    const items = inputToProcess
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (items.length === 0) return;

    let addedCount = 0;
    const addedNames: string[] = [];
    const currentSkills = [...userSelectedSkills];

    items.forEach((rawName) => {
      const exists = currentSkills.some((s) => s.name.toLowerCase() === rawName.toLowerCase());
      if (!exists) {
        const catalogMatch = skillsCatalog.find((cs) => cs.name.toLowerCase() === rawName.toLowerCase());
        const skillId = catalogMatch ? catalogMatch.id : `custom-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        currentSkills.push({ skillId, name: catalogMatch ? catalogMatch.name : rawName, level: 'Beginner' });
        addedCount++;
        addedNames.push(catalogMatch ? catalogMatch.name : rawName);
      }
    });

    setUserSelectedSkills(currentSkills);
    setCommaInput('');

    if (addedCount > 0) {
      setBatchSuccessMessage(`Successfully enrolled ${addedCount} skills: ${addedNames.join(', ')}`);
      setTimeout(() => setBatchSuccessMessage(null), 4000);
      await syncUserSkills(currentSkills);
    } else {
      setBatchSuccessMessage('All entered skills are already present in your active syllabus roster.');
      setTimeout(() => setBatchSuccessMessage(null), 3000);
    }
  };

  const filteredSkills = useMemo(() => {
    if (activeTab === 'enrolled') {
      const enrolledNames = new Set(userSelectedSkills.map((s) => s.name.toLowerCase()));
      const enrolledIds = new Set(userSelectedSkills.map((s) => s.skillId));

      let list = skillsCatalog.filter(
        (s) => enrolledIds.has(s.id) || enrolledNames.has(s.name.toLowerCase())
      );

      // Include user custom skills not in catalog
      const catalogNames = new Set(skillsCatalog.map((s) => s.name.toLowerCase()));
      userSelectedSkills.forEach((us) => {
        if (!catalogNames.has(us.name.toLowerCase())) {
          list.push({
            id: us.skillId,
            name: us.name,
            category: 'User Custom Skill',
            difficulty: (us.level as any) || 'Beginner',
            prerequisites: [],
            relatedSkills: [],
            estHours: 10,
            careerRelevance: 'Custom skill enrolled during profile setup or batch addition.',
            description: `Personalized skill module for ${us.name}.`,
            trending: false,
          });
        }
      });

      return list.filter((skill) => {
        const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
        const matchesSearch =
          skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      });
    }

    return skillsCatalog.filter((skill) => {
      const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
      const matchesSearch =
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.careerRelevance.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [skillsCatalog, userSelectedSkills, activeTab, selectedCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSkills.length / pageSize));
  const paginatedSkills = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSkills.slice(start, start + pageSize);
  }, [filteredSkills, currentPage, pageSize]);

  if (isLoading) {
    return <SkillsSkeleton />;
  }

  return (
    <div id="skills-discovery-view" className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
          Technical Competency Canon
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Skills Directory & Roster
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          View your enrolled learning skills or explore engineering disciplines for syllabus customization.
        </p>
      </div>

      {/* COMMA-SEPARATED BATCH SKILL REGISTRATION MODULE */}
      <div id="batch-skills-module" className="p-5 sm:p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-3">
          <div>
            <h2 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
              <span>Batch Add Skills (Comma-Separated)</span>
            </h2>
            <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-0.5">
              Type or paste skills separated by commas to add them directly to your active roadmap.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] self-start sm:self-auto">
            {userSelectedSkills.length} Skills Enrolled
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <input
                id="comma-skills-input"
                type="text"
                placeholder="e.g. React, TypeScript, GraphQL, Docker, Rust, Kafka, Redis..."
                value={commaInput}
                onChange={(e) => setCommaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCommaSkills();
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#151412] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] placeholder-[#9E9A91] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
              />
            </div>

            <button
              id="batch-enroll-btn"
              onClick={() => handleAddCommaSkills()}
              disabled={parsedCandidateSkills.length === 0 || isSyncing}
              className="px-5 py-2.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2C2A26] dark:hover:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-[#121212] dark:border-[#F4F2EC] disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {isSyncing
                  ? 'Recalculating...'
                  : parsedCandidateSkills.length > 0
                  ? `Enroll (${parsedCandidateSkills.length}) ${parsedCandidateSkills.length === 1 ? 'Skill' : 'Skills'}`
                  : 'Enroll Skills'}
              </span>
            </button>
          </div>

          {/* Preset Quick Bundles */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">
              Archetype Bundles:
            </span>
            <button
              type="button"
              onClick={() => handleAddCommaSkills('TypeScript, React, Node.js, PostgreSQL, Tailwind')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + Full-Stack Web
            </button>
            <button
              type="button"
              onClick={() => handleAddCommaSkills('Python, PyTorch, LangChain, Vector DBs, RAG')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + AI Engineering
            </button>
            <button
              type="button"
              onClick={() => handleAddCommaSkills('Docker, Kubernetes, AWS, Terraform, CI/CD')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + Cloud & DevOps
            </button>
          </div>

          {/* Feedback banner */}
          {batchSuccessMessage && (
            <div className="p-3 rounded-xs border border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] text-xs font-serif flex items-center justify-between animate-in fade-in duration-150">
              <span className="font-semibold">{batchSuccessMessage}</span>
              <button
                onClick={() => setBatchSuccessMessage(null)}
                className="text-[#1F3A2B] dark:text-[#4E876A] hover:opacity-75 cursor-pointer ml-2"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active enrolled skills chips list */}
          {userSelectedSkills.length > 0 && (
            <div className="pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#5C5852] dark:text-[#9E9A91] font-bold block">
                Your Enrolled Roster:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {userSelectedSkills.map((s) => (
                  <span
                    key={s.skillId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs bg-[#F4F1EA] dark:bg-[#201F1B] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif text-[#121212] dark:text-[#F4F2EC]"
                  >
                    <span className="font-medium">{s.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleSkill(s.skillId, s.name)}
                      className="text-[#8B2635] dark:text-[#E08A95] hover:text-[#121212] dark:hover:text-white cursor-pointer ml-0.5"
                      title={`Remove ${s.name}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main View Tabs: Enrolled vs Catalog */}
      <div className="flex items-center gap-2 border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-2">
        <button
          onClick={() => {
            setActiveTab('enrolled');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xs text-xs font-serif font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'enrolled'
              ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
              : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5" />
          <span>My Enrolled Skills ({userSelectedSkills.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('catalog');
            setCurrentPage(1);
          }}
          className={`px-4 py-2 rounded-xs text-xs font-serif font-bold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'catalog'
              ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
              : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Browse All Catalog ({skillsCatalog.length})</span>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9E9A91] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="skills-search-input"
            type="text"
            placeholder="Search enrolled skills or catalog..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-xs font-serif text-[#121212] dark:text-[#F4F2EC] placeholder-[#9E9A91] focus:outline-none focus:border-[#121212] dark:focus:border-[#F4F2EC]"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-xs text-xs font-serif transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] font-bold border border-[#121212] dark:border-[#F4F2EC]'
                  : 'bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-[#5C5852] dark:text-[#9E9A91] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      {paginatedSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedSkills.map((skill) => {
            const selected = isSkillSelected(skill.id, skill.name);
            return (
              <div
                key={skill.id}
                id={`skill-card-${skill.id}`}
                className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs flex flex-col justify-between hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all h-full"
              >
                <div className="flex-1 flex flex-col">
                  <div className="flex items-start justify-between gap-2 pb-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base sm:text-lg font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                          {skill.name}
                        </h3>
                        {skill.trending && (
                          <span className="flex items-center gap-0.5 text-[9px] font-mono font-bold uppercase tracking-wider text-[#8B2635] dark:text-[#E08A95] bg-[#8B2635]/10 border border-[#8B2635]/30 px-1.5 py-0.5 rounded-xs">
                            <TrendingUp className="w-3 h-3" /> High Demand
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B2635] dark:text-[#E08A95] font-semibold block">
                        {skill.category}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] uppercase tracking-wider font-semibold shrink-0">
                      {skill.difficulty}
                    </span>
                  </div>

                  <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] mt-1 leading-relaxed">
                    {skill.description}
                  </p>

                  <div className="mt-3 p-3 rounded-xs bg-[#F4F1EA] dark:bg-[#1A1916] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif text-[#121212] dark:text-[#EAE7DF] leading-relaxed">
                    <strong className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8B2635] dark:text-[#E08A95] block mb-0.5">
                      Industrial Relevance:
                    </strong>
                    {skill.careerRelevance}
                  </div>

                  <div className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-auto">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{skill.estHours}h investment
                    </span>
                    {skill.relatedSkills && skill.relatedSkills.length > 0 && (
                      <>
                        <span className="text-[#9E9A91]">•</span>
                        <span>Cognates: {skill.relatedSkills.join(', ')}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-3 mt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between">
                  <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                    {selected ? 'Enrolled in active roadmap' : 'Unscheduled skill'}
                  </span>

                  <button
                    onClick={() => toggleSkill(skill.id, skill.name)}
                    disabled={isSyncing}
                    className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                      selected
                        ? 'border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A]'
                        : 'border-[#121212] dark:border-[#F4F2EC] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC]'
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-3" />
                        <span>Enrolled</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Enroll Skill</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-center space-y-3">
          <p className="font-serif italic text-sm text-[#5C5852] dark:text-[#9E9A91]">
            {activeTab === 'enrolled'
              ? 'No enrolled skills found. Use the batch input module or catalog to add skills to your syllabus.'
              : 'No skills found matching your search criteria.'}
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredSkills.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSkills.length}
          pageSize={pageSize}
          pageSizeOptions={[6, 8, 12, 24]}
          itemLabel="competencies"
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}
