export interface SkillCatalogItem {
  id: string;
  name: string;
  category: 'Programming' | 'Frontend' | 'Backend' | 'Databases' | 'Engineering' | 'AI';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const defaultSkillsCatalog: SkillCatalogItem[] = [
  { id: 'js', name: 'JavaScript', category: 'Programming', difficulty: 'Beginner' },
  { id: 'ts', name: 'TypeScript', category: 'Programming', difficulty: 'Intermediate' },
  { id: 'python', name: 'Python', category: 'Programming', difficulty: 'Beginner' },
  { id: 'react', name: 'React', category: 'Frontend', difficulty: 'Intermediate' },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', difficulty: 'Intermediate' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'Frontend', difficulty: 'Beginner' },
  { id: 'nodejs', name: 'Node.js', category: 'Backend', difficulty: 'Intermediate' },
  { id: 'express', name: 'Express.js', category: 'Backend', difficulty: 'Beginner' },
  { id: 'fastapi', name: 'FastAPI', category: 'Backend', difficulty: 'Intermediate' },
  { id: 'sql', name: 'SQL & PostgreSQL', category: 'Databases', difficulty: 'Beginner' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', difficulty: 'Beginner' },
  { id: 'redis', name: 'Redis Caching', category: 'Databases', difficulty: 'Intermediate' },
  { id: 'docker', name: 'Docker & Containers', category: 'Engineering', difficulty: 'Intermediate' },
  { id: 'system-design', name: 'System Design', category: 'Engineering', difficulty: 'Advanced' },
  { id: 'dsa', name: 'Data Structures & Algorithms', category: 'Engineering', difficulty: 'Intermediate' },
  { id: 'llm-rag', name: 'LLM & RAG Systems', category: 'AI', difficulty: 'Advanced' },
  { id: 'langchain', name: 'LangChain & Agents', category: 'AI', difficulty: 'Intermediate' },
  { id: 'pytorch', name: 'PyTorch Fundamentals', category: 'AI', difficulty: 'Advanced' },
];
