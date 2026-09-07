import { UserProfile, RoadmapMilestone, WeakConcept, AIRecommendation, SkillItem, NotificationItem } from '../types';

export const initialUser: UserProfile = {
  id: 'usr_alex_01',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  targetGoal: 'Full Stack Developer',
  experienceLevel: 'Intermediate',
  learningReason: 'Switch careers & land a senior full stack role',
  dailyCommitmentMinutes: 30,
  learningPreferences: ['Explanations', 'Examples', 'Coding', 'Debugging', 'Real-world scenarios'],
  streakDays: 18,
  xp: 1480,
  overallMastery: 72,
  completedQuestionsToday: 3,
  totalQuestionsTargetToday: 5,
  currentTopicId: 'js-closures',
  theme: 'dark',
  selectedSkills: [
    { skillId: 'js', name: 'JavaScript', level: 'Intermediate' },
    { skillId: 'ts', name: 'TypeScript', level: 'Intermediate' },
    { skillId: 'react', name: 'React', level: 'Intermediate' },
    { skillId: 'nextjs', name: 'Next.js', level: 'Beginner' },
    { skillId: 'nodejs', name: 'Node.js', level: 'Intermediate' },
    { skillId: 'mongodb', name: 'MongoDB', level: 'Beginner' },
    { skillId: 'dsa', name: 'Data Structures & Algorithms', level: 'Intermediate' },
    { skillId: 'system-design', name: 'System Design', level: 'Beginner' }
  ]
};

export const initialRoadmapMilestones: RoadmapMilestone[] = [
  {
    id: 'ms-foundations',
    title: 'FOUNDATIONS',
    description: 'Core runtime principles, functional paradigms, and language mechanics',
    nodes: [
      {
        id: 'js-fundamentals',
        title: 'JavaScript Fundamentals',
        category: 'foundations',
        categoryLabel: 'Foundations',
        status: 'completed',
        difficulty: 'Beginner',
        estMinutes: 45,
        masteryPercent: 96,
        prerequisites: [],
        whyItMatters: 'Rock-solid execution context, primitive types, and memory allocation are the bedrock for debugging complex web applications.',
        description: 'Variables, coercion, scopes, reference types, and standard ES2022 features.',
        subtopics: [
          { id: 'st-1', title: 'Primitive vs Reference types', completed: true },
          { id: 'st-2', title: 'Type coercion & strict equality', completed: true },
          { id: 'st-3', title: 'Destructuring & spread operators', completed: true }
        ]
      },
      {
        id: 'functions-scope',
        title: 'Functions & Scope Chain',
        category: 'foundations',
        categoryLabel: 'Foundations',
        status: 'completed',
        difficulty: 'Beginner',
        estMinutes: 50,
        masteryPercent: 91,
        prerequisites: ['JavaScript Fundamentals'],
        whyItMatters: 'Functions are first-class citizens in JS. Understanding lexical scoping prevents variable leakage and mysterious bugs.',
        description: 'First-class citizens, higher-order functions, arrow functions, and the scope resolution lookup chain.',
        subtopics: [
          { id: 'st-4', title: 'Lexical Environment and scope resolution', completed: true },
          { id: 'st-5', title: 'Arrow functions vs function declarations', completed: true },
          { id: 'st-6', title: 'Higher-order array methods (map/filter/reduce)', completed: true }
        ]
      },
      {
        id: 'js-closures',
        title: 'Closures & Scope Retention',
        category: 'foundations',
        categoryLabel: 'Foundations',
        status: 'in_progress',
        difficulty: 'Intermediate',
        estMinutes: 40,
        masteryPercent: 78,
        prerequisites: ['Functions & Scope Chain'],
        whyItMatters: 'Closures power React hooks (useState, useEffect), module encapsulation, factory functions, and currying.',
        description: 'How functions retain access to outer lexical environments even after parent executions have returned.',
        subtopics: [
          { id: 'st-7', title: 'Scope chain retention in the heap', completed: true },
          { id: 'st-8', title: 'Data privacy & factory patterns', completed: true },
          { id: 'st-9', title: 'Memory leak pitfalls in closures', completed: false }
        ]
      },
      {
        id: 'async-event-loop',
        title: 'Async JavaScript & Event Loop',
        category: 'foundations',
        categoryLabel: 'Foundations',
        status: 'review_needed',
        difficulty: 'Intermediate',
        estMinutes: 60,
        masteryPercent: 58,
        prerequisites: ['Closures & Scope Retention'],
        whyItMatters: 'Modern web apps rely entirely on non-blocking I/O. Misunderstanding microtasks causes race conditions and UI freezing.',
        description: 'Call stack, Web APIs, Macrotask queue vs Microtask queue, Promises, async/await mechanics.',
        subtopics: [
          { id: 'st-10', title: 'Event loop ticks & microtask priorities', completed: true },
          { id: 'st-11', title: 'Promise chaining & uncaught rejections', completed: false },
          { id: 'st-12', title: 'Async/Await error boundaries & concurrency', completed: false }
        ]
      }
    ]
  },
  {
    id: 'ms-frontend',
    title: 'FRONTEND ARCHITECTURE',
    description: 'Declarative UI, component lifecycle, reactive state, and modern SSR frameworks',
    nodes: [
      {
        id: 'react-fundamentals',
        title: 'React Core & Virtual DOM',
        category: 'frontend',
        categoryLabel: 'Frontend',
        status: 'completed',
        difficulty: 'Intermediate',
        estMinutes: 65,
        masteryPercent: 88,
        prerequisites: ['Closures & Scope Retention'],
        whyItMatters: 'Understanding reconciliation, virtual DOM diffing, and component purity ensures fast, predictable renders.',
        description: 'JSX compilation, reconciliation diffing algorithm, props drilling, and pure render cycles.',
        subtopics: [
          { id: 'st-13', title: 'JSX and React.createElement', completed: true },
          { id: 'st-14', title: 'Component lifecycle & side-effects', completed: true },
          { id: 'st-15', title: 'Virtual DOM reconciliation', completed: true }
        ]
      },
      {
        id: 'state-management',
        title: 'State Management & Custom Hooks',
        category: 'frontend',
        categoryLabel: 'Frontend',
        status: 'in_progress',
        difficulty: 'Intermediate',
        estMinutes: 55,
        masteryPercent: 72,
        prerequisites: ['React Core & Virtual DOM'],
        whyItMatters: 'Well-structured state prevents unnecessary re-renders and keeps business logic decoupled from presentational components.',
        description: 'useState, useReducer, context API, custom reusable hooks, and state colocation best practices.',
        subtopics: [
          { id: 'st-16', title: 'useReducer for complex state machines', completed: true },
          { id: 'st-17', title: 'Encapsulating logic into Custom Hooks', completed: true },
          { id: 'st-18', title: 'Context performance optimizations (memo/useMemo)', completed: false }
        ]
      },
      {
        id: 'nextjs-app-router',
        title: 'Next.js App Router & Server Components',
        category: 'frontend',
        categoryLabel: 'Frontend',
        status: 'available',
        difficulty: 'Advanced',
        estMinutes: 70,
        masteryPercent: 42,
        prerequisites: ['State Management & Custom Hooks'],
        whyItMatters: 'React Server Components (RSC) eliminate client-side bundle bloat and deliver instantaneous First Contentful Paint.',
        description: 'Server vs Client components, streaming with Suspense, routing segments, and server actions.',
        subtopics: [
          { id: 'st-19', title: 'Server Components vs Client boundary ("use client")', completed: true },
          { id: 'st-20', title: 'Data fetching & revalidation strategies', completed: false },
          { id: 'st-21', title: 'Server actions & mutations', completed: false }
        ]
      }
    ]
  },
  {
    id: 'ms-backend',
    title: 'BACKEND SERVICES & APIS',
    description: 'Server runtimes, RESTful contracts, authentication, and secure endpoints',
    nodes: [
      {
        id: 'nodejs-runtime',
        title: 'Node.js Internals & Express',
        category: 'backend',
        categoryLabel: 'Backend',
        status: 'completed',
        difficulty: 'Intermediate',
        estMinutes: 60,
        masteryPercent: 80,
        prerequisites: ['Async JavaScript & Event Loop'],
        whyItMatters: 'Understanding libuv, stream piping, and Express middleware architectures allows you to build high-throughput APIs.',
        description: 'V8 engine bindings, libuv thread pool, Express middleware routing pipelines, and streaming I/O.',
        subtopics: [
          { id: 'st-22', title: 'libuv event loop & thread pool delegation', completed: true },
          { id: 'st-23', title: 'Building modular Express middleware', completed: true },
          { id: 'st-24', title: 'Buffer and Streams for large payloads', completed: true }
        ]
      },
      {
        id: 'rest-api-design',
        title: 'REST API Design & Validation',
        category: 'backend',
        categoryLabel: 'Backend',
        status: 'completed',
        difficulty: 'Intermediate',
        estMinutes: 50,
        masteryPercent: 85,
        prerequisites: ['Node.js Internals & Express'],
        whyItMatters: 'Predictable status codes, idempotent routes, and schema validation prevent security vulnerabilities and API drift.',
        description: 'HTTP semantics, idempotent methods, Zod schema validation, and structured error responses.',
        subtopics: [
          { id: 'st-25', title: 'HTTP status codes & idempotency', completed: true },
          { id: 'st-26', title: 'Request validation with Zod', completed: true },
          { id: 'st-27', title: 'Global error handling middleware', completed: true }
        ]
      },
      {
        id: 'auth-security',
        title: 'Authentication, JWT & Security',
        category: 'backend',
        categoryLabel: 'Backend',
        status: 'in_progress',
        difficulty: 'Advanced',
        estMinutes: 65,
        masteryPercent: 64,
        prerequisites: ['REST API Design & Validation'],
        whyItMatters: 'Flawed auth leads to catastrophic data breaches. Stateless JWTs paired with secure httpOnly refresh cookies are industry standard.',
        description: 'Hashing with Argon2/Bcrypt, Access vs Refresh token rotation, CORS, CSRF, and rate limiting.',
        subtopics: [
          { id: 'st-28', title: 'Token rotation with httpOnly cookies', completed: true },
          { id: 'st-29', title: 'Password hashing & salt rounds', completed: true },
          { id: 'st-30', title: 'CORS policies & security headers', completed: false }
        ]
      }
    ]
  },
  {
    id: 'ms-databases',
    title: 'DATABASES & DATA MODELING',
    description: 'Relational vs document data stores, indexing strategies, and caching',
    nodes: [
      {
        id: 'sql-design',
        title: 'PostgreSQL & Relational Schema',
        category: 'databases',
        categoryLabel: 'Databases',
        status: 'completed',
        difficulty: 'Intermediate',
        estMinutes: 55,
        masteryPercent: 82,
        prerequisites: ['REST API Design & Validation'],
        whyItMatters: 'Relational normalization, foreign key constraints, and transactions guarantee ACID consistency for financial or critical data.',
        description: 'Normalization, joins, B-Tree indexes, transactions, and migration tools.',
        subtopics: [
          { id: 'st-31', title: 'ACID transactions & isolation levels', completed: true },
          { id: 'st-32', title: 'Complex JOIN queries & aggregation', completed: true },
          { id: 'st-33', title: 'Index optimization with EXPLAIN ANALYZE', completed: true }
        ]
      },
      {
        id: 'mongodb-modeling',
        title: 'MongoDB & Document Modeling',
        category: 'databases',
        categoryLabel: 'Databases',
        status: 'in_progress',
        difficulty: 'Intermediate',
        estMinutes: 50,
        masteryPercent: 60,
        prerequisites: ['PostgreSQL & Relational Schema'],
        whyItMatters: 'Document databases excel at polymorphic structures, rapid schema evolution, and hierarchical nesting.',
        description: 'Embedded documents vs references, aggregation pipelines, and compound index planning.',
        subtopics: [
          { id: 'st-34', title: 'Embedding vs Referencing tradeoffs', completed: true },
          { id: 'st-35', title: 'Aggregation pipeline stages ($match, $lookup, $group)', completed: false },
          { id: 'st-36', title: 'Schema validation rules in Mongoose', completed: true }
        ]
      },
      {
        id: 'redis-caching',
        title: 'Redis Caching & Invalidation',
        category: 'databases',
        categoryLabel: 'Databases',
        status: 'available',
        difficulty: 'Intermediate',
        estMinutes: 45,
        masteryPercent: 30,
        prerequisites: ['MongoDB & Document Modeling'],
        whyItMatters: 'Sub-millisecond in-memory caching shields your primary database from expensive queries and supports distributed locks.',
        description: 'Cache-aside patterns, TTL expiration, cache stampede mitigation, and Pub/Sub basics.',
        subtopics: [
          { id: 'st-37', title: 'Cache-aside & Write-through strategies', completed: false },
          { id: 'st-38', title: 'Atomic increments & distributed rate limiters', completed: false },
          { id: 'st-39', title: 'Cache invalidation pitfalls', completed: false }
        ]
      }
    ]
  },
  {
    id: 'ms-system-design',
    title: 'SYSTEM DESIGN & SCALE',
    description: 'High-availability architectures, horizontal scaling, and asynchronous messaging',
    nodes: [
      {
        id: 'sys-design-basics',
        title: 'System Design Fundamentals',
        category: 'system_design',
        categoryLabel: 'System Design',
        status: 'locked',
        difficulty: 'Advanced',
        estMinutes: 80,
        masteryPercent: 0,
        prerequisites: ['Redis Caching & Invalidation', 'Authentication, JWT & Security'],
        whyItMatters: 'Senior engineers architect for failure, horizontal scaling, zero-downtime deployments, and bounded latency.',
        description: 'CAP theorem, load balancers, database sharding, microservices vs monolith, and message brokers.',
        subtopics: [
          { id: 'st-40', title: 'Load balancing algorithms (Round Robin, Least Conn)', completed: false },
          { id: 'st-41', title: 'Database read replicas vs sharding', completed: false },
          { id: 'st-42', title: 'Message queues (Kafka / RabbitMQ) for async decoupling', completed: false }
        ]
      }
    ]
  }
];

export const mockWeakConcepts: WeakConcept[] = [
  {
    id: 'weak-async',
    name: 'Async JavaScript & Event Loop',
    category: 'Foundations',
    masteryPercent: 58,
    reason: 'You frequently solve synchronous execution problems correctly but struggle with microtask vs macrotask ordering and Promise error propagation.',
    recommendedAction: 'Review microtask queue priorities and run targeted async execution quizzes.',
    topicId: 'async-event-loop'
  },
  {
    id: 'weak-space-complexity',
    name: 'Space Complexity & In-Place Mutation',
    category: 'DSA',
    masteryPercent: 61,
    reason: 'In algorithms requiring O(1) auxiliary space, your solutions default to allocating secondary hash maps or cloned arrays.',
    recommendedAction: 'Practice two-pointer array partitions without creating new memory allocations.',
    topicId: 'js-fundamentals'
  },
  {
    id: 'weak-promises',
    name: 'Promise Chaining & Unhandled Rejections',
    category: 'Foundations',
    masteryPercent: 63,
    reason: 'When handling nested async operations, your catch blocks fail to catch errors in chained then() callbacks.',
    recommendedAction: 'Complete 3 debugging questions focused on error bubbling in Promise chains.',
    topicId: 'async-event-loop'
  }
];

export const mockAIRecommendations: AIRecommendation[] = [
  {
    id: 'rec-sys-design',
    title: 'Learn: System Design Fundamentals',
    category: 'System Design',
    whyRecommendation: 'Your backend foundations (Node.js 80%, REST APIs 85%, PostgreSQL 82%) have surpassed the mastery threshold required to begin high-level system architecture.',
    expectedImpact: 'Critical',
    estHours: 4,
    addedToRoadmap: false,
    actionTopicId: 'sys-design-basics',
    prerequisites: [
      { name: 'Node.js Internals', satisfied: true },
      { name: 'REST API Design', satisfied: true },
      { name: 'PostgreSQL Schema', satisfied: true },
      { name: 'Redis In-Memory Caching', satisfied: false }
    ]
  },
  {
    id: 'rec-event-loop',
    title: 'Reinforce: Event Loop & Microtask Priority',
    category: 'Targeted Remediation',
    whyRecommendation: 'Recent practice evaluation showed a 58% success rate on Promise vs setTimeout order execution. Strengthening this now will accelerate your Next.js and Node.js performance tuning.',
    expectedImpact: 'High',
    estHours: 1.5,
    addedToRoadmap: true,
    actionTopicId: 'async-event-loop',
    prerequisites: [
      { name: 'Functions & Scope', satisfied: true },
      { name: 'Closures', satisfied: true }
    ]
  },
  {
    id: 'rec-redis',
    title: 'Next Topic: Redis Caching & Stampede Prevention',
    category: 'Databases',
    whyRecommendation: 'Complement your MongoDB and PostgreSQL knowledge with low-latency memory caching to prepare for scalable full-stack applications.',
    expectedImpact: 'Medium',
    estHours: 2,
    addedToRoadmap: false,
    actionTopicId: 'redis-caching',
    prerequisites: [
      { name: 'MongoDB Modeling', satisfied: true },
      { name: 'REST API Design', satisfied: true }
    ]
  }
];

export const mockSkillsCatalog: SkillItem[] = [
  {
    id: 'js',
    name: 'JavaScript',
    category: 'Programming',
    difficulty: 'Beginner',
    prerequisites: [],
    relatedSkills: ['TypeScript', 'React', 'Node.js'],
    estHours: 40,
    careerRelevance: 'Essential for all Web and Full Stack engineers across the industry.',
    trending: true,
    description: 'The foundational language of the web: closures, prototypes, event loops, and ESNext modern syntax.'
  },
  {
    id: 'ts',
    name: 'TypeScript',
    category: 'Programming',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript'],
    relatedSkills: ['React', 'Next.js', 'Node.js'],
    estHours: 30,
    careerRelevance: 'Standard requirement in 85%+ of modern enterprise engineering teams.',
    trending: true,
    description: 'Static type checking, generics, utility types, union types, and interface contracts.'
  },
  {
    id: 'react',
    name: 'React',
    category: 'Frontend',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript', 'HTML', 'CSS'],
    relatedSkills: ['Next.js', 'TypeScript', 'State Management'],
    estHours: 35,
    careerRelevance: 'The dominant UI library powering millions of modern web applications.',
    trending: true,
    description: 'Declarative component trees, virtual DOM reconciliation, hooks, context, and modern patterns.'
  },
  {
    id: 'nextjs',
    name: 'Next.js',
    category: 'Frontend',
    difficulty: 'Advanced',
    prerequisites: ['React', 'TypeScript'],
    relatedSkills: ['Node.js', 'Tailwind CSS', 'Vercel'],
    estHours: 25,
    careerRelevance: 'The premier production framework for high-performance full stack React apps.',
    trending: true,
    description: 'App router, React Server Components (RSC), static generation, and edge functions.'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'Backend',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript'],
    relatedSkills: ['Express', 'REST APIs', 'PostgreSQL'],
    estHours: 30,
    careerRelevance: 'Powers fast I/O servers, microservices, and modern serverless runtimes.',
    trending: false,
    description: 'Non-blocking I/O event loops, streams, native modules, and REST server design.'
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'Databases',
    difficulty: 'Beginner',
    prerequisites: ['JavaScript', 'REST APIs'],
    relatedSkills: ['Node.js', 'Redis', 'Mongoose'],
    estHours: 20,
    careerRelevance: 'Most popular document database for agile product development.',
    trending: false,
    description: 'Flexible JSON documents, indexing strategies, aggregation pipelines, and replication.'
  },
  {
    id: 'sql',
    name: 'SQL & PostgreSQL',
    category: 'Databases',
    difficulty: 'Intermediate',
    prerequisites: [],
    relatedSkills: ['Node.js', 'System Design'],
    estHours: 30,
    careerRelevance: 'Indispensable industry standard for transactional data integrity.',
    trending: true,
    description: 'Relational data modeling, ACID transactions, complex joins, and query plan optimization.'
  },
  {
    id: 'dsa',
    name: 'Data Structures & Algorithms',
    category: 'Engineering',
    difficulty: 'Intermediate',
    prerequisites: ['JavaScript'],
    relatedSkills: ['System Design', 'Optimization'],
    estHours: 50,
    careerRelevance: 'The core benchmark evaluated in technical FAANG and top-tier software interviews.',
    trending: true,
    description: 'Arrays, hash maps, linked lists, trees, graphs, dynamic programming, and Big-O efficiency.'
  },
  {
    id: 'system-design',
    name: 'System Design',
    category: 'Engineering',
    difficulty: 'Advanced',
    prerequisites: ['Node.js', 'SQL & PostgreSQL', 'Redis'],
    relatedSkills: ['Docker', 'Distributed Systems'],
    estHours: 40,
    careerRelevance: 'Crucial for senior engineering levels, staff roles, and architect positions.',
    trending: true,
    description: 'Scalability, microservices, load balancing, caching tiers, data sharding, and resilience.'
  },
  {
    id: 'ai-agents',
    name: 'AI Agents & LLM Integration',
    category: 'AI',
    difficulty: 'Advanced',
    prerequisites: ['Python', 'TypeScript', 'REST APIs'],
    relatedSkills: ['RAG', 'Vector Databases'],
    estHours: 35,
    careerRelevance: 'Highest growing demand in modern engineering teams deploying intelligent workflows.',
    trending: true,
    description: 'Function calling, multi-step tool execution, RAG embeddings, and Gemini/OpenAI SDK pipelines.'
  }
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'practice',
    title: "Today's 5 Practice Questions Ready",
    message: 'Focus: Closures & Async Patterns. Estimated time: ~20 mins.',
    timestamp: '15 mins ago',
    read: false,
    actionView: 'practice'
  },
  {
    id: 'notif-2',
    type: 'weakness',
    title: 'Adaptive Learning Path Updated',
    message: 'We added 2 reinforcement questions on Async JavaScript based on yesterday’s test output.',
    timestamp: '2 hours ago',
    read: false,
    actionView: 'roadmap'
  },
  {
    id: 'notif-3',
    type: 'streak',
    title: '18-Day Streak Milestone!',
    message: 'You have practiced consistently for 18 days straight. +50 XP bonus earned.',
    timestamp: '1 day ago',
    read: true,
    actionView: 'progress'
  },
  {
    id: 'notif-4',
    type: 'recommendation',
    title: 'New AI Recommendation: System Design',
    message: 'Backend mastery reached 82%. You are now ready to begin high-level system architecture.',
    timestamp: '2 days ago',
    read: true,
    actionView: 'recommendations'
  }
];
