'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Pagination } from '@/components/common/Pagination';
import {
  Check,
  Lock,
  ArrowRight,
  AlertCircle,
  BookOpen,
  X,
  CheckCircle2,
  ListFilter,
  Info,
} from 'lucide-react';

export type NodeStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'review_needed';

export interface ClientRoadmapSubtopic {
  id: string;
  title: string;
  sequenceOrder?: number;
  completed: boolean;
}

export interface ClientRoadmapNode {
  id: string;
  milestoneId: string;
  title: string;
  category: string;
  categoryLabel: string;
  status: NodeStatus;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  masteryPercent: number;
  availableFrom?: string | Date | null;
  prerequisites: string[];
  whyItMatters: string;
  description: string;
  sequenceOrder: number;
  subtopics: ClientRoadmapSubtopic[];
}

export interface ClientRoadmapMilestone {
  id: string;
  title: string;
  description: string;
  sequenceOrder: number;
  targetGoal: string;
  nodes: ClientRoadmapNode[];
}

export interface RoadmapClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    targetGoal: string;
  };
  milestones: ClientRoadmapMilestone[];
}

export function RoadmapClient({ user, milestones: initialMilestones }: RoadmapClientProps) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<ClientRoadmapMilestone[]>(initialMilestones);
  const [selectedNode, setSelectedNode] = useState<ClientRoadmapNode | null>(null);
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(2);
  const [hoveredLockedNodeId, setHoveredLockedNodeId] = useState<string | null>(null);
  const [updatingSubtopicId, setUpdatingSubtopicId] = useState<string | null>(null);
  const [patchError, setPatchError] = useState<string | null>(null);

  // Flattened nodes for overall progress metrics
  const allNodes = useMemo(() => milestones.flatMap((ms) => ms.nodes), [milestones]);
  const totalTopics = allNodes.length;
  const masteredCount = allNodes.filter((n) => n.status === 'completed').length;
  const totalMasterySum = allNodes.reduce((acc, n) => acc + (n.masteryPercent || 0), 0);
  const masteryPercentage = totalTopics > 0 ? Math.round(totalMasterySum / totalTopics) : 0;

  // Filtered milestones
  const filteredMilestones = useMemo(() => {
    if (selectedMilestoneId === 'all') return milestones;
    return milestones.filter((m) => m.id === selectedMilestoneId);
  }, [milestones, selectedMilestoneId]);

  // Paginated milestones
  const totalPages = Math.ceil(filteredMilestones.length / pageSize) || 1;
  const paginatedMilestones = useMemo(() => {
    if (selectedMilestoneId !== 'all') return filteredMilestones;
    const start = (currentPage - 1) * pageSize;
    return filteredMilestones.slice(start, start + pageSize);
  }, [filteredMilestones, selectedMilestoneId, currentPage, pageSize]);

  const handleMilestoneFilterChange = (id: string) => {
    setSelectedMilestoneId(id);
    setCurrentPage(1);
  };

  // Subtopic Toggle API Handler
  const handleToggleSubtopic = async (nodeId: string, subtopicId: string, currentCompleted: boolean) => {
    setUpdatingSubtopicId(subtopicId);
    setPatchError(null);

    const targetNode = allNodes.find((n) => n.id === nodeId);
    if (targetNode?.status === 'locked') {
      const errMsg = 'Cannot complete subtopics on a locked node. Prerequisites must be completed first.';
      setPatchError(errMsg);
      toast.error(errMsg);
      setUpdatingSubtopicId(null);
      return;
    }

    try {
      const res = await fetch(`/api/roadmap/nodes/${nodeId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtopicId, completed: !currentCompleted }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update subtopic progress');
      }

      const { node: updatedNode, userProgress } = await res.json();
      toast.success(currentCompleted ? 'Subtopic marked as pending.' : 'Subtopic completed! Mastery updated.');

      // Update state locally
      setMilestones((prevMilestones) =>
        prevMilestones.map((m) => ({
          ...m,
          nodes: m.nodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                subtopics: n.subtopics.map((st) =>
                  st.id === subtopicId ? { ...st, completed: !currentCompleted } : st
                ),
                masteryPercent: userProgress.masteryPercent,
                status: userProgress.status,
              };
            }
            return n;
          }),
        }))
      );

      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode((prev) =>
          prev
            ? {
                ...prev,
                subtopics: prev.subtopics.map((st) =>
                  st.id === subtopicId ? { ...st, completed: !currentCompleted } : st
                ),
                masteryPercent: userProgress.masteryPercent,
                status: userProgress.status,
              }
            : null
        );
      }

      // Revalidate Server Data
      router.refresh();
    } catch (err: any) {
      setPatchError(err.message || 'Failed to update progress');
    } finally {
      setUpdatingSubtopicId(null);
    }
  };

  const getDaysUntilAvailable = (availableFrom?: string | Date | null): number => {
    if (!availableFrom) return 0;
    const availDate = new Date(availableFrom);
    const now = new Date();
    if (availDate.getTime() <= now.getTime()) return 0;
    return Math.ceil((availDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getStatusBadge = (status: NodeStatus, mastery: number, availableFrom?: string | Date | null) => {
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
      case 'locked': {
        const daysLeft = getDaysUntilAvailable(availableFrom);
        if (daysLeft > 0) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#8B2635]/30 bg-[#8B2635]/10 text-[#8B2635] dark:text-[#E08A95]">
              <Lock className="w-2.5 h-2.5" /> Unlocks in {daysLeft} day{daysLeft > 1 ? 's' : ''}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[9px] font-mono font-bold tracking-wider uppercase border border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 bg-transparent text-[#9E9A91]">
            <Lock className="w-2.5 h-2.5" /> Prerequisite Required
          </span>
        );
      }
    }
  };

  return (
    <div id="roadmap-view" className="space-y-8 max-w-5xl mx-auto animate-in fade-in duration-200 p-4 sm:p-6">
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
                style={{ width: `${masteryPercentage}%` }}
              />
            </div>
          </div>
          <div className="border-l border-[#DCD9D1] dark:border-[#2C2A26] pl-4 text-right">
            <span className="text-xl font-serif font-black text-[#121212] dark:text-[#F4F2EC]">
              {masteryPercentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Milestone Selection Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[10px] font-mono uppercase text-[#5C5852] dark:text-[#9E9A91] mr-1 flex items-center gap-1">
            <ListFilter className="w-3 h-3" /> Milestones:
          </span>
          <button
            type="button"
            onClick={() => handleMilestoneFilterChange('all')}
            className={`px-2.5 py-1 rounded-xs text-xs font-serif font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedMilestoneId === 'all'
                ? 'bg-[#121212] text-white dark:bg-[#F4F2EC] dark:text-[#121212] border border-[#121212] dark:border-[#F4F2EC]'
                : 'bg-[#FFFFFF] dark:bg-[#181714] text-[#5C5852] dark:text-[#9E9A91] border border-[#DCD9D1] dark:border-[#2C2A26] hover:bg-[#F4F1EA] dark:hover:bg-[#201F1B]'
            }`}
          >
            All Milestones ({milestones.length})
          </button>
          {milestones.map((m, idx) => (
            <button
              key={m.id}
              type="button"
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
          {selectedMilestoneId === 'all'
            ? `Showing ${paginatedMilestones.length} of ${milestones.length} milestones`
            : 'Single Milestone View'}
        </span>
      </div>

      {/* Hierarchical Roadmap Milestones */}
      <div className="space-y-10">
        {paginatedMilestones.map((milestone, mIndex) => {
          const originalIndex = milestones.findIndex((m) => m.id === milestone.id);
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
                  <p className="text-xs font-serif italic text-[#5C5852] dark:text-[#9E9A91]">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Nodes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-4 pl-4 border-l-2 border-[#DCD9D1] dark:border-[#2C2A26]">
                {milestone.nodes.map((node) => {
                  const isLocked = node.status === 'locked';
                  const isCompleted = node.status === 'completed';
                  const isReviewNeeded = node.status === 'review_needed';

                  return (
                    <div
                      key={node.id}
                      id={`roadmap-node-${node.id}`}
                      onMouseEnter={() => isLocked && setHoveredLockedNodeId(node.id)}
                      onMouseLeave={() => setHoveredLockedNodeId(null)}
                      onClick={() => setSelectedNode(node)}
                      className={`p-4 rounded-xs border text-left transition-all cursor-pointer relative h-full flex flex-col justify-between ${
                        isLocked
                          ? 'border-[#DCD9D1]/60 dark:border-[#2C2A26]/60 bg-[#F4F1EA]/40 dark:bg-[#151412] opacity-75'
                          : isReviewNeeded
                          ? 'border-[#8B2635] bg-[#FFFFFF] dark:bg-[#181714] shadow-xs'
                          : isCompleted
                          ? 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC] shadow-xs'
                          : 'border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#181714] hover:border-[#121212] dark:hover:border-[#F4F2EC] shadow-xs'
                      }`}
                    >
                      {/* Prerequisite or Drip Unlock Popover for Locked Nodes */}
                      {isLocked && (() => {
                        const daysLeft = getDaysUntilAvailable(node.availableFrom);
                        return (
                          <div className="mb-2 p-2 rounded-xs border border-[#8B2635]/30 bg-[#8B2635]/5 text-[10px] font-mono text-[#8B2635] dark:text-[#E08A95] flex items-start gap-1.5">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold uppercase tracking-wider block">
                                {daysLeft > 0 ? `Scheduled Unlock (In ${daysLeft} day${daysLeft > 1 ? 's' : ''})` : 'Locked Node'}
                              </span>
                              <span>
                                {daysLeft > 0 ? (
                                  <>Unlocks on: <strong>{new Date(node.availableFrom!).toLocaleDateString()}</strong></>
                                ) : (
                                  <>Requires completing: <strong>{node.prerequisites.join(', ') || 'Parent Milestone Topics'}</strong></>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      <div>
                        {/* Node Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          {getStatusBadge(node.status, node.masteryPercent, node.availableFrom)}
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
                        <span>
                          {node.subtopics.filter((s) => s.completed).length} / {node.subtopics.length} subtopics
                        </span>
                        <span className="text-[#121212] dark:text-[#F4F2EC] font-serif font-bold flex items-center gap-1">
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

      {/* Pagination Component */}
      {selectedMilestoneId === 'all' && filteredMilestones.length > pageSize && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredMilestones.length}
          onPageChange={(p) => setCurrentPage(p)}
          onPageSizeChange={(s) => {
            setPageSize(s);
            setCurrentPage(1);
          }}
          pageSizeOptions={[2, 3, 5]}
        />
      )}

      {/* Selected Node Detail Drawer / Modal */}
      {selectedNode && (
        <div
          id="topic-detail-drawer"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => {
            setSelectedNode(null);
            setPatchError(null);
          }}
        >
          <div
            className="w-full max-w-lg rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#F9F7F2] dark:bg-[#121210] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedNode(null);
                setPatchError(null);
              }}
              className="absolute top-4 right-4 text-[#5C5852] hover:text-[#121212] dark:text-[#9E9A91] dark:hover:text-[#F4F2EC] p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(selectedNode.status, selectedNode.masteryPercent, selectedNode.availableFrom)}
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

            {patchError && (
              <div className="mt-3 p-3 rounded-xs bg-[#8B2635]/10 border border-[#8B2635] text-[#8B2635] text-xs font-serif">
                <strong>Progress Update Error:</strong> {patchError}
              </div>
            )}

            {/* Why This Matters */}
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
                  Prerequisites Required:
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

            {/* Subtopics Checklist with Interactive Toggles */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#5C5852] dark:text-[#9E9A91] block mb-2">
                Curriculum Subtopic Checklist ({selectedNode.subtopics.length}):
              </span>
              <div className="space-y-1.5">
                {selectedNode.subtopics.map((st) => {
                  const isUpdating = updatingSubtopicId === st.id;
                  const isLocked = selectedNode.status === 'locked';

                  return (
                    <div
                      key={st.id}
                      onClick={() => !isUpdating && handleToggleSubtopic(selectedNode.id, st.id, st.completed)}
                      className={`flex items-center justify-between p-2.5 rounded-xs border text-xs font-serif transition-colors cursor-pointer ${
                        isLocked
                          ? 'bg-[#F4F1EA]/50 dark:bg-[#151412] border-[#DCD9D1]/50 dark:border-[#2C2A26]/50 opacity-60'
                          : st.completed
                          ? 'bg-[#F4F1EA] dark:bg-[#1C1B18] border-[#DCD9D1] dark:border-[#2C2A26]'
                          : 'bg-[#FFFFFF] dark:bg-[#181714] border-[#DCD9D1] dark:border-[#2C2A26] hover:border-[#121212]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          disabled={isUpdating || isLocked}
                          onChange={() => {}} // Handled by div onClick
                          className="w-4 h-4 rounded-xs accent-[#8B2635] cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span
                          className={`font-medium ${
                            st.completed ? 'line-through text-[#5C5852] dark:text-[#9E9A91]' : 'text-[#121212] dark:text-[#F4F2EC]'
                          }`}
                        >
                          {st.title}
                        </span>
                      </div>

                      {isUpdating ? (
                        <span className="text-[10px] font-mono text-[#8B2635] animate-pulse">Saving...</span>
                      ) : st.completed ? (
                        <span className="text-[10px] font-mono text-[#1F3A2B] dark:text-[#4E876A] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#9E9A91]">Pending</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-[#DCD9D1] dark:border-[#2C2A26] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={selectedNode.status === 'locked'}
                onClick={() => {
                  router.push(`/practice?topic=${selectedNode.id}`);
                }}
                className="px-4 py-2 rounded-xs border border-[#DCD9D1] dark:border-[#2C2A26] bg-[#FFFFFF] dark:bg-[#1C1B18] text-xs font-serif font-bold hover:bg-[#F4F1EA] dark:hover:bg-[#252420] text-[#121212] dark:text-[#F4F2EC] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Practice Questions
              </button>

              <button
                type="button"
                id="start-learn-node-btn"
                disabled={selectedNode.status === 'locked'}
                onClick={() => {
                  router.push(`/learn?topic=${selectedNode.id}`);
                }}
                className="px-5 py-2 rounded-xs bg-[#121212] dark:bg-[#F4F2EC] hover:bg-[#2A2A2A] dark:hover:bg-[#FFFFFF] text-[#FFFFFF] dark:text-[#121212] text-xs font-serif font-bold flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#121212] dark:border-[#F4F2EC] disabled:opacity-50 disabled:cursor-not-allowed"
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
}
