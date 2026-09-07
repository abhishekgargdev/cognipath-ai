import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RoadmapNode, NodeStatus } from '../../types';
import { Pagination } from '../common/Pagination';
import { 
  Check, 
  Clock, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  AlertCircle, 
  BookOpen, 
  Play, 
  X,
  ChevronDown,
  Layers,
  CheckCircle2,
  Filter,
  ListFilter
} from 'lucide-react';

export const RoadmapView: React.FC = () => {
  const { 
    user, 
    roadmapMilestones, 
    startTopicLearning, 
    startDailyPractice 
  } = useApp();

  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(2);

  // Total topics and mastered count
  const allNodes = roadmapMilestones.flatMap(ms => ms.nodes);
  const totalTopics = allNodes.length;
  const masteredCount = allNodes.filter(n => n.status === 'completed').length;
  const inProgressCount = allNodes.filter(n => n.status === 'in_progress' || n.status === 'review_needed').length;

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    if (selectedMilestoneId === 'all') return roadmapMilestones;
    return roadmapMilestones.filter(m => m.id === selectedMilestoneId);
  }, [roadmapMilestones, selectedMilestoneId]);

  // Paginated milestones (when in 'all' view)
  const totalPages = Math.ceil(filteredMilestones.length / pageSize);
  const paginatedMilestones = useMemo(() => {
    if (selectedMilestoneId !== 'all') return filteredMilestones;
    const start = (currentPage - 1) * pageSize;
    return filteredMilestones.slice(start, start + pageSize);
  }, [filteredMilestones, selectedMilestoneId, currentPage, pageSize]);

  const handleMilestoneFilterChange = (id: string) => {
    setSelectedMilestoneId(id);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getStatusBadge = (status: NodeStatus, mastery: number) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#121212] dark:text-[#F4F2EC]">
            <Check className="w-2.5 h-2.5 stroke-3 text-[#1F3A2B] dark:text-[#4E876A]" /> Mastered ({mastery}%)
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#8B2635]/40 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]">
            <span className="w-1.5 h-1.5 bg-[#8B2635] dark:bg-[#E08A95]" /> In Progress ({mastery}%)
          </span>
        );
      case 'review_needed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#8B2635] bg-[#8B2635] text-white">
            <AlertCircle className="w-2.5 h-2.5" /> Review Requisite ({mastery}%)
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91]">
            Available
          </span>
        );
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 bg-transparent text-[#9E9A91]">
            <Lock className="w-2.5 h-2.5" /> Prerequisite Required
          </span>
        );
    }
  };

  return (
    <div id="roadmap-view" className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200">
      {/* Roadmap Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DCD9D1] dark:border-[#2C2A26]">
        <div>
          <span className="text-[#8B2635] dark:text-[#E08A95] font-mono text-[10px] uppercase font-bold tracking-[0.2em]">
            COMPREHENSIVE SYLLABUS DIRECTORY
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#121212] dark:text-[#F4F2EC] tracking-tight mt-0.5">
            Curriculum Roadmap
          </h1>
          <p className="text-xs sm:text-sm font-serif italic text-[#5C5852] dark:text-[#A6A299] mt-1">
            Engineered around your intended mastery: <strong className="font-bold not-italic text-[#121212] dark:text-[#F4F2EC]">{user.targetGoal}</strong>
          </p>
        </div>

        {/* Progress Summary Card */}
        <div className="flex items-center gap-4 p-4 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-mono text-[10px] uppercase tracking-wider font-bold text-[#5C5852] dark:text-[#9E9A91]">Milestones</span>
              <span className="font-mono font-bold text-xs text-[#8B2635] dark:text-[#E08A95] ml-3">
                {masteredCount} / {totalTopics} Mastered
              </span>
            </div>
            <div className="w-48 bg-[#EAE7DF] dark:bg-[#252420] rounded-none h-1.5 overflow-hidden">
              <div 
                className="bg-[#8B2635] dark:bg-[#E08A95] h-full transition-all"
                style={{ width: `${Math.round((masteredCount / totalTopics) * 100)}%` }}
              />
            </div>
          </div>
          <div className="border-l border-[#DCD9D1] dark:border-[#2C2A26] pl-4 text-right">
            <span className="text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
              {Math.round((masteredCount / totalTopics) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Selection Tabs & View Mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono uppercase text-[#5C5852] dark:text-[#9E9A91] mr-1 flex items-center gap-1">
            <ListFilter className="w-3 h-3" /> Milestones:
          </span>
          <button
            onClick={() => handleMilestoneFilterChange('all')}
            className={`px-2.5 py-1 rounded-xs text-xs font-serif font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedMilestoneId === 'all'
                ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
            }`}
          >
            All Milestones ({roadmapMilestones.length})
          </button>
          {roadmapMilestones.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => handleMilestoneFilterChange(m.id)}
              className={`px-2.5 py-1 rounded-xs text-xs font-serif font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedMilestoneId === m.id
                  ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                  : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
              }`}
            >
              M{idx + 1}: {m.title.split(' ')[0]}
            </button>
          ))}
        </div>

        <span className="text-xs font-mono text-[#5C5852] dark:text-[#9E9A91]">
          {selectedMilestoneId === 'all' ? `Showing ${paginatedMilestones.length} of ${roadmapMilestones.length} milestones` : 'Single Milestone View'}
        </span>
      </div>

      {/* Hierarchical Roadmap Milestones */}
      <div className="space-y-10">
        {paginatedMilestones.map((milestone, mIndex) => {
          const originalIndex = roadmapMilestones.findIndex(m => m.id === milestone.id);
          return (
            <div key={milestone.id} className="relative">
              {/* Milestone Header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-[#DCD9D1]/50 dark:border-[#2C2A26]/50">
                <div className="w-8 h-8 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F4F1EA] dark:bg-[#201F1B] text-[#8B2635] dark:text-[#E08A95] flex items-center justify-center font-serif font-black text-xs">
                  {originalIndex >= 0 ? originalIndex + 1 : mIndex + 1}
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#121212] dark:text-[#F4F2EC] tracking-wide">
                    {milestone.title}
                  </h2>
                  <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">{milestone.description}</p>
                </div>
              </div>

              {/* Nodes Container */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-4 pl-4 border-l-2 border-[#DCD9D1] dark:border-[#2C2A26]">
                {milestone.nodes.map((node) => {
                  const isLocked = node.status === 'locked';
                  const isCompleted = node.status === 'completed';
                  const isReviewNeeded = node.status === 'review_needed';

                  return (
                    <div
                      key={node.id}
                      id={`roadmap-node-${node.id}`}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-xs border text-left transition-all cursor-pointer relative h-full flex flex-col justify-between ${
                        isLocked
                          ? 'border-[#DCD9D1]/60 dark:border-[#2C2A26]/60 bg-[#F4F1EA]/40 dark:bg-[#151412] opacity-60'
                          : isReviewNeeded
                          ? 'border-[#8B2635] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs'
                          : isCompleted
                          ? 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC] shadow-xs'
                          : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC] shadow-xs'
                      }`}
                    >
                      <div>
                        {/* Node Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {getStatusBadge(node.status, node.masteryPercent)}
                          <span className="text-[10px] text-[#5C5852] dark:text-[#9E9A91] font-mono">
                            ~{node.estMinutes}m • {node.difficulty}
                          </span>
                        </div>

                        <h3 className="text-sm font-serif font-bold text-[#121212] dark:text-[#F4F2EC]">
                          {node.title}
                        </h3>

                        <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] mt-1 line-clamp-2 leading-relaxed">
                          {node.whyItMatters}
                        </p>
                      </div>

                      {/* Subtopics Checklist Preview */}
                      <div className="mt-3 pt-2.5 border-t border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 flex items-center justify-between text-[11px] font-mono text-[#5C5852] dark:text-[#9E9A91]">
                        <span>{node.subtopics.filter(s => s.completed).length} / {node.subtopics.length} subtopics</span>
                        <span className="text-[#121212] dark:text-[#F4F2EC] font-serif font-bold flex items-center gap-1 group-hover:underline">
                          Examine <ArrowRight className="w-3 h-3 text-[#8B2635] dark:text-[#E08A95]" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Component for Milestones */}
      {selectedMilestoneId === 'all' && filteredMilestones.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredMilestones.length}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[2, 3, 5]}
        />
      )}

      {/* Selected Node Detail Modal (Folio Examination) */}
      {selectedNode && (
        <div 
          id="topic-detail-drawer"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedNode(null)}
        >
          <div 
            className="w-full max-w-lg rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(selectedNode.status, selectedNode.masteryPercent)}
              <span className="text-xs text-[#5C5852] dark:text-[#9E9A91] font-mono uppercase tracking-wider">
                {selectedNode.difficulty} • ~{selectedNode.estMinutes} mins
              </span>
            </div>

            <h2 className="text-2xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
              {selectedNode.title}
            </h2>

            <p className="text-xs font-serif text-[#5C5852] dark:text-[#A6A299] mt-2 leading-relaxed">
              {selectedNode.description}
            </p>

            {/* Why This Matters Section (Editorial Pull-Quote) */}
            <div className="mt-4 p-4 rounded-xs bg-[#F4F1EA] dark:bg-[#1C1B18] border-l-2 border-l-[#8B2635] dark:border-l-[#E08A95] border border-[#DCD9D1] dark:border-[#2C2A26]">
              <span className="text-[10px] font-mono font-bold text-[#8B2635] dark:text-[#E08A95] uppercase tracking-[0.2em] block mb-1">
                Pedagogical Objective
              </span>
              <p className="text-xs font-serif italic text-[#121212] dark:text-[#F4F2EC] leading-relaxed">
                "{selectedNode.whyItMatters}"
              </p>
            </div>

            {/* Prerequisites */}
            {selectedNode.prerequisites.length > 0 && (
              <div className="mt-4">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5C5852] dark:text-[#9E9A91] block mb-1.5">
                  Prerequisites:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.prerequisites.map((prereq) => (
                    <span 
                      key={prereq}
                      className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] dark:bg-[#1C1B18] border border-[#DCD9D1] dark:border-[#2C2A26] text-[11px] font-serif text-[#121212] dark:text-[#F4F2EC] flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3 h-3 text-[#8B2635] dark:text-[#E08A95]" />
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Subtopics */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5C5852] dark:text-[#9E9A91] block mb-2">
                Curriculum Modules ({selectedNode.subtopics.length}):
              </span>
              <div className="space-y-1.5">
                {selectedNode.subtopics.map((st) => (
                  <div 
                    key={st.id}
                    className="flex items-center justify-between p-2.5 rounded-xs bg-[#FFFFFF] dark:bg-[#181714] border border-[#DCD9D1] dark:border-[#2C2A26] text-xs font-serif"
                  >
                    <span className="text-[#121212] dark:text-[#F4F2EC] font-medium">{st.title}</span>
                    {st.completed ? (
                      <span className="text-[10px] font-mono text-[#1F3A2B] dark:text-[#4E876A] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Mastered
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#9E9A91]">Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  startDailyPractice(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="px-4 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#1C1B18] text-xs font-serif font-bold hover:bg-[#F4F1EA] dark:hover:bg-[#252420] text-[#121212] dark:text-[#F4F2EC] cursor-pointer"
              >
                Practice Questions
              </button>

              <button
                type="button"
                id="start-learn-node-btn"
                onClick={() => {
                  startTopicLearning(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="px-5 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#121212] dark:border-[#F4F2EC]"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Start Lesson</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
