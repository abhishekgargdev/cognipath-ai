import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { RoadmapMilestone } from '@/lib/db/models/RoadmapMilestone';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { processUserSkillsAndBuildRoadmap } from '@/lib/curriculum/roadmap-builder';
import { RoadmapClient, ClientRoadmapMilestone, ClientRoadmapNode } from '@/components/roadmap/RoadmapClient';

export const metadata: Metadata = {
  title: 'Topological Roadmap',
  description: 'Interactive topological curriculum roadmap and milestone tracking.',
};

export default async function RoadmapPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  await connectToDatabase();
  const userId = session.user.id;

  // 1. Fetch UserProfile & User Skills
  let userProfile = await UserProfile.findOne({ userId });
  const targetGoal = userProfile?.targetGoal || 'Full Stack Developer';
  const experienceLevel = userProfile?.experienceLevel || 'Intermediate';
  const dailyCommitmentMinutes = userProfile?.dailyCommitmentMinutes || 30;

  let userProgressDocs = await UserNodeProgress.find({ userId }).sort({ unlockDay: 1 });

  // If user has no progress entries yet, auto-trigger roadmap building for user's enrolled skills or goal
  if (userProgressDocs.length === 0) {
    const userSkillsDocs = await UserSkill.find({ userId }).lean();
    const skillsToProcess = userSkillsDocs.map((s) => ({
      skillId: s.skillId,
      name: s.name || s.skillId,
      level: s.level || 'Beginner',
    }));

    await processUserSkillsAndBuildRoadmap({
      userId,
      skills: skillsToProcess,
      targetGoal,
      experienceLevel,
      dailyCommitmentMinutes,
    });

    userProgressDocs = await UserNodeProgress.find({ userId }).sort({ unlockDay: 1 });
  }

  const progressMap = new Map(userProgressDocs.map((p) => [p.nodeId, p]));
  const userNodeIds = Array.from(progressMap.keys());

  // 2. Fetch RoadmapNodes for user's enrolled skills
  const nodesDocs = await RoadmapNode.find({ id: { $in: userNodeIds } }).sort({ sequenceOrder: 1 });

  // 3. Fetch matching Milestones
  const milestoneIds = Array.from(new Set(nodesDocs.map((n) => n.milestoneId)));
  let milestonesDocs = await RoadmapMilestone.find({ id: { $in: milestoneIds } }).sort({ sequenceOrder: 1 });

  // If milestones aren't explicitly grouped, group nodes under dynamic milestone buckets
  if (milestonesDocs.length === 0 && nodesDocs.length > 0) {
    milestonesDocs = [
      {
        id: 'ms-user-primary',
        title: 'Active Skill Progression Ladder',
        description: `Customized laddered milestones for ${targetGoal}`,
        sequenceOrder: 1,
        targetGoal,
      } as any,
    ];
  }

  // 4. Map and join data cleanly
  const milestones: ClientRoadmapMilestone[] = milestonesDocs.map((m) => {
    const milestoneNodesDocs = nodesDocs.filter(
      (n) => n.milestoneId === m.id || milestonesDocs.length === 1
    );

    const nodes: ClientRoadmapNode[] = milestoneNodesDocs.map((n) => {
      const userProg = progressMap.get(n.id);
      const userCompletedSubtopics = new Set(userProg?.completedSubtopics || []);
      return {
        id: n.id,
        milestoneId: n.milestoneId || m.id,
        title: n.title,
        category: n.category,
        categoryLabel: n.categoryLabel,
        status: userProg?.status || n.status || 'locked',
        difficulty: n.difficulty,
        estMinutes: n.estMinutes,
        masteryPercent: userProg?.masteryPercent ?? 0,
        availableFrom: userProg?.availableFrom ? userProg.availableFrom.toISOString() : null,
        prerequisites: n.prerequisites || [],
        whyItMatters: n.whyItMatters,
        description: n.description,
        sequenceOrder: n.sequenceOrder,
        subtopics: (n.subtopics || []).map((st) => ({
          id: st.id,
          title: st.title,
          sequenceOrder: st.sequenceOrder,
          completed: userCompletedSubtopics.has(st.id),
        })),
      };
    });

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      sequenceOrder: m.sequenceOrder,
      targetGoal: m.targetGoal || targetGoal,
      nodes,
    };
  });

  return (
    <RoadmapClient
      user={{
        name: session.user.name,
        email: session.user.email,
        targetGoal,
      }}
      milestones={milestones}
    />
  );
}
