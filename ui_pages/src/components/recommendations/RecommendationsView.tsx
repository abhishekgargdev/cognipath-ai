import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Pagination } from '../common/Pagination';
import { 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Clock, 
  Plus, 
  Check, 
  BrainCircuit,
  Compass,
  Filter
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const { 
    aiRecommendations, 
    addRecommendationToRoadmap, 
    startTopicLearning,
    setActiveView 
  } = useApp();

  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(2);

  const priorities = ['all', 'Critical', 'High', 'Medium'];

  const filteredRecommendations = useMemo(() => {
    if (selectedPriority === 'all') return aiRecommendations;
    return aiRecommendations.filter(r => r.expectedImpact === selectedPriority);
  }, [aiRecommendations, selectedPriority]);

  const totalPages = Math.ceil(filteredRecommendations.length / pageSize);
  const paginatedRecommendations = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecommendations.slice(start, start + pageSize);
  }, [filteredRecommendations, currentPage, pageSize]);

  const handlePriorityChange = (priority: string) => {
    setSelectedPriority(priority);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <div id="recommendations-view" className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em] flex items-center gap-1.5">
          <BrainCircuit className="w-4 h-4" />
          Heuristic Curriculum Synthesizer
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-1">
          Prescribed Curricular Trajectory
        </h1>
        <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
          The engine computes diagnostic test performance, foundational prerequisite thresholds, and career goal objectives to deduce optimal next acquisitions.
        </p>
      </div>

      {/* Filter Tabs & Summary Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono uppercase text-[#5C5852] dark:text-[#9E9A91] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Priority:
          </span>
          {priorities.map((p) => (
            <button
              key={p}
              onClick={() => handlePriorityChange(p)}
              className={`px-2.5 py-1 rounded-xs text-xs font-serif font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedPriority === p
                  ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                  : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
              }`}
            >
              {p === 'all' ? 'All Priorities' : `${p} Priority`}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">
          Showing {paginatedRecommendations.length} of {filteredRecommendations.length} advisories
        </span>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-4">
        {paginatedRecommendations.length === 0 ? (
          <div className="p-8 text-center rounded-xs border border-dashed border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714]">
            <p className="text-sm font-serif text-[#5C5852] dark:text-[#9E9A91]">No recommendations match the selected priority filter.</p>
            <button
              onClick={() => handlePriorityChange('all')}
              className="mt-3 text-xs font-serif font-bold text-[#8B2635] dark:text-[#E08A95] underline cursor-pointer"
            >
              Reset to all recommendations
            </button>
          </div>
        ) : (
          paginatedRecommendations.map((rec) => (
            <div
              key={rec.id}
              id={`recommendation-card-${rec.id}`}
              className="p-5 sm:p-6 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs space-y-4 hover:border-[#121212] dark:hover:border-[#F4F2EC] transition-all"
            >
              {/* Top row: Title, Category, Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC] uppercase tracking-wider">
                      {rec.category}
                    </span>
                    <span className="text-[#9E9A91]">•</span>
                    <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~{rec.estHours} hours allocation
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#121212] dark:text-[#F4F2EC] mt-1.5">
                    {rec.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-xs text-[9px] font-mono font-bold uppercase tracking-widest border ${
                    rec.expectedImpact === 'Critical' 
                      ? 'border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]' 
                      : rec.expectedImpact === 'High'
                      ? 'border-[#1F3A2B]/40 bg-[#1F3A2B]/10 text-[#1F3A2B] dark:text-[#4E876A]'
                      : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#5C5852] dark:text-[#9E9A91]'
                  }`}>
                    {rec.expectedImpact} Priority
                  </span>
                </div>
              </div>

              {/* Why This Recommendation? */}
              <div className="p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1A1916] border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B2635] dark:text-[#E08A95] block mb-1">
                  EVALUATIVE RATIONALE
                </span>
                <p className="text-[#121212] dark:text-[#F4F2EC] leading-relaxed italic">
                  "{rec.whyRecommendation}"
                </p>
              </div>

              {/* Prerequisites Checklist */}
              <div className="space-y-2">
                <span className="text-xs font-serif font-bold text-[#5C5852] dark:text-[#9E9A91] block">
                  Foundational Prerequisite Audit:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rec.prerequisites.map((p) => (
                    <div
                      key={p.name}
                      className="p-2.5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#151412] flex items-center justify-between text-xs font-serif"
                    >
                      <span className="text-[#121212] dark:text-[#EAE7DF]">{p.name}</span>
                      {p.satisfied ? (
                        <span className="text-[10px] font-mono font-bold text-[#1F3A2B] dark:text-[#4E876A] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Satisfied
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[#5C5852] dark:text-[#9E9A91] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> In Progress
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                  {rec.addedToRoadmap ? 'Integrated into active syllabus' : 'Pending incorporation into active syllabus'}
                </span>

                <div className="flex items-center gap-3">
                  {rec.addedToRoadmap ? (
                    <button
                      onClick={() => startTopicLearning(rec.actionTopicId)}
                      className="px-4 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-white dark:text-[#121212] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#121212] dark:border-[#F4F2EC]"
                    >
                      <span>Commence Module</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => addRecommendationToRoadmap(rec.id)}
                      className="px-4 py-2 rounded-xs border border-[#121212] dark:border-[#F4F2EC] bg-[#F4F1EA] dark:bg-[#201F1B] hover:bg-[#EAE7DF] dark:hover:bg-[#2A2824] text-[#121212] dark:text-[#F4F2EC] font-serif font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Incorporate into Syllabus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Component */}
      {filteredRecommendations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredRecommendations.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[2, 4, 10]}
        />
      )}

      {/* Roadmap Quick Link */}
      <div className="p-5 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#181714] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Compass className="w-5 h-5 text-[#8B2635] dark:text-[#E08A95] shrink-0" />
          <div>
            <p className="text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">Desire recalibration of overarching curriculum objectives?</p>
            <p className="text-[11px] font-serif italic text-[#5C5852] dark:text-[#9E9A91]">Adjust target roles, competency benchmarks, and daily study cadence in Settings.</p>
          </div>
        </div>
        <button
          onClick={() => setActiveView('settings')}
          className="px-4 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#201F1B] text-xs font-serif font-bold text-[#121212] dark:text-[#F4F2EC] hover:bg-[#EAE7DF] cursor-pointer whitespace-nowrap"
        >
          Configure Preferences
        </button>
      </div>
    </div>
  );
};
