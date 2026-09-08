export type ViewMode = 
  | 'landing'
  | 'dashboard'
  | 'roadmap'
  | 'learn'
  | 'practice'
  | 'progress'
  | 'skills'
  | 'recommendations'
  | 'settings'
  | 'onboarding';

export type ExperienceLevel = 'Complete Beginner' | 'Beginner' | 'Intermediate' | 'Advanced';

export type CareerGoal = 
  | 'Full Stack Developer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'AI Engineer'
  | 'Data Scientist'
  | 'DevOps Engineer'
  | 'Software Engineer'
  | 'Technical Interview Preparation'
  | string;

export interface SkillProficiency {
  skillId: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  targetGoal: CareerGoal;
  customGoal?: string;
  experienceLevel: ExperienceLevel;
  selectedSkills: SkillProficiency[];
  learningReason: string;
  dailyCommitmentMinutes: number;
  learningPreferences: string[];
  streakDays: number;
  xp: number;
  overallMastery: number;
  completedQuestionsToday: number;
  totalQuestionsTargetToday: number;
  currentTopicId: string;
  theme: 'dark' | 'light' | 'system';
}

export type NodeStatus = 'completed' | 'in_progress' | 'available' | 'locked' | 'review_needed';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Medium' | 'Hard' | 'Easy';

export interface RoadmapNode {
  id: string;
  title: string;
  category: 'foundations' | 'frontend' | 'backend' | 'databases' | 'system_design' | 'ai';
  categoryLabel: string;
  status: NodeStatus;
  difficulty: DifficultyLevel;
  estMinutes: number;
  masteryPercent: number;
  prerequisites: string[];
  whyItMatters: string;
  description: string;
  subtopics: { id: string; title: string; completed: boolean }[];
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  nodes: RoadmapNode[];
}

export interface KnowledgeCheckQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  codeSnippet?: {
    language: string;
    code: string;
    caption?: string;
  };
  highlightNote?: string;
  calloutType?: 'info' | 'warning' | 'tip';
}

export interface Lesson {
  id: string;
  topicId: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: DifficultyLevel;
  prerequisites: string[];
  masteryLevel: number;
  whyYouAreLearningThis: string;
  sections: LessonSection[];
  commonMistakes: {
    title: string;
    mistakeCode: string;
    correctionCode: string;
    explanation: string;
  }[];
  keyTakeaways: string[];
  knowledgeCheck: KnowledgeCheckQuestion[];
}

export type QuestionType = 
  | 'concept'
  | 'mcq'
  | 'output_prediction'
  | 'coding'
  | 'debugging'
  | 'scenario';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed?: boolean;
  isHidden?: boolean;
}

export interface PracticeQuestion {
  id: string;
  index: number;
  type: QuestionType;
  typeLabel: string;
  topicTitle: string;
  title: string;
  difficulty: DifficultyLevel;
  estMinutes: number;
  whyThisMatters: string;
  prompt: string;
  codeSnippet?: string;
  options?: { id: string; label: string; code?: string }[];
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
  language?: 'javascript' | 'typescript' | 'python';
  testCases?: TestCase[];
  hints?: string[];
  solution?: string;
  conceptExplanation?: ConceptExplanation;
  topSolutions?: SolutionApproach[];
}

export interface SolutionApproach {
  id: string;
  rank: number;
  title: string;
  subtitle: string;
  paradigm: string;
  timeComplexity: string;
  spaceComplexity: string;
  code: string;
  language?: string;
  explanation: string;
  pros: string[];
  cons: string[];
  whenToUse: string;
}

export interface ConceptExplanation {
  topic: string;
  theoreticalFoundation: string;
  underlyingMechanics: string;
  stepByStepTrace: string[];
  architecturalTakeaways: string;
  commonPitfalls: string[];
}

export interface EvaluationResult {
  submissionId?: string;
  score: number;
  passed: boolean;
  passedTests: number;
  totalTests: number;
  runtimeMs: number;
  memoryMb: number;
  timeComplexity: string;
  spaceComplexity: string;
  summary: string;
  whatYouDidWell: string[];
  conceptsDemonstrated: { name: string; status: string }[];
  whatCouldBeImproved: string[];
  topSolutions: SolutionApproach[];
  alternativeApproach?: string;
  conceptExplanation?: ConceptExplanation;
  aiRecommendation: string;
  aiEvaluationStatus?: 'ready' | 'unavailable';
  aiEvaluation?: any;
  failingTestDetails?: {
    input: string;
    expected: string;
    actual: string;
    commonMistakeExplanation?: string;
  };
}

export interface WeakConcept {
  id: string;
  name: string;
  category: string;
  masteryPercent: number;
  reason: string;
  recommendedAction: string;
  topicId: string;
}

export interface AIRecommendation {
  id: string;
  title: string;
  category: string;
  whyRecommendation: string;
  expectedImpact: 'Critical' | 'High' | 'Medium';
  prerequisites: { name: string; satisfied: boolean }[];
  estHours: number;
  addedToRoadmap: boolean;
  actionTopicId: string;
}

export interface SkillItem {
  id: string;
  name: string;
  category: 'Programming' | 'Frontend' | 'Backend' | 'Databases' | 'Engineering' | 'AI';
  difficulty: DifficultyLevel;
  prerequisites: string[];
  relatedSkills: string[];
  estHours: number;
  careerRelevance: string;
  trending?: boolean;
  description: string;
  selected?: boolean;
}

export interface NotificationItem {
  id: string;
  type: 'practice' | 'roadmap' | 'weakness' | 'recommendation' | 'streak';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionView?: ViewMode;
  targetId?: string;
}
