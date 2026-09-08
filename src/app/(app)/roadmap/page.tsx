import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { RoadmapMilestone } from '@/lib/db/models/RoadmapMilestone';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
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

  // 1. Fetch UserProfile
  const userProfile = await UserProfile.findOne({ userId });
  const targetGoal = userProfile?.targetGoal || 'Full Stack Developer';

  // 2. Fetch Milestones & Nodes
  let milestonesDocs = await RoadmapMilestone.find({ targetGoal }).sort({ sequenceOrder: 1 });
  if (!milestonesDocs || milestonesDocs.length === 0) {
    // Fallback: fetch any milestones available if user's goal milestones aren't seeded yet
    milestonesDocs = await RoadmapMilestone.find().sort({ sequenceOrder: 1 }).limit(10);
  }

  const milestoneIds = milestonesDocs.map((m) => m.id);
  const nodesDocs = await RoadmapNode.find({ milestoneId: { $in: milestoneIds } }).sort({ sequenceOrder: 1 });

  // 3. Fetch User Progress Rows
  const userProgressDocs = await UserNodeProgress.find({ userId });
  const progressMap = new Map(userProgressDocs.map((p) => [p.nodeId, p]));

  // 4. Join Data in Application Code
  const milestones: ClientRoadmapMilestone[] = milestonesDocs.map((m) => {
    const milestoneNodesDocs = nodesDocs.filter((n) => n.milestoneId === m.id);

    const nodes: ClientRoadmapNode[] = milestoneNodesDocs.map((n) => {
      const userProg = progressMap.get(n.id);
      return {
        id: n.id,
        milestoneId: n.milestoneId,
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
          completed: Boolean(st.completed),
        })),
      };
    });

    return {
      id: m.id,
      title: m.title,
      description: m.description,
      sequenceOrder: m.sequenceOrder,
      targetGoal: m.targetGoal,
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
