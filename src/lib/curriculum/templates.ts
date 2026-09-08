export interface CurriculumTemplateNode {
  id: string;
  milestoneId: string;
  title: string;
  category: string;
  categoryLabel: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estMinutes: number;
  prerequisites: string[];
  whyItMatters: string;
  description: string;
  sequenceOrder: number;
  unlockDay: number;
  subtopics: Array<{
    id: string;
    title: string;
    sequenceOrder: number;
    completed?: boolean;
  }>;
}

export interface CurriculumTemplateMilestone {
  id: string;
  title: string;
  description: string;
  sequenceOrder: number;
  nodeIds: string[];
}

export interface CurriculumTemplate {
  id: string;
  goalName: string;
  description: string;
  milestones: CurriculumTemplateMilestone[];
  nodes: CurriculumTemplateNode[];
}

export const CURRICULUM_TEMPLATES: Record<string, CurriculumTemplate> = {
  'Full Stack Architect': {
    id: 'fullstack-architect',
    goalName: 'Full Stack Architect',
    description: 'Master full-stack system architecture, microservices, asynchronous execution, and modern distributed Web applications.',
    milestones: [
      {
        id: 'ms-fs-1',
        title: 'Core Language Mechanics & Async Foundations',
        description: 'Understand the JS event loop, microtask queues, closure memory allocation, and execution contexts.',
        sequenceOrder: 1,
        nodeIds: ['js-event-loop', 'js-closures-memory', 'async-promises'],
      },
      {
        id: 'ms-fs-2',
        title: 'System Performance & State Management',
        description: 'Build performant UI systems, memoization patterns, and scalable React state architectures.',
        sequenceOrder: 2,
        nodeIds: ['react-reconciliation', 'state-management-patterns', 'browser-rendering-pipeline'],
      },
      {
        id: 'ms-fs-3',
        title: 'Backend Systems & API Architecture',
        description: 'Design distributed backend APIs, database indexing, caching strategies, and authentication.',
        sequenceOrder: 3,
        nodeIds: ['node-event-emitter', 'db-indexing-optimization', 'redis-caching-locks'],
      },
    ],
    nodes: [
      {
        id: 'js-event-loop',
        milestoneId: 'ms-fs-1',
        title: 'JavaScript Event Loop & Task Queues',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 30,
        prerequisites: [],
        whyItMatters: 'Critical for predicting non-blocking asynchronous execution order and preventing thread starvation.',
        description: 'Master call stack mechanics, microtasks (Promises, queueMicrotask), and macrotasks (setTimeout, setImmediate).',
        sequenceOrder: 1,
        unlockDay: 0,
        subtopics: [
          { id: 'sub-1-1', title: 'Call Stack & Execution Contexts', sequenceOrder: 1 },
          { id: 'sub-1-2', title: 'Task Queue vs Microtask Queue', sequenceOrder: 2 },
          { id: 'sub-1-3', title: 'Event Loop Tick Sequencing', sequenceOrder: 3 },
        ],
      },
      {
        id: 'js-closures-memory',
        milestoneId: 'ms-fs-1',
        title: 'Lexical Closures & Heap Memory Management',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 35,
        prerequisites: ['js-event-loop'],
        whyItMatters: 'Prevents memory leaks in long-lived production applications and enables clean state encapsulation.',
        description: 'Deep dive into lexical scopes, environment records, closure variable retention, and garbage collection reachability.',
        sequenceOrder: 2,
        unlockDay: 1,
        subtopics: [
          { id: 'sub-2-1', title: 'Lexical Environment Records', sequenceOrder: 1 },
          { id: 'sub-2-2', title: 'Closure Scope Chain Resolution', sequenceOrder: 2 },
          { id: 'sub-2-3', title: 'Garbage Collection & Detached References', sequenceOrder: 3 },
        ],
      },
      {
        id: 'async-promises',
        milestoneId: 'ms-fs-1',
        title: 'Asynchronous Control Flow & Promise Internals',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 40,
        prerequisites: ['js-event-loop'],
        whyItMatters: 'Essential for writing resilient async code with deterministic error propagation.',
        description: 'Understand Promise states, chain resolution procedures, Promise.allSettled concurrency patterns, and async/await unwrapping.',
        sequenceOrder: 3,
        unlockDay: 2,
        subtopics: [
          { id: 'sub-3-1', title: 'Promise States & Transition Handlers', sequenceOrder: 1 },
          { id: 'sub-3-2', title: 'Concurrent Promise Combinators', sequenceOrder: 2 },
          { id: 'sub-3-3', title: 'Async Stack Traces & Error Handling', sequenceOrder: 3 },
        ],
      },
      {
        id: 'react-reconciliation',
        milestoneId: 'ms-fs-2',
        title: 'React Fiber & Reconciliation Engine',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['js-closures-memory'],
        whyItMatters: 'Enables high-performance UI components by optimizing render passes and commit phase side effects.',
        description: 'Explore the Fiber tree architecture, work loop interruptibility, diffing heuristics, and key prop stability.',
        sequenceOrder: 4,
        unlockDay: 3,
        subtopics: [
          { id: 'sub-4-1', title: 'Virtual DOM Diffing Heuristics', sequenceOrder: 1 },
          { id: 'sub-4-2', title: 'Fiber Nodes & Render Phase Work Loop', sequenceOrder: 2 },
          { id: 'sub-4-3', title: 'Passive Effects vs Layout Effects', sequenceOrder: 3 },
        ],
      },
      {
        id: 'state-management-patterns',
        milestoneId: 'ms-fs-2',
        title: 'Scalable State Management & Immutability',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Intermediate',
        estMinutes: 40,
        prerequisites: ['react-reconciliation'],
        whyItMatters: 'Ensures predictable client state transitions, state normalization, and efficient render subscriptions.',
        description: 'Compare atomic state, selector-based subscriptions, immutable update trees, and server cache synchronization.',
        sequenceOrder: 5,
        unlockDay: 4,
        subtopics: [
          { id: 'sub-5-1', title: 'Normalized State Stores', sequenceOrder: 1 },
          { id: 'sub-5-2', title: 'Selector Memoization Patterns', sequenceOrder: 2 },
          { id: 'sub-5-3', title: 'Server State vs Client UI State', sequenceOrder: 3 },
        ],
      },
      {
        id: 'browser-rendering-pipeline',
        milestoneId: 'ms-fs-2',
        title: 'Browser Rendering Engine & Performance',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['react-reconciliation'],
        whyItMatters: 'Prevents main thread layout thrashing, frame drops, and poor Core Web Vitals.',
        description: 'Parse HTML/CSS tree construction, composite layers, layout invalidate triggers, and 60fps animation budgets.',
        sequenceOrder: 6,
        unlockDay: 5,
        subtopics: [
          { id: 'sub-6-1', title: 'DOM Tree & Style Computation', sequenceOrder: 1 },
          { id: 'sub-6-2', title: 'Layout, Paint, and Composite Layers', sequenceOrder: 2 },
          { id: 'sub-6-3', title: 'Layout Thrashing &requestAnimationFrame', sequenceOrder: 3 },
        ],
      },
      {
        id: 'node-event-emitter',
        milestoneId: 'ms-fs-3',
        title: 'Node.js Event-Driven I/O & Streams',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Intermediate',
        estMinutes: 45,
        prerequisites: ['async-promises'],
        whyItMatters: 'Foundation for building high-throughput non-blocking network servers and data pipelines.',
        description: 'Master libuv thread pool allocation, streams backpressure handling, and EventEmitter memory leak prevention.',
        sequenceOrder: 7,
        unlockDay: 6,
        subtopics: [
          { id: 'sub-7-1', title: 'libuv Event Loop & Thread Pool', sequenceOrder: 1 },
          { id: 'sub-7-2', title: 'Readable/Writable Stream Backpressure', sequenceOrder: 2 },
          { id: 'sub-7-3', title: 'EventEmitter Lifecycle Management', sequenceOrder: 3 },
        ],
      },
      {
        id: 'db-indexing-optimization',
        milestoneId: 'ms-fs-3',
        title: 'Database Indexing & Query Execution Plans',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Advanced',
        estMinutes: 50,
        prerequisites: ['node-event-emitter'],
        whyItMatters: 'Guarantees sub-10ms query execution times as database volume grows to millions of records.',
        description: 'Understand B-Tree indexes, compound index prefix matching, explain plans, and index scan strategies.',
        sequenceOrder: 8,
        unlockDay: 7,
        subtopics: [
          { id: 'sub-8-1', title: 'B-Tree & Hash Index Structure', sequenceOrder: 1 },
          { id: 'sub-8-2', title: 'Compound Index Leftmost Prefix Rule', sequenceOrder: 2 },
          { id: 'sub-8-3', title: 'Query Execution Plan Analysis', sequenceOrder: 3 },
        ],
      },
      {
        id: 'redis-caching-locks',
        milestoneId: 'ms-fs-3',
        title: 'Distributed Caching & Concurrency Locks',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['db-indexing-optimization'],
        whyItMatters: 'Prevents cache stampedes, thundering herds, and race conditions across distributed microservices.',
        description: 'Implement key eviction policies, cache-aside strategies, TTL expiration, and Redlock mutual exclusion.',
        sequenceOrder: 9,
        unlockDay: 8,
        subtopics: [
          { id: 'sub-9-1', title: 'Cache Strategies: Cache-Aside vs Write-Through', sequenceOrder: 1 },
          { id: 'sub-9-2', title: 'TTL Expiration & Eviction Policies', sequenceOrder: 2 },
          { id: 'sub-9-3', title: 'Distributed Locks & Rate Limiting', sequenceOrder: 3 },
        ],
      },
    ],
  },
  'Frontend Specialist': {
    id: 'frontend-specialist',
    goalName: 'Frontend Specialist',
    description: 'Specialized track in modern UI architecture, Web Vitals, reactive state, and browser internals.',
    milestones: [
      {
        id: 'ms-fe-1',
        title: 'Modern JS Foundations',
        description: 'Master core JavaScript mechanics, event queue, and closures.',
        sequenceOrder: 1,
        nodeIds: ['js-event-loop', 'js-closures-memory'],
      },
      {
        id: 'ms-fe-2',
        title: 'Advanced React Architecture',
        description: 'Fiber reconciliation, state normalization, and rendering optimization.',
        sequenceOrder: 2,
        nodeIds: ['react-reconciliation', 'state-management-patterns', 'browser-rendering-pipeline'],
      },
    ],
    nodes: [
      {
        id: 'js-event-loop',
        milestoneId: 'ms-fe-1',
        title: 'JavaScript Event Loop & Task Queues',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 30,
        prerequisites: [],
        whyItMatters: 'Critical for predicting non-blocking asynchronous execution order.',
        description: 'Master call stack mechanics, microtasks, and macrotasks.',
        sequenceOrder: 1,
        unlockDay: 0,
        subtopics: [
          { id: 'sub-1-1', title: 'Call Stack & Execution Contexts', sequenceOrder: 1 },
          { id: 'sub-1-2', title: 'Task Queue vs Microtask Queue', sequenceOrder: 2 },
        ],
      },
      {
        id: 'js-closures-memory',
        milestoneId: 'ms-fe-1',
        title: 'Lexical Closures & Heap Memory Management',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 35,
        prerequisites: ['js-event-loop'],
        whyItMatters: 'Prevents memory leaks in client applications.',
        description: 'Deep dive into lexical scopes and memory reachability.',
        sequenceOrder: 2,
        unlockDay: 1,
        subtopics: [
          { id: 'sub-2-1', title: 'Lexical Environment Records', sequenceOrder: 1 },
          { id: 'sub-2-2', title: 'Closure Scope Chain Resolution', sequenceOrder: 2 },
        ],
      },
      {
        id: 'react-reconciliation',
        milestoneId: 'ms-fe-2',
        title: 'React Fiber & Reconciliation Engine',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['js-closures-memory'],
        whyItMatters: 'Enables high-performance UI components.',
        description: 'Explore the Fiber tree architecture and work loop interruptibility.',
        sequenceOrder: 3,
        unlockDay: 2,
        subtopics: [
          { id: 'sub-4-1', title: 'Virtual DOM Diffing Heuristics', sequenceOrder: 1 },
          { id: 'sub-4-2', title: 'Fiber Nodes & Work Loop', sequenceOrder: 2 },
        ],
      },
      {
        id: 'state-management-patterns',
        milestoneId: 'ms-fe-2',
        title: 'Scalable State Management & Immutability',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Intermediate',
        estMinutes: 40,
        prerequisites: ['react-reconciliation'],
        whyItMatters: 'Ensures predictable client state transitions.',
        description: 'Compare atomic state and selector-based subscriptions.',
        sequenceOrder: 4,
        unlockDay: 3,
        subtopics: [
          { id: 'sub-5-1', title: 'Normalized State Stores', sequenceOrder: 1 },
          { id: 'sub-5-2', title: 'Selector Memoization Patterns', sequenceOrder: 2 },
        ],
      },
      {
        id: 'browser-rendering-pipeline',
        milestoneId: 'ms-fe-2',
        title: 'Browser Rendering Engine & Performance',
        category: 'frontend-architecture',
        categoryLabel: 'Frontend Architecture',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['react-reconciliation'],
        whyItMatters: 'Prevents main thread layout thrashing.',
        description: 'Parse HTML/CSS tree construction and composite layers.',
        sequenceOrder: 5,
        unlockDay: 4,
        subtopics: [
          { id: 'sub-6-1', title: 'DOM Tree & Style Computation', sequenceOrder: 1 },
          { id: 'sub-6-2', title: 'Layout, Paint, and Composite Layers', sequenceOrder: 2 },
        ],
      },
    ],
  },
  'Backend Systems Engineer': {
    id: 'backend-systems',
    goalName: 'Backend Systems Engineer',
    description: 'Specialized track in event-driven server runtimes, database indexing, caching strategies, and distributed locking.',
    milestones: [
      {
        id: 'ms-be-1',
        title: 'Runtime & Asynchronous I/O',
        description: 'Master Event Loop, Async Promises, and Node Event Emitter.',
        sequenceOrder: 1,
        nodeIds: ['js-event-loop', 'async-promises', 'node-event-emitter'],
      },
      {
        id: 'ms-be-2',
        title: 'Data Infrastructure & Caching',
        description: 'Database indexing strategies and distributed Redis caching.',
        sequenceOrder: 2,
        nodeIds: ['db-indexing-optimization', 'redis-caching-locks'],
      },
    ],
    nodes: [
      {
        id: 'js-event-loop',
        milestoneId: 'ms-be-1',
        title: 'JavaScript Event Loop & Task Queues',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 30,
        prerequisites: [],
        whyItMatters: 'Essential for asynchronous server execution.',
        description: 'Master call stack mechanics and microtask queues.',
        sequenceOrder: 1,
        unlockDay: 0,
        subtopics: [
          { id: 'sub-1-1', title: 'Call Stack & Execution Contexts', sequenceOrder: 1 },
          { id: 'sub-1-2', title: 'Task Queue vs Microtask Queue', sequenceOrder: 2 },
        ],
      },
      {
        id: 'async-promises',
        milestoneId: 'ms-be-1',
        title: 'Asynchronous Control Flow & Promise Internals',
        category: 'core-language',
        categoryLabel: 'Core Language Mechanics',
        difficulty: 'Intermediate',
        estMinutes: 40,
        prerequisites: ['js-event-loop'],
        whyItMatters: 'Essential for error propagation in backend services.',
        description: 'Understand Promise states and concurrency combinators.',
        sequenceOrder: 2,
        unlockDay: 1,
        subtopics: [
          { id: 'sub-3-1', title: 'Promise States & Handlers', sequenceOrder: 1 },
          { id: 'sub-3-2', title: 'Concurrent Promise Combinators', sequenceOrder: 2 },
        ],
      },
      {
        id: 'node-event-emitter',
        milestoneId: 'ms-be-1',
        title: 'Node.js Event-Driven I/O & Streams',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Intermediate',
        estMinutes: 45,
        prerequisites: ['async-promises'],
        whyItMatters: 'Foundation for building high-throughput network servers.',
        description: 'Master libuv thread pool allocation and streams backpressure.',
        sequenceOrder: 3,
        unlockDay: 2,
        subtopics: [
          { id: 'sub-7-1', title: 'libuv Event Loop & Thread Pool', sequenceOrder: 1 },
          { id: 'sub-7-2', title: 'Readable/Writable Stream Backpressure', sequenceOrder: 2 },
        ],
      },
      {
        id: 'db-indexing-optimization',
        milestoneId: 'ms-be-2',
        title: 'Database Indexing & Query Execution Plans',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Advanced',
        estMinutes: 50,
        prerequisites: ['node-event-emitter'],
        whyItMatters: 'Guarantees sub-10ms query execution times.',
        description: 'Understand B-Tree indexes and execution plan analysis.',
        sequenceOrder: 4,
        unlockDay: 3,
        subtopics: [
          { id: 'sub-8-1', title: 'B-Tree Index Structure', sequenceOrder: 1 },
          { id: 'sub-8-2', title: 'Compound Index Leftmost Prefix Rule', sequenceOrder: 2 },
        ],
      },
      {
        id: 'redis-caching-locks',
        milestoneId: 'ms-be-2',
        title: 'Distributed Caching & Concurrency Locks',
        category: 'backend-systems',
        categoryLabel: 'Backend Systems',
        difficulty: 'Advanced',
        estMinutes: 45,
        prerequisites: ['db-indexing-optimization'],
        whyItMatters: 'Prevents cache stampedes and race conditions.',
        description: 'Implement cache-aside strategies, TTL expiration, and locks.',
        sequenceOrder: 5,
        unlockDay: 4,
        subtopics: [
          { id: 'sub-9-1', title: 'Cache-Aside Strategies', sequenceOrder: 1 },
          { id: 'sub-9-2', title: 'Distributed Locks & Rate Limiting', sequenceOrder: 2 },
        ],
      },
    ],
  },
};

export function getCurriculumTemplate(goal: string): CurriculumTemplate {
  if (CURRICULUM_TEMPLATES[goal]) {
    return CURRICULUM_TEMPLATES[goal];
  }
  const lowerGoal = goal.toLowerCase();
  if (lowerGoal.includes('frontend') || lowerGoal.includes('react') || lowerGoal.includes('ui')) {
    return CURRICULUM_TEMPLATES['Frontend Specialist'];
  }
  if (lowerGoal.includes('backend') || lowerGoal.includes('node') || lowerGoal.includes('server') || lowerGoal.includes('data')) {
    return CURRICULUM_TEMPLATES['Backend Systems Engineer'];
  }
  return CURRICULUM_TEMPLATES['Full Stack Architect'];
}
