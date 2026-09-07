# CogniPath AI — RESTful & AI Diagnostics API Specification

> **Target Audience**: AI Agents, Backend Engineers, Full-Stack Architects, and QA Engineers.  
> **API Version**: `v1` (`/api/v1`)  
> **Protocol**: HTTPS / RESTful JSON  
> **Document Purpose**: Exhaustive API contract definition covering request/response schemas, validation constraints, edge cases, sandboxed execution rules, error taxonomy, and integration test cases.

---

## 1. Architectural Standards & Conventions

### 1.1 Base URL & Content Negotiation
- **Base URL**: `https://api.cognipath.ai/api/v1` (Production) | `http://localhost:3000/api/v1` (Development)
- **Headers**:
  - `Content-Type: application/json; charset=utf-8`
  - `Accept: application/json`
  - `Authorization: Bearer <jwt_access_token>` (for protected endpoints)
  - `X-Client-Version: 1.0.0`
  - `X-Request-Id: <uuid_v4>` (for distributed telemetry tracing)

### 1.2 Standard HTTP Status Codes
| Code | Constant | Meaning in CogniPath AI |
|------|----------|-------------------------|
| `200` | `OK` | Standard successful retrieval or execution. |
| `201` | `Created` | Resource created (e.g. user registered, submission recorded). |
| `204` | `No Content` | Action succeeded with no returned body (e.g. notification dismissed). |
| `400` | `Bad Request` | Malformed JSON syntax or schema failure. |
| `401` | `Unauthorized` | Missing, expired, or invalid JWT token. |
| `403` | `Forbidden` | Insufficient permissions for requested resource. |
| `404` | `Not Found` | Resource ID does not exist in the database. |
| `422` | `Unprocessable Entity` | Semantic validation error (e.g. invalid code syntax, cyclic prerequisites). |
| `429` | `Too Many Requests` | Rate limit exceeded (e.g. AI diagnostic generation limit). |
| `500` | `Internal Server Error`| Unhandled server exception. |
| `504` | `Gateway Timeout` | Sandboxed code execution exceeded CPU/wall-clock limit (>3000ms). |

### 1.3 Universal Error Response Schema (RFC 7807 Compliant)
All error responses adhere strictly to this schema:
```json
{
  "type": "https://api.cognipath.ai/errors/VALIDATION_ERROR",
  "title": "Invalid Request Parameters",
  "status": 422,
  "detail": "One or more fields failed validation checks.",
  "instance": "/api/v1/practice/submit",
  "timestamp": "2026-09-03T23:15:00Z",
  "errors": [
    {
      "field": "code",
      "message": "Submission code cannot be empty or exceed 64KB.",
      "code": "CODE_EMPTY_OR_OVERSIZED"
    }
  ]
}
```

---

## 2. Authentication & Session Endpoints

### 2.1 Register User (`POST /api/v1/auth/register`)
- **Description**: Creates a new user account and provisions default profile state.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "sarah.dev@example.com",
    "password": "SecurePassword123!",
    "name": "Sarah Chen"
  }
  ```
- **Validation Rules**:
  - `email`: Required, valid RFC 5322 format, lowercase, unique, max 255 chars.
  - `password`: Required, 8-128 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 symbol.
  - `name`: Required, 2-100 chars, stripped of control characters.
- **Success Response (`201 Created`)**:
  ```json
  {
    "user": {
      "id": "usr_94b1ef40",
      "name": "Sarah Chen",
      "email": "sarah.dev@example.com",
      "targetGoal": "Senior Frontend Engineer",
      "experienceLevel": "Intermediate",
      "streakDays": 1,
      "xp": 50,
      "overallMastery": 0,
      "theme": "light"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 3600
    }
  }
  ```
- **Edge Cases & Error Handling**:
  - Duplicate email: Returns `409 Conflict` (`EMAIL_ALREADY_REGISTERED`).
  - Disposable email domains: Returns `422 Unprocessable Entity` (`DISPOSABLE_EMAIL_REJECTED`).

---

### 2.2 Login User (`POST /api/v1/auth/login`)
- **Description**: Authenticates user credentials and issues token pair.
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "sarah.dev@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "user": {
      "id": "usr_94b1ef40",
      "name": "Sarah Chen",
      "email": "sarah.dev@example.com",
      "targetGoal": "Senior Frontend Engineer",
      "experienceLevel": "Intermediate",
      "streakDays": 5,
      "xp": 820,
      "overallMastery": 42,
      "completedQuestionsToday": 2,
      "totalQuestionsTargetToday": 5,
      "theme": "light"
    },
    "tokens": {
      "accessToken": "eyJhbGciOi...",
      "refreshToken": "eyJhbGciOi...",
      "expiresIn": 3600
    }
  }
  ```
- **Edge Cases & Error Handling**:
  - Invalid credentials: Returns `401 Unauthorized` with generic message (`INVALID_CREDENTIALS`).
  - Brute force protection: 5 failed attempts in 10 minutes returns `429 Too Many Requests` (`ACCOUNT_RATE_LIMITED`).

---

### 2.3 Get Current User Profile (`GET /api/v1/users/me`)
- **Description**: Retrieves authenticated user state, telemetry counters, and active goal.
- **Access**: Protected (`Bearer <token>`)
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": "usr_94b1ef40",
    "name": "Sarah Chen",
    "email": "sarah.dev@example.com",
    "avatarUrl": "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    "targetGoal": "Senior Frontend Engineer",
    "experienceLevel": "Intermediate",
    "selectedSkills": [
      { "skillId": "js_core", "name": "JavaScript", "level": "Advanced" },
      { "skillId": "react_core", "name": "React Architecture", "level": "Intermediate" }
    ],
    "dailyCommitmentMinutes": 30,
    "streakDays": 5,
    "xp": 820,
    "overallMastery": 42,
    "completedQuestionsToday": 2,
    "totalQuestionsTargetToday": 5,
    "currentTopicId": "js-event-loop",
    "theme": "light"
  }
  ```

---

## 3. Curriculum & Roadmap Endpoints

### 3.1 Get Topological Roadmap (`GET /api/v1/roadmap`)
- **Description**: Returns all milestones and topic nodes with current completion and lock statuses computed against user prerequisites.
- **Access**: Protected
- **Query Parameters**:
  - `category` (optional): Filter by category (`foundations`, `frontend`, `backend`, `databases`, `system_design`, `ai`).
  - `status` (optional): Filter by node status (`completed`, `in_progress`, `available`, `locked`, `review_needed`).
- **Success Response (`200 OK`)**:
  ```json
  {
    "overallMastery": 42,
    "completedNodes": 6,
    "totalNodes": 28,
    "milestones": [
      {
        "id": "m1-foundations",
        "title": "Milestone 1: Architectural Foundations & Concurrency",
        "description": "Master asynchronous primitives, event dispatchers, and memory layout.",
        "nodes": [
          {
            "id": "js-event-loop",
            "title": "Event Loop & Concurrency Mechanics",
            "category": "frontend",
            "categoryLabel": "Runtime Foundations",
            "status": "in_progress",
            "difficulty": "Intermediate",
            "estMinutes": 45,
            "masteryPercent": 75,
            "prerequisites": ["js-closures"],
            "whyItMatters": "Prevents catastrophic UI freeze and unhandled promise microtask starvation in production applications.",
            "description": "Deep study of task queues, microtasks, timers, and browser render phases.",
            "subtopics": [
              { "id": "st-1", "title": "Call Stack & Web APIs", "completed": true },
              { "id": "st-2", "title": "Microtask Queue Precedence", "completed": true },
              { "id": "st-3", "title": "RequestAnimationFrame Ordering", "completed": false }
            ]
          }
        ]
      }
    ]
  }
  ```

---

### 3.2 Update Node Status / Subtopic (`PATCH /api/v1/roadmap/nodes/:id/progress`)
- **Description**: Updates progress on a specific topic node or subtopic checklist.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "subtopicId": "st-3",
    "completed": true
  }
  ```
- **Validation**:
  - Node must exist.
  - User cannot mark a locked node as complete (`403 Forbidden: PREREQUISITES_NOT_MET`).
- **Success Response (`200 OK`)**: Returns updated node with newly unlocked downstream dependencies.

---

## 4. Deep Pedagogical Lessons Endpoints

### 4.1 Get Lesson Monograph (`GET /api/v1/lessons/:topicId`)
- **Description**: Retrieves full academic lesson content, interactive code snippets, anti-patterns, and knowledge check questions for a given topic ID.
- **Access**: Protected
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": "lesson-js-event-loop",
    "topicId": "js-event-loop",
    "title": "The JavaScript Runtime: Event Loop, Microtasks, and Concurrency Mechanics",
    "subtitle": "A rigorous analysis of the Macrotask Queue, Microtask Queue, and V8 Host Callbacks.",
    "estimatedMinutes": 35,
    "difficulty": "Intermediate",
    "masteryLevel": 75,
    "prerequisites": ["Lexical Scope & Execution Contexts", "Promise Specifications"],
    "whyYouAreLearningThis": "High-throughput web applications rely on non-blocking I/O. Without mastering microtask precedence, production apps encounter starvation deadlocks.",
    "sections": [
      {
        "id": "sec-runtime-architecture",
        "title": "1. Single-Threaded Illusion & The V8 Host Environment",
        "content": "JavaScript operates in a single thread of execution governed by a Call Stack, a Heap, and an Event Loop...",
        "codeSnippet": {
          "language": "javascript",
          "code": "console.log('Sync 1');\nsetTimeout(() => console.log('Timeout'), 0);\nPromise.resolve().then(() => console.log('Promise'));\nconsole.log('Sync 2');",
          "caption": "Classic microtask interleaving demonstration"
        },
        "highlightNote": "Microtask queues are fully drained prior to yielding to the next macrotask or layout phase.",
        "calloutType": "warning"
      }
    ],
    "commonMistakes": [
      {
        "title": "Unbounded Microtask Starvation",
        "mistakeCode": "function starve() {\n  Promise.resolve().then(starve);\n}",
        "correctionCode": "function nonStarving() {\n  setTimeout(nonStarving, 0);\n}",
        "explanation": "Recursive microtask scheduling prevents the event loop from ever reaching render stages, completely freezing the browser tab."
      }
    ],
    "keyTakeaways": [
      "Microtasks execute immediately after the current synchronous script finishes, before timers.",
      "requestAnimationFrame callbacks trigger immediately before browser rendering and style recalculation."
    ],
    "knowledgeCheck": [
      {
        "id": "kc-1",
        "question": "What is the guaranteed output order of the interleaving snippet?",
        "options": [
          "Sync 1, Sync 2, Timeout, Promise",
          "Sync 1, Sync 2, Promise, Timeout",
          "Promise, Sync 1, Sync 2, Timeout",
          "Sync 1, Timeout, Promise, Sync 2"
        ],
        "correctIndex": 1,
        "explanation": "Synchronous statements run first ('Sync 1', 'Sync 2'). The microtask queue executes prior to macrotasks, outputting 'Promise' before 'Timeout'."
      }
    ]
  }
  ```

---

## 5. Daily Practice & Sandboxed Test Execution Endpoints

### 5.1 Get Daily Practice Set (`GET /api/v1/practice/daily`)
- **Description**: Returns the curated set of daily exercises calibrated to the user's weak points and current curriculum node.
- **Access**: Protected
- **Query Parameters**:
  - `topicId` (optional): Filter questions for a specific topic (e.g. `js-event-loop`).
- **Success Response (`200 OK`)**:
  ```json
  {
    "date": "2026-09-03",
    "targetCount": 5,
    "completedCount": 2,
    "questions": [
      {
        "id": "q-event-loop-microtasks",
        "index": 1,
        "type": "coding",
        "typeLabel": "Algorithmic Implementation",
        "topicTitle": "JavaScript Concurrency",
        "title": "Custom Microtask Batch Executor",
        "difficulty": "Intermediate",
        "estMinutes": 12,
        "whyThisMatters": "Frameworks like React scheduler and Vue nextTick use custom batching to coalesce state dispatches.",
        "prompt": "Implement a `batchExecute(tasks)` function that enqueues an array of asynchronous tasks into the microtask queue without starvation...",
        "starterCode": "export function batchExecute(tasks) {\n  // Implement batch execution adhering to microtask guarantees\n}",
        "language": "javascript",
        "testCases": [
          {
            "id": "tc-1",
            "input": "['task1', 'task2']",
            "expectedOutput": "['task1_done', 'task2_done']",
            "isHidden": false
          },
          {
            "id": "tc-2",
            "input": "[]",
            "expectedOutput": "[]",
            "isHidden": true
          }
        ]
      }
    ]
  }
  ```

---

### 5.2 Execute Sandboxed Tests (`POST /api/v1/practice/run-tests`)
- **Description**: Compiles and executes user code against public test cases inside an isolated, secure V8 sandbox (Node.js vm / WebAssembly isolated container).
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "questionId": "q-event-loop-microtasks",
    "language": "javascript",
    "code": "export function batchExecute(tasks) {\n  return tasks.map(t => t + '_done');\n}"
  }
  ```
- **Validation Constraints**:
  - `code`: String, non-empty, max size 64 KB.
  - `language`: Enum (`javascript`, `typescript`, `python`).
  - Execution Timeouts: Max 2000ms CPU execution time; Max 64MB memory heap.
  - Security Sandboxing: Forbids file system access (`fs`), network access (`fetch`, `net`), process controls (`process.exit`), or prototype poisoning.
- **Success Response (`200 OK`)**:
  ```json
  {
    "passed": true,
    "totalTests": 2,
    "passedTests": 2,
    "runtimeMs": 14,
    "memoryMb": 18.2,
    "results": [
      {
        "id": "tc-1",
        "input": "['task1', 'task2']",
        "expectedOutput": "['task1_done', 'task2_done']",
        "actualOutput": "['task1_done', 'task2_done']",
        "passed": true
      }
    ],
    "stdout": "Queue initialized with 2 tasks.\nExecution completed."
  }
  ```
- **Edge Cases & Error Handling**:
  - Syntax Error: Returns `200 OK` with `passed: false` and formatted syntax error stack trace.
  - Infinite Loop / Timeout: Returns `422 Unprocessable Entity` (`EXECUTION_TIMEOUT_EXCEEDED: Exceeded 2000ms limit`).
  - Out of Memory: Returns `422 Unprocessable Entity` (`MEMORY_LIMIT_EXCEEDED: Exceeded 64MB heap`).

---

### 5.3 Submit Final Solution with AI Diagnostic Evaluation (`POST /api/v1/practice/submit`)
- **Description**: Submits the final answer or code for comprehensive evaluation against both public and hidden test cases, accompanied by an AI-generated AST code thesis evaluation.
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "questionId": "q-event-loop-microtasks",
    "language": "javascript",
    "code": "export function batchExecute(tasks) {\n  return Promise.resolve().then(() => tasks.map(t => t + '_done'));\n}",
    "selectedAnswer": null
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "score": 95,
    "passed": true,
    "passedTests": 5,
    "totalTests": 5,
    "runtimeMs": 12,
    "memoryMb": 17.8,
    "timeComplexity": "O(n)",
    "spaceComplexity": "O(n)",
    "summary": "Exemplary solution utilizing native microtask queuing via Promise resolution.",
    "whatYouDidWell": [
      "Guaranteed microtask timing using native Promise scheduling.",
      "Maintained zero-allocation overhead for empty task lists.",
      "Clean adherence to asynchronous semantics."
    ],
    "conceptsDemonstrated": [
      { "name": "Microtask Queue Enqueueing", "status": "Strong" },
      { "name": "Asynchronous Batch Coalescing", "status": "Good" }
    ],
    "whatCouldBeImproved": [
      "Consider using queueMicrotask() for lower overhead than Promise wrapper allocation."
    ],
    "alternativeApproach": "Direct invocation of globalThis.queueMicrotask avoids creating intermediate Promise instances.",
    "topSolutions": [
      {
        "id": "sol-1",
        "rank": 1,
        "title": "Idiomatic Modern queueMicrotask",
        "subtitle": "Zero-Promise overhead standard approach",
        "paradigm": "Standard Web APIs",
        "timeComplexity": "O(n)",
        "spaceComplexity": "O(n)",
        "code": "export function batchExecute(tasks) {\n  return new Promise((resolve) => {\n    queueMicrotask(() => resolve(tasks.map(t => t + '_done')));\n  });\n}",
        "explanation": "Leverages the dedicated ECMAScript queueMicrotask API directly.",
        "pros": ["Lowest GC pressure", "Direct microtask queue access"],
        "cons": ["Requires ES2020+ environment"],
        "whenToUse": "Preferred in modern browser and Node 14+ runtimes."
      }
    ],
    "conceptExplanation": {
      "topic": "Microtask Execution Guarantees",
      "theoreticalFoundation": "The HTML5 and ECMAScript specifications mandate that microtask checkpoints occur whenever the JavaScript execution context stack becomes empty.",
      "underlyingMechanics": "V8 maintains an internal MicrotaskQueue linked to the Isolate. When synchronous execution completes, RunMicrotasks() drains this queue until empty.",
      "stepByStepTrace": [
        "1. Script invokes batchExecute().",
        "2. Function schedules microtask callback.",
        "3. Synchronous stack unrolls to depth 0.",
        "4. Microtask checkpoint triggers, resolving tasks.",
        "5. Control transfers to subsequent macrotasks."
      ],
      "architecturalTakeaways": "Microtask batching allows high-frequency UI state mutations to coalesce before invoking expensive DOM layout recalculations.",
      "commonPitfalls": [
        "Scheduling indefinite recursive microtasks which starves UI painting.",
        "Assuming setTimeout(fn, 0) runs prior to Promise.then callbacks."
      ]
    },
    "aiRecommendation": "Your understanding of microtask mechanics is solid. Advance to 'Node.js Libuv vs. Browser Event Loop' to compare I/O poll phases.",
    "xpEarned": 50,
    "newStreakDays": 6,
    "completedQuestionsToday": 3,
    "totalQuestionsTargetToday": 5
  }
  ```

---

## 6. Progress Analytics & Recommendations Endpoints

### 6.1 Get Analytics Overview (`GET /api/v1/analytics/overview`)
- **Description**: Returns multi-dimensional metrics for the progress dashboard.
- **Access**: Protected
- **Success Response (`200 OK`)**:
  ```json
  {
    "totalStudyHours": 38.5,
    "totalXp": 1420,
    "activeStreak": 6,
    "overallMastery": 48,
    "categoryMastery": [
      { "category": "Frontend Architecture", "mastery": 68, "benchmark": "Proficient" },
      { "category": "JavaScript Foundations", "mastery": 85, "benchmark": "Master" },
      { "category": "Distributed Systems", "mastery": 32, "benchmark": "Novice" }
    ],
    "retentionIndex": 82.4,
    "activityHeatmap": [
      { "date": "2026-09-01", "count": 8, "minutes": 45 },
      { "date": "2026-09-02", "count": 5, "minutes": 30 },
      { "date": "2026-09-03", "count": 3, "minutes": 25 }
    ]
  }
  ```

---

### 6.2 Get Weak Concepts Registry (`GET /api/v1/analytics/weak-concepts`)
- **Description**: Analyzes historic test failures and returns active weak concepts requiring targeted remediation.
- **Access**: Protected
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": "wc-event-loop-starvation",
      "name": "Microtask Queue Starvation",
      "category": "Frontend Foundations",
      "masteryPercent": 48,
      "reason": "Failed 3 consecutive questions testing recursive microtask execution vs. macrotask yield points.",
      "recommendedAction": "Complete 5-minute targeted remediation on Macrotask interleaving.",
      "topicId": "js-event-loop"
    }
  ]
  ```

---

### 6.3 Get AI Recommendations (`GET /api/v1/recommendations`)
- **Description**: Returns algorithmically generated learning path suggestions and interventions.
- **Access**: Protected
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": "rec-101",
      "title": "Reinforce Concurrency Primitives Before Web Workers",
      "category": "Intervention",
      "whyRecommendation": "Diagnostic telemetry detected a 48% comprehension score on microtask starvation. Mastering this is mandatory before tackling SharedArrayBuffer and multi-threaded Web Workers.",
      "expectedImpact": "Critical",
      "prerequisites": [
        { "name": "Event Loop & Microtasks", "satisfied": true },
        { "name": "Web Workers API", "satisfied": false }
      ],
      "estHours": 2.5,
      "addedToRoadmap": false,
      "actionTopicId": "js-event-loop"
    }
  ]
  ```

---

### 6.4 Accept Recommendation (`POST /api/v1/recommendations/:id/accept`)
- **Description**: Injects the recommended topic or remedial module directly into the user's active curriculum roadmap.
- **Access**: Protected
- **Success Response (`200 OK`)**: Returns updated roadmap milestone containing the newly inserted remedial node.

---

## 7. Global Search & Notifications Endpoints

### 7.1 Global Command Palette Search (`GET /api/v1/search`)
- **Description**: Fast multi-index search query across roadmap topics, monographs, practice questions, and skills.
- **Access**: Protected
- **Query Parameters**:
  - `q`: Search string (min 2 chars).
- **Success Response (`200 OK`)**:
  ```json
  {
    "query": "event loop",
    "totalResults": 4,
    "results": [
      {
        "type": "lesson",
        "id": "lesson-js-event-loop",
        "title": "The JavaScript Runtime: Event Loop & Microtasks",
        "category": "Frontend Foundations",
        "url": "/learn?topicId=js-event-loop"
      },
      {
        "type": "practice",
        "id": "q-event-loop-microtasks",
        "title": "Practice: Custom Microtask Batch Executor",
        "category": "Practice Problem",
        "url": "/practice?questionId=q-event-loop-microtasks"
      }
    ]
  }
  ```

---

### 7.2 Get Notifications (`GET /api/v1/notifications`)
- **Description**: Retrieves in-app alerts, streak reminders, and adaptive diagnostic notices.
- **Access**: Protected
- **Success Response (`200 OK`)**:
  ```json
  [
    {
      "id": "notif-1",
      "type": "weakness",
      "title": "Diagnostic Recalibration Required",
      "message": "Your score on Concurrency Primitives indicates a need for a quick 5-minute review.",
      "timestamp": "2026-09-03T18:30:00Z",
      "read": false,
      "actionView": "learn",
      "targetId": "js-event-loop"
    }
  ]
  ```

---

## 8. Integration Test Cases & Validation Matrix

| Test ID | Method & Route | Payload / Conditions | Expected Status | Assertion Criteria |
|---------|----------------|----------------------|-----------------|--------------------|
| `TC-AUTH-01` | `POST /auth/register` | Valid new email & strong password | `201 Created` | User ID returned, password hash not exposed, JWT tokens valid. |
| `TC-AUTH-02` | `POST /auth/register` | Existing registered email | `409 Conflict` | Code `EMAIL_ALREADY_REGISTERED`. |
| `TC-AUTH-03` | `POST /auth/login` | Wrong password | `401 Unauthorized` | Generic error message, no token issued. |
| `TC-ROAD-01` | `GET /roadmap` | Valid Auth Bearer | `200 OK` | Milestones ordered topologically; node states match user progress. |
| `TC-LESS-01` | `GET /lessons/non-existent` | Topic ID `unknown-id` | `404 Not Found` | Error code `TOPIC_NOT_FOUND`. |
| `TC-EXEC-01` | `POST /practice/run-tests` | Correct JavaScript algorithm | `200 OK` | `passed: true`, `passedTests == totalTests`, execution time < 500ms. |
| `TC-EXEC-02` | `POST /practice/run-tests` | `while(true) {}` infinite loop | `422 Unprocessable Entity` | Sandbox timeout terminates at 2000ms, returns `EXECUTION_TIMEOUT_EXCEEDED`. |
| `TC-EXEC-03` | `POST /practice/run-tests` | Malicious `require('fs').unlinkSync('/')` | `422 Unprocessable Entity` | Sandbox traps global access, returns `FORBIDDEN_GLOBAL_ACCESS`. |
| `TC-SUBM-01` | `POST /practice/submit` | Valid solution | `200 OK` | AI diagnostic output contains Big-O analysis, whatYouDidWell, exemplary topSolutions. |
| `TC-RECD-01` | `POST /recommendations/101/accept`| Valid recommendation ID | `200 OK` | Roadmap node inserted with status `available`. |
