import { connectToDatabase } from '@/lib/db/mongoose';
import { UserProfile } from '@/lib/db/models/UserProfile';
import { UserSkill } from '@/lib/db/models/UserSkill';
import { SkillTaxonomy } from '@/lib/db/models/SkillTaxonomy';
import { RoadmapMilestone } from '@/lib/db/models/RoadmapMilestone';
import { RoadmapNode } from '@/lib/db/models/RoadmapNode';
import { UserNodeProgress } from '@/lib/db/models/UserNodeProgress';
import { acquireLock, releaseLock } from '@/lib/ai/cache';
import { generateSkillNodeTask, GeneratedSkillNode } from '@/lib/ai/tasks/generate-skill-node';

export interface UserSkillInputItem {
  skillId?: string;
  name: string;
  level?: string;
}

export interface RoadmapBuildOptions {
  userId: string;
  skills: UserSkillInputItem[];
  targetGoal: string;
  experienceLevel?: string;
  dailyCommitmentMinutes?: number;
}

// Known skill ordering hierarchy weights for skill laddering
const SKILL_HIERARCHY_WEIGHTS: Record<string, number> = {
  html: 10,
  css: 15,
  tailwind: 20,
  javascript: 30,
  typescript: 40,
  react: 50,
  vue: 52,
  angular: 54,
  nextjs: 60,
  nodejs: 65,
  express: 70,
  python: 72,
  fastapi: 74,
  django: 76,
  sql: 78,
  postgresql: 80,
  mongodb: 82,
  redis: 85,
  graphql: 88,
  docker: 90,
  kubernetes: 92,
  aws: 93,
  dsa: 95,
  ai: 97,
  llm: 98,
  rag: 99,
  'system-design': 100,
};

function getSkillWeight(skillName: string): number {
  const normalized = skillName.toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [key, weight] of Object.entries(SKILL_HIERARCHY_WEIGHTS)) {
    if (normalized.includes(key)) return weight;
  }
  return 50; // Default intermediate weight
}

export function ladderUserSkills(skills: UserSkillInputItem[]): UserSkillInputItem[] {
  // Deduplicate by normalized name
  const seen = new Set<string>();
  const uniqueSkills: UserSkillInputItem[] = [];

  for (const item of skills) {
    const cleanName = item.name.trim();
    if (!cleanName) continue;
    const key = cleanName.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSkills.push({
        ...item,
        name: cleanName,
      });
    }
  }

  // Sort by ladder weight ascending (foundational to advanced)
  return uniqueSkills.sort((a, b) => getSkillWeight(a.name) - getSkillWeight(b.name));
}

export async function processUserSkillsAndBuildRoadmap(options: RoadmapBuildOptions) {
  await connectToDatabase();

  const { userId, targetGoal, experienceLevel = 'Intermediate', dailyCommitmentMinutes = 30 } = options;

  let inputSkills = options.skills || [];

  // If no skills provided in options, check if user already has skills saved in DB
  if (inputSkills.length === 0) {
    const existingUserSkills = await UserSkill.find({ userId }).lean();
    if (existingUserSkills.length > 0) {
      inputSkills = existingUserSkills.map((s) => ({
        skillId: s.skillId,
        name: s.name || s.skillId,
        level: s.level || experienceLevel,
      }));
    }
  }

  // If user has not selected any skills yet, return 0 enrolled skills without injecting hardcoded defaults
  if (inputSkills.length === 0) {
    return {
      success: true,
      enrolledCount: 0,
      nodeIds: [],
    };
  }

  // 1. Ladder and sequence skills logically
  const ladderedSkills = ladderUserSkills(inputSkills);

  // 2. Save user skills roster to UserSkill model
  for (const skill of ladderedSkills) {
    const skillSlug = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const skillId = skill.skillId || `skill-${skillSlug}`;
    const level = (['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'].includes(skill.level || '')
      ? skill.level
      : experienceLevel) as any;

    await UserSkill.findOneAndUpdate(
      { userId, skillId },
      { userId, skillId, name: skill.name, level },
      { upsert: true }
    );
  }

  // 3. For each skill, ensure RoadmapNode & RoadmapMilestone exist in DB (or generate via AI)
  const nodeIds: string[] = [];
  const milestonesCreated: string[] = [];

  for (let i = 0; i < ladderedSkills.length; i++) {
    const skill = ladderedSkills[i];
    const skillSlug = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const expectedNodeId = skill.skillId && !skill.skillId.startsWith('custom-') ? skill.skillId : `skill-${skillSlug}`;

    // DB Lookup: check if node already exists
    let existingNode = await RoadmapNode.findOne({
      $or: [
        { id: expectedNodeId },
        { id: skillSlug },
        { title: { $regex: new RegExp(`^${skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
      ],
    }).lean();

    let nodeToUse: any = existingNode;

    if (!existingNode) {
      // Missing in DB: acquire Redis lock and generate with AI
      const lockKey = `lock_skill_gen_${skillSlug}`;
      const acquired = await acquireLock(lockKey, 30);

      try {
        const generated: GeneratedSkillNode = await generateSkillNodeTask({
          skillName: skill.name,
          targetGoal,
          experienceLevel,
        });

        const milestoneId = `ms-gen-${skillSlug}`;

        // Upsert RoadmapMilestone
        await RoadmapMilestone.findOneAndUpdate(
          { id: milestoneId },
          {
            id: milestoneId,
            title: generated.milestoneTitle,
            description: generated.milestoneDescription,
            sequenceOrder: i + 1,
            targetGoal,
          },
          { upsert: true }
        );
        milestonesCreated.push(milestoneId);

        // Upsert RoadmapNode
        const createdNode = await RoadmapNode.findOneAndUpdate(
          { id: generated.skillId },
          {
            id: generated.skillId,
            milestoneId,
            title: generated.title,
            category: generated.category,
            categoryLabel: generated.categoryLabel,
            status: i === 0 ? 'available' : 'locked',
            difficulty: generated.difficulty,
            estMinutes: generated.estMinutes,
            masteryPercent: 0,
            prerequisites: generated.prerequisites,
            whyItMatters: generated.whyItMatters,
            description: generated.description,
            sequenceOrder: i + 1,
            subtopics: generated.subtopics,
          },
          { upsert: true, returnDocument: 'after' }
        ).lean();

        nodeToUse = createdNode;

        // Upsert SkillTaxonomy so catalog searches pick it up
        await SkillTaxonomy.findOneAndUpdate(
          { id: generated.skillId },
          {
            id: generated.skillId,
            name: generated.title,
            category: generated.categoryLabel,
            difficulty: generated.difficulty,
            prerequisites: generated.prerequisites,
            relatedSkills: [],
            estHours: Math.round(generated.estMinutes / 60) || 2,
            careerRelevance: generated.careerRelevance,
            description: generated.description,
            trending: true,
          },
          { upsert: true }
        );
      } finally {
        if (acquired) {
          await releaseLock(lockKey);
        }
      }
    }

    if (nodeToUse && nodeToUse.id) {
      nodeIds.push(nodeToUse.id);
    }
  }

  // 4. Initialize or update UserNodeProgress for each node in the ladder
  const daysPerNode = dailyCommitmentMinutes <= 15 ? 3 : dailyCommitmentMinutes <= 45 ? 2 : 1;
  const now = new Date();

  for (let i = 0; i < nodeIds.length; i++) {
    const nodeId = nodeIds[i];
    const initialStatus = i === 0 ? 'available' : 'locked';
    const availableFrom = new Date(now.getTime() + i * daysPerNode * 24 * 60 * 60 * 1000);

    // Keep existing progress if completed/in_progress, otherwise update unlock schedule
    const existingProgress = await UserNodeProgress.findOne({ userId, nodeId }).lean();

    if (!existingProgress) {
      await UserNodeProgress.create({
        userId,
        nodeId,
        status: initialStatus,
        masteryPercent: 0,
        unlockDay: i * daysPerNode,
        availableFrom,
        completedSubtopics: [],
      });
    }
  }

  // 5. Update UserProfile with onboarding timestamp and active current topic
  if (nodeIds.length > 0) {
    const firstNodeId = nodeIds[0];
    await UserProfile.updateOne(
      { userId },
      {
        targetGoal,
        experienceLevel: (['Complete Beginner', 'Beginner', 'Intermediate', 'Advanced'].includes(experienceLevel)
          ? experienceLevel
          : 'Intermediate') as any,
        dailyCommitmentMinutes,
        currentTopicId: firstNodeId,
        onboardingCompletedAt: new Date(),
      },
      { upsert: true }
    );
  }

  return {
    success: true,
    enrolledCount: ladderedSkills.length,
    nodeIds,
  };
}
