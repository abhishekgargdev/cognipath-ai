import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { mockSkillsCatalog } from '../../data/mockData';
import { Pagination } from '../common/Pagination';
import { 
  Search, 
  Layers, 
  TrendingUp, 
  Clock, 
  Check, 
  Plus, 
  ArrowRight,
  Filter,
  X,
  Sparkles,
  Tag,
  BookOpen
} from 'lucide-react';

export const SkillsDiscoveryView: React.FC = () => {
  const { user, setUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [commaInput, setCommaInput] = useState('');
  const [batchSuccessMessage, setBatchSuccessMessage] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const categories = ['All', 'Programming', 'Frontend', 'Backend', 'Databases', 'Engineering', 'AI'];

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredSkills = mockSkillsCatalog.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = 
      skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skill.careerRelevance.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredSkills.length / pageSize) || 1;
  const paginatedSkills = filteredSkills.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const isSkillSelected = (skillId: string) => {
    return user.selectedSkills.some(s => s.skillId === skillId);
  };

  const toggleSkill = (skillId: string, skillName: string) => {
    if (isSkillSelected(skillId)) {
      setUser(prev => ({
        ...prev,
        selectedSkills: prev.selectedSkills.filter(s => s.skillId !== skillId)
      }));
    } else {
      setUser(prev => ({
        ...prev,
        selectedSkills: [...prev.selectedSkills, { skillId, name: skillName, level: 'Beginner' }]
      }));
    }
  };

  // Comma-separated parsing & batch addition
  const parsedCandidateSkills = commaInput
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  const handleAddCommaSkills = (inputToProcess: string = commaInput) => {
    const items = inputToProcess
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (items.length === 0) return;

    let addedCount = 0;
    const addedNames: string[] = [];

    setUser(prev => {
      const currentSkills = [...prev.selectedSkills];
      
      items.forEach(rawName => {
        // Check if already present by name
        const exists = currentSkills.some(
          s => s.name.toLowerCase() === rawName.toLowerCase()
        );
        if (!exists) {
          // Find if it exists in catalog for canonical ID
          const catalogMatch = mockSkillsCatalog.find(
            cs => cs.name.toLowerCase() === rawName.toLowerCase()
          );
          const skillId = catalogMatch 
            ? catalogMatch.id 
            : `custom-${rawName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
          
          currentSkills.push({
            skillId,
            name: catalogMatch ? catalogMatch.name : rawName,
            level: 'Beginner'
          });
          addedCount++;
          addedNames.push(catalogMatch ? catalogMatch.name : rawName);
        }
      });

      return {
        ...prev,
        selectedSkills: currentSkills
      };
    });

    setCommaInput('');
    if (addedCount > 0) {
      setBatchSuccessMessage(`Successfully accredited ${addedCount} competencies: ${addedNames.join(', ')}`);
      setTimeout(() => setBatchSuccessMessage(null), 4000);
    } else {
      setBatchSuccessMessage('All entered competencies are already present in your syllabus.');
      setTimeout(() => setBatchSuccessMessage(null), 3000);
    }
  };

  const handleApplyPreset = (presetString: string) => {
    handleAddCommaSkills(presetString);
  };

  return (
    <div id="skills-discovery-view" className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
          Encyclopedic Competency Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Technical Canon & Competency Taxonomy
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          Catalog of engineering disciplines, foundational prerequisites, and industrial relevance indices for syllabus customisation.
        </p>
      </div>

      {/* COMMA-SEPARATED BATCH SKILL REGISTRATION MODULE */}
      <div 
        id="batch-skills-module"
        className="p-5 sm:p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCD9D1] dark:border-[#2C2A26] pb-3">
          <div>
            <h2 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC] flex items-center gap-2 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-[#8B2635] dark:text-[#E08A95]" />
              <span>Batch Add Skills (Comma-Separated)</span>
            </h2>
            <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91] mt-0.5">
              Paste or type multiple engineering disciplines separated by commas to immediately append to your active syllabus.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91] self-start sm:self-auto">
            {user.selectedSkills.length} Enrolled
          </span>
        </div>

        {/* Input bar and action */}
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
              disabled={parsedCandidateSkills.length === 0}
              className="px-5 py-2.5 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2C2A26] dark:hover:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] font-serif font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors border border-[#121212] dark:border-[#F4F2EC] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 min-h-[44px] sm:min-h-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {parsedCandidateSkills.length > 0 
                  ? `Enroll (${parsedCandidateSkills.length}) ${parsedCandidateSkills.length === 1 ? 'Skill' : 'Skills'}` 
                  : 'Enroll Skills'}
              </span>
            </button>
          </div>

          {/* Live Preview Tags of parsed candidates */}
          {parsedCandidateSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold mr-1">
                Detected ({parsedCandidateSkills.length}):
              </span>
              {parsedCandidateSkills.map((candidate, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-xs bg-[#8B2635]/10 dark:bg-[#8B2635]/20 text-[#8B2635] dark:text-[#E08A95] border border-[#8B2635]/30 font-mono text-[11px] font-semibold"
                >
                  +{candidate}
                </span>
              ))}
            </div>
          )}

          {/* Preset Quick Bundles */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#5C5852] dark:text-[#9E9A91] font-bold">
              Archetype Bundles:
            </span>
            <button
              type="button"
              onClick={() => handleApplyPreset('TypeScript, React, Node.js, PostgreSQL, Tailwind')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + Full-Stack Web
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Python, PyTorch, LangChain, Vector DBs, RAG')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + AI Engineering
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Docker, Kubernetes, AWS, Terraform, CI/CD')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + Cloud & DevOps
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Rust, Go, Concurrency, Linux Systems, eBPF')}
              className="px-2 py-1 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] hover:border-[#121212] dark:hover:border-[#F4F2EC] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] cursor-pointer transition-colors"
            >
              + Systems Track
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
          {user.selectedSkills.length > 0 && (
            <div className="pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#5C5852] dark:text-[#9E9A91] font-bold block">
                Current Syllabus Roster:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {user.selectedSkills.map((s) => (
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

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#9E9A91] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="skills-search-input"
            type="text"
            placeholder="Search disciplines, sub-systems, paradigms..."
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

      {/* Catalog Header Meta */}
      <div className="flex items-center justify-between text-xs font-serif text-[#5C5852] dark:text-[#9E9A91] px-1">
        <span className="font-mono text-[11px]">
          Showing <strong className="text-[#121212] dark:text-[#F4F2EC]">{filteredSkills.length}</strong> {filteredSkills.length === 1 ? 'discipline' : 'disciplines'}
          {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </span>
        {totalPages > 1 && (
          <span className="font-mono text-[11px]">
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Skills Grid */}
      {paginatedSkills.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedSkills.map((skill) => {
            const selected = isSkillSelected(skill.id);
            return (
              <div
                key={skill.id}
                id={`skill-card-${skill.id}`}
                className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs flex flex-col justify-between hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all h-full"
              >
                <div className="flex-1 flex flex-col">
                  {/* Card Header */}
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

                  {/* Career relevance box */}
                  <div className="mt-3 p-3 rounded-xs bg-[#F4F1EA] dark:bg-[#1A1916] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif text-[#121212] dark:text-[#EAE7DF] leading-relaxed">
                    <strong className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#8B2635] dark:text-[#E08A95] block mb-0.5">
                      Industrial Relevance:
                    </strong> 
                    {skill.careerRelevance}
                  </div>

                  {/* Prerequisites & Related */}
                  <div className="mt-3 pt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#5C5852] dark:text-[#9E9A91] mt-auto">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> ~{skill.estHours}h investment
                    </span>
                    <span className="text-[#9E9A91]">•</span>
                    <span>Cognates: {skill.relatedSkills.join(', ')}</span>
                  </div>
                </div>

                {/* Action Button Footer */}
                <div className="pt-3 mt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-between">
                  <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                    {selected ? 'Incorporated into learning profile' : 'Unscheduled competency'}
                  </span>

                  <button
                    onClick={() => toggleSkill(skill.id, skill.name)}
                    className={`px-3 py-1.5 rounded-xs text-xs font-serif font-bold flex items-center gap-1.5 transition-colors cursor-pointer border shrink-0 ${
                      selected
                        ? 'border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A] hover:border-[#8B2635]/40 hover:bg-[#8B2635]/10 hover:text-[#8B2635]'
                        : 'border-[#121212] dark:border-[#F4F2EC] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#121212] hover:text-white dark:hover:bg-[#F4F2EC] dark:hover:text-[#121212] text-[#121212] dark:text-[#F4F2EC]'
                    }`}
                  >
                    {selected ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-3" />
                        <span>Accredited</span>
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
            No competencies found matching your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xs border border-[#121212] dark:border-[#F4F2EC] text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B] cursor-pointer"
          >
            Reset Filters
          </button>
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
};
