# CogniPath AI — Frontend Modules & Architecture Specification

> **Target Audience**: AI Coding Agents, IDE Copilots, and Full-Stack Engineers.  
> **Document Purpose**: Comprehensive structural and functional blueprint of the entire client-side architecture for the CogniPath AI platform. Describes all view modules, UI layouts, sub-sections, interactive event contracts, state flows, and shared design tokens.

---

## 1. System Overview & Technology Stack

CogniPath AI is an adaptive pedagogical learning platform designed for software engineers and computer science students. It dynamically calibrates learning roadmaps, delivers deep technical monographs, runs sandboxed coding evaluations, and performs multi-dimensional diagnostics.

### Core Stack & Runtime Environment
- **Framework**: React 18+ (SPA architecture with Vite)
- **Language**: TypeScript 5.x (Strict mode enabled)
- **Styling**: Tailwind CSS v3/v4 with custom academic serif/mono theme tokens and dark-mode class strategy (`html.dark`)
- **State Management**: Centralized React Context (`AppContext.tsx`) with localStorage persistence and optimistic UI updates
- **Iconography**: `lucide-react` (standardized across all buttons, indicators, and navigation)
- **Effects & Feedback**: `canvas-confetti` for milestone celebrations; custom SVG keyframe spinners; skeleton wave animations

---

## 2. Layout & Shell Architecture

The application layout switches between two top-level modes managed in `src/App.tsx`:
1. **Public / Unauthenticated Surface**: `landing` view with sticky public navigation, hero monograph preview, curriculum teaser, and login/register modal dialogs.
2. **Authenticated / Workspace Shell**: Persistent responsive shell containing:
   - **Top Navigation Bar (`src/components/layout/Topbar.tsx`)**: Global search launcher (`Cmd/Ctrl + K`), streak flame counter, daily question progress pill, active learning goal chip, notifications popover with unread counter, theme toggle (`light` / `dark`), and user profile avatar/menu.
   - **Sidebar Navigation (`src/components/layout/Sidebar.tsx`)**: Collapsible desktop/mobile drawer featuring the academic masthead, primary navigation links with badge counts, user mini-profile card, and quick switchers.
   - **Global Search Modal (`src/components/common/SearchModal.tsx`)**: Multi-category command palette searching topics, lessons, practice questions, and taxonomy skills.
   - **Dynamic Adaptive Notification Banner**: Contextual prompt appearing when diagnostic telemetry detects an unaddressed weak concept or remedial recommendation.

---

## 3. Comprehensive Frontend Modules Breakdown

The workspace features **11 distinct view modules**, enumerated below with their functional scope, sub-sections, and interaction contracts.

---

### Module 1: Landing Page (`src/components/landing/LandingView.tsx`)

- **View Mode Key**: `'landing'`
- **Purpose**: Public-facing editorial monograph presenting the platform's adaptive learning methodology.
- **Key Sections & Features**:
  1. **Academic Monograph Masthead**: Publication-style header with issue date, volume index, and authentication buttons ("Sign In", "Commence Diagnostic").
  2. **Hero Monograph Section**: High-contrast headline (*"The Cognitive Apprenticeship for Software Engineering"*), manifesto abstract, interactive goal preview chips, and primary CTA triggering the Onboarding Wizard.
  3. **Methodology Triad (3 Pillars)**:
     - *Topological Prerequisite Graphs*: Visualizing deterministic curriculum sequencing.
     - *AST & Runtime Sandboxing*: Automated code thesis evaluation against hidden invariants.
     - *Spaced Diagnostics & Interventions*: Automatic remedial branch injection.
  4. **Live Curriculum Catalog Preview**: Searchable grid displaying core modules (Distributed Systems, Concurrency, Frontend Architecture, Data Structures) with estimated hours and node counts.
  5. **Academic Testimonials & Social Proof**: Editorial quotes and outcomes from senior engineers and candidates.
  6. **Footer & Colophon**: Site index, system status, licensing notice, and legal links.
- **Outbound Triggers**:
  - `startOnboarding()` -> Transitions to `'onboarding'` view.
  - `openAuth('login' | 'register')` -> Opens `AuthModal.tsx`.
  - `exploreCatalog()` -> Launches `'roadmap'` view.

---

### Module 2: Onboarding & Diagnostic Calibration Wizard (`src/components/onboarding/OnboardingWizard.tsx`)

- **View Mode Key**: `'onboarding'`
- **Purpose**: A multi-step diagnostic funnel configuring the user's customized pedagogical roadmap, skill benchmarks, and pace.
- **Sub-Sections / Wizard Steps (4 Steps)**:
  1. **Step 1: Primary Career Benchmark**:
     - Options: *Full Stack Architect, Distributed Systems Specialist, Senior Frontend Engineer, AI/ML Infrastructure Engineer, Technical Interview Preparation, Custom Target*.
     - Dynamic field for custom goals with autofocus validation.
  2. **Step 2: Experience & Prior Knowledge Baseline**:
     - Levels: *Complete Beginner, Junior Engineer (1-2 yrs), Mid-Level Engineer (3-5 yrs), Staff/Principal Lead (5+ yrs)*.
     - Selectable prior tech stack proficiencies (e.g. TypeScript, Go, Python, SQL) with Beginner/Intermediate/Advanced ratings.
  3. **Step 3: Pacing & Daily Commitment Calibration**:
     - Daily study duration slider (15 min, 30 min, 45 min, 60+ min).
     - Target practice questions per day (3, 5, 10, 15 exercises).
     - Calculated estimated roadmap completion timeline (e.g. *“At 30 mins/day, your curriculum reaches completion in 14 weeks”*).
  4. **Step 4: Learning Preference & Modality Setup**:
     - Modality checkboxes: *Code-first challenges, Theoretical monographs, Interactive flash diagnostics, System design trade-offs*.
- **State & Completion Flow**:
  - Validates all selections at each step; persists completed payload via `finishOnboarding(data)`.
  - Automatically generates initial topological roadmap and transitions user to `'dashboard'` or `'roadmap'`.

---

### Module 3: Student Academic Dashboard (`src/components/dashboard/DashboardView.tsx`)

- **View Mode Key**: `'dashboard'`
- **Purpose**: Primary mission control hub providing actionable daily tasks, learning velocity metrics, and diagnostic alerts.
- **Sub-Sections**:
  1. **Welcome & Contextual Header**: Greeting, current target goal indicator, date stamp, and quick-action buttons ("Continue Lesson", "Daily Practice").
  2. **Academic Telemetry Metric Cards (3 Cards)**:
     - *Daily Exercises Card*: Percentage completed, fraction counter (e.g. `4 / 10`), progress bar, and remaining study duration estimate.
     - *Curriculum Mastery Index*: Global curriculum completion percentage, week-over-week velocity trend (`+4% this week`), and module count.
     - *Academic Streak Tracker*: Current consecutive day count, 7-day visual dot matrix with today's status, and milestone XP reward preview.
  3. **Primary Action Hero ("Current Thesis / Focus Topic")**:
     - Current node banner (e.g. *JavaScript Event Loop & Microtask Execution*).
     - Topic summary, estimated time, prerequisite status badge, and one-click "Resume Lesson" CTA.
  4. **Daily Practice Jump Pad**:
     - Overview of pending exercises categorised by type (MCQ, Coding, Debugging).
     - Quick "Launch Sandboxed Session" CTA.
  5. **Urgent Diagnostic Interventions Panel**:
     - Highlights concepts where recent practice accuracy dipped below 65%.
     - Quick button: "Review Concept" (redirects directly to remedial monograph).
  6. **Recent Activity & Milestone Stream**:
     - Chronological timeline of completed exercises, XP gains, and mastery changes.

---

### Module 4: Interactive Curriculum Roadmap (`src/components/roadmap/RoadmapView.tsx`)

- **View Mode Key**: `'roadmap'`
- **Purpose**: Topological knowledge graph displaying curriculum milestones, node dependencies, prerequisite locks, and progress state.
- **Sub-Sections**:
  1. **Curriculum Controls & Filter Bar**:
     - Category filters: *All, Foundations, Frontend, Backend, Databases, System Design, AI*.
     - View mode toggle: *Milestone Track View vs. Dependency Graph View*.
     - Search input filtering nodes by title or keyword.
  2. **Overall Progress Indicator**:
     - Completed nodes count vs. total nodes; estimated cumulative learning hours.
  3. **Milestone Track Progression**:
     - Sequential milestone blocks (e.g. *Milestone 1: Computational Foundations*, *Milestone 2: Concurrency & Runtime*, etc.).
     - Milestone completion status, total XP value, and prerequisite gatekeeper indicators.
  4. **Roadmap Node Cards**:
     - Visual state variants: `completed` (green check, high-contrast border), `in_progress` (accent outline, active badge), `available` (neutral hoverable), `locked` (padlock icon, prerequisite list popover), `review_needed` (warning highlight).
     - Subtopic checklist preview (e.g. `3/4 subtopics mastered`).
     - Action buttons: "Begin Module", "Review Material", or "View Prerequisites".
  5. **Node Drawer / Inspection Modal**:
     - Detailed sidebar flyout showing the full abstract, why this topic matters, subtopics breakdown, prerequisites list, and direct links to start the monograph or targeted practice.

---

### Module 5: Deep Pedagogical Monograph Lessons (`src/components/learn/LearnView.tsx`)

- **View Mode Key**: `'learn'`
- **Purpose**: Academic-grade technical monograph lessons combining theoretical background, runtime mechanics, syntax specifications, visual code blocks, and formative knowledge checks.
- **Sub-Sections**:
  1. **Monograph Header**:
     - Topic taxonomy breadcrumb (`Roadmap > JavaScript Runtime > Event Loop`).
     - Monograph title, academic abstract, estimated reading duration, difficulty badge, and mastery level gauge.
  2. **Table of Contents (Sticky Aside)**:
     - Navigation anchors highlighting the currently visible section during scroll.
  3. **Core Monograph Sections (`LessonSection[]`)**:
     - Clean typographic layout constrained to 70ch for maximum readability.
     - Custom callouts (`info`, `warning`, `tip`) for subtle runtime behaviors and standard specs.
     - Syntax-highlighted code blocks with copy action and descriptive code captions.
  4. **Anti-Pattern & Common Misconceptions Section**:
     - Side-by-side comparison cards: *Common Anti-Pattern* (red line, erroneous code) vs. *Idiomatic Correction* (green line, corrected code) with detailed diagnostic rationale.
  5. **Key Takeaways & Architectural Heuristics**:
     - Bulleted synthesis for quick retention and revision.
  6. **Inline Knowledge Check (Formative Quiz)**:
     - Multiple-choice questions testing immediate comprehension.
     - Instant feedback on option selection with detailed conceptual explanations.
  7. **Footer Navigation**:
     - "Back to Roadmap" button and primary "Commence Practice Exercises" button linking directly into `/practice` with the active topic loaded.

---

### Module 6: Adaptive Daily Practice & Sandboxed Runner (`src/components/practice/DailyPracticeView.tsx`)

- **View Mode Key**: `'practice'`
- **Purpose**: Comprehensive problem-solving environment supporting multiple question typologies, a Monaco/Web-style code editor, client-side test execution, and in-depth AI diagnostic evaluation.
- **Sub-Sections**:
  1. **Practice Session Masthead**:
     - Active session tracker (`Question X of Y`), session score indicator, topic tag, and topic switch dropdown.
     - Pagination navigation tabs allowing non-linear navigation between daily problems.
  2. **Problem Specification Pane**:
     - Problem title, difficulty badge, estimated solve time, and "Why This Matters" career relevance banner.
     - Detailed markdown problem description, input/output constraints, and mathematical notation.
     - Sample test cases with visual input/output comparison.
  3. **Interactive Workspace (Typology-Dependent)**:
     - **Case A: Multiple-Choice / Conceptual**:
       - Stylized radio option cards with code snippets, keyboard shortcuts (`1-4` / `A-D`), and immediate rationale feedback.
     - **Case B: Output Prediction / Mental Sandbox**:
       - Code snippet display with monospaced text input field for predicted stdout or return value.
     - **Case C: Algorithmic Coding & Debugging**:
       - Integrated code editor (`CodeEditor.tsx`) with language selector (`JavaScript`, `TypeScript`, `Python`), dark monospaced syntax styling, and tab indent handling.
       - Starter code boilerplate with automated function signatures.
  4. **Execution & Test Harness Console**:
     - **"Execute Tests" button**: Runs user code against visible test cases inside a client-side execution sandbox; renders pass/fail status, expected vs. actual output diffs, execution runtime (ms), and console logs.
     - Loading spinner and execution state indicator during test evaluation.
  5. **Submission & AI Evaluation Modal (`#ai-evaluation-modal`)**:
     - **"Submit Final Solution"**: Triggers comprehensive diagnostic evaluation.
     - **Loading State**: Displays `PracticeEvaluationSkeleton` and animated diagnostic messages while the AST analysis runs.
     - **Multi-Tab Evaluation Modal**:
       - *Header*: Score badge (`0-100%`), pass/fail chip, runtime benchmarks, memory consumption, time/space complexity Big-O notations ($O(1)$, $O(n)$).
       - *Tab 1: Diagnostic Report*: Detailed AST analysis, "What You Did Well" highlights, "Areas for Improvement", and concepts demonstrated.
       - *Tab 2: Exemplary Solutions*: Side-by-side comparison of baseline, idiomatic, and high-performance production approaches with pros/cons and when to use.
       - *Tab 3: Theoretical Synthesis*: Deep conceptual explanation grounding the exercise in official standards.
       - *Next Actions*: "Retry Problem", "Next Daily Question", or "Review Weak Topic in Monograph".

---

### Module 7: Multi-Dimensional Progress & Diagnostic Analytics (`src/components/progress/ProgressView.tsx`)

- **View Mode Key**: `'progress'`
- **Purpose**: Detailed diagnostic telemetry visualizing user skill growth, consistency streaks, accuracy breakdowns, and retention decay.
- **Sub-Sections**:
  1. **Executive Metrics Grid**:
     - Total study hours logged, cumulative XP earned, overall curriculum completion percentage, and active streak.
  2. **Skill Proficiency Radar / Mastery Index**:
     - Category-by-category mastery bars (Frontend, Backend, Foundations, Databases, Algorithms).
     - Color-coded benchmarks indicating mastery level (`Novice`, `Competent`, `Proficient`, `Master`).
  3. **Cognitive Retention & Decay Model**:
     - List of previously completed topics displaying estimated memory retention percentage and spaced-repetition review triggers.
  4. **Diagnostic Weak Concept Registry**:
     - Table of concepts where user error rate exceeds threshold.
     - Reason analysis (e.g. *“Recurrently conflates Microtasks with RAF callbacks”*).
     - Direct action buttons: "Launch 5-min Remedial Quiz" or "Re-read Lesson".
  5. **Daily Activity Heatmap**:
     - 30-day commit-style activity matrix illustrating practice volume and streak continuity.

---

### Module 8: Skills Taxonomy & Discovery (`src/components/skills/SkillsDiscoveryView.tsx`)

- **View Mode Key**: `'skills'`
- **Purpose**: Comprehensive directory of software engineering competencies, allowing users to browse, search, and pin target skills to their active curriculum.
- **Sub-Sections**:
  1. **Search & Taxonomy Filter Bar**:
     - Search input with instantaneous filtering.
     - Category chips: *Programming Languages, Frontend Frameworks, Distributed Systems, Cloud & DevOps, Data & AI*.
     - Difficulty filter: *Beginner, Intermediate, Advanced*.
  2. **Skill Competency Cards**:
     - Skill name, category badge, estimated hours to mastery.
     - Prerequisite chips showing dependencies.
     - Target toggle button ("Add to Target Roadmap" / "Remove from Targets").
  3. **Career Alignment Matrix**:
     - Explanatory note detailing which high-impact engineering roles require the selected skill.

---

### Module 9: AI Recommendations & Adaptive Interventions (`src/components/recommendations/RecommendationsView.tsx`)

- **View Mode Key**: `'recommendations'`
- **Purpose**: Algorithmic intervention queue presenting tailored suggestions generated by analyzing recent test failures, pacing trends, and career milestones.
- **Sub-Sections**:
  1. **Intervention Feed Header**:
     - Diagnostic summary explaining how recommendations are synthesized from recent telemetry.
  2. **Priority Recommendation Cards**:
     - Urgency badge: `Critical Intervention`, `High Priority`, or `Elective Enrichment`.
     - Recommendation title and detailed rationale (*"Why the AI suggested this"*).
     - Estimated hours and satisfied prerequisites checklist.
     - Action buttons: "Inject into Active Roadmap" or "Dismiss Recommendation".
  3. **Automated Curriculum Recalibration Trigger**:
     - Button triggering global roadmap re-sequencing based on updated recommendation states.

---

### Module 10: User Settings & Profile Calibration (`src/components/settings/SettingsView.tsx`)

- **View Mode Key**: `'settings'`
- **Purpose**: Management of account preferences, learning pace calibration, display themes, and exportable data.
- **Sub-Sections**:
  1. **Profile Identity Settings**:
     - Name, email, avatar URL, bio.
  2. **Pedagogical Calibration**:
     - Target career benchmark dropdown.
     - Daily time commitment selector (15 to 90 minutes).
     - Daily exercise volume slider.
  3. **Visual & Editor Preferences**:
     - Theme selector: `Light (Classic Editorial)`, `Dark (Monokai Academic)`, `System`.
     - Code editor preferences: Tab size (2 vs 4 spaces), line numbers toggle, font ligatures toggle.
  4. **Data Management & Reset**:
     - "Export Learning Telemetry (JSON)" for personal tracking.
     - "Reset Diagnostic History" (with confirmation dialog).

---

### Module 11: Authentication & Session Modal (`src/components/auth/AuthModal.tsx`)

- **Component Path**: `src/components/auth/AuthModal.tsx`
- **Purpose**: Modal dialog handling user authentication and onboarding transitions.
- **Sub-Sections & States**:
  1. **Mode Switcher**: Tabs toggling between "Sign In" and "Create Account".
  2. **Form Inputs**: Email, password, full name (on registration), and remember-me checkbox.
  3. **Validation & Feedback**: Real-time error messages for invalid emails, short passwords, or invalid credentials.
  4. **Demo / Quick Bypass**: Pre-configured "Demo Account" button allowing instant evaluation of the platform without typing credentials.

---

## 4. Reusable Common Component Library (`src/components/common/`)

CogniPath AI relies on a standardized, accessible component library located in `src/components/common/index.ts`:

| Component | File Path | Variants / Props | Description |
|-----------|-----------|------------------|-------------|
| `Button` | `Button.tsx` | `variant`: `primary`, `secondary`, `academic`, `danger`, `ghost`<br>`size`: `sm`, `md`, `lg`<br>`isLoading`, `leftIcon`, `rightIcon` | Universal accessible button with built-in SVG spinner and standard padding ratios (2:1). |
| `Badge` | `Badge.tsx` | `variant`: `default`, `primary`, `success`, `warning`, `danger`, `outline`<br>`size`: `sm`, `md` | Status chip for difficulty, topic category, and progress indicators. |
| `Card` | `Card.tsx` | `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | Modular border-delimited container adhering to the academic editorial aesthetic. |
| `MetricCard` | `MetricCard.tsx` | `title`, `value`, `subValue`, `tag`, `progressPercent`, `tagIcon`, `customIndicator` | Specialized telemetry card with trend lines, day streak matrices, and footer links. |
| `CodeEditor` | `CodeEditor.tsx` | `value`, `onChange`, `language`, `readOnly`, `height` | Monospaced coding canvas with line numbers, tab capture, and syntax themes. |
| `LoadingSpinner` | `LoadingSpinner.tsx` | `size`: `xs`, `sm`, `md`, `lg`<br>`variant`: `primary`, `current`, `muted` | Scalable animated circular loader for asynchronous actions. |
| `Skeleton` | `Skeleton.tsx` | `SkeletonText`, `SkeletonBadge`, `SkeletonCard`, `SkeletonMetricCard` | Pulsing content placeholders preventing layout shifts during network fetches. |
| `ViewSkeleton` | `ViewSkeleton.tsx` | `DashboardSkeleton`, `LessonSkeleton`, `PracticeEvaluationSkeleton` | Full-page pre-composed layout skeletons for smooth view transitions. |
| `Modal` | `Modal.tsx` | `isOpen`, `onClose`, `title`, `size`: `sm`, `md`, `lg`, `xl` | Accessible backdrop dialog with escape-key and backdrop-click dismiss handlers. |
| `EmptyState` | `EmptyState.tsx` | `icon`, `title`, `description`, `actionLabel`, `onAction` | Standardized zero-state message with graphic icon and actionable CTA. |

---

## 5. State Management & Context Contract (`src/context/AppContext.tsx`)

The client state is centralized in `AppContext.tsx` providing reactive state and helper methods to all views:

```typescript
interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  activeView: ViewMode;
  setActiveView: (view: ViewMode) => void;
  selectedTopicId: string;
  setSelectedTopicId: (id: string) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  finishOnboarding: (data: Partial<UserProfile>) => void;
  adaptiveNotificationBanner: NotificationItem | null;
  dismissAdaptiveBanner: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isViewLoading: boolean;
  setIsViewLoading: (loading: boolean) => void;
  navigateWithLoading: (view: ViewMode, topicId?: string) => void;
  startTopicLearning: (topicId: string) => void;
  startDailyPractice: (topicId?: string) => void;
}
```

---

## 6. Design System Tokens & Typography

- **Background Canvas**: Light: `#F9F7F2` (Warm Academic Cream) | Dark: `#121210` (Deep Onyx)
- **Card Surfaces**: Light: `#FFFFFF` | Dark: `#181714`
- **Borders & Dividers**: Light: `#DCD9D1` | Dark: `#2C2A26`
- **Primary Text**: Light: `#121212` | Dark: `#F4F2EC`
- **Secondary / Caption Text**: Light: `#5C5852` | Dark: `#9E9A91`
- **Academic Crimson Accent**: Light: `#8B2635` | Dark: `#E08A95`
- **Forest Green Success**: Light: `#1F3A2B` | Dark: `#4E876A`
- **Typography Pairing**:
  - Headings & Masthead: Serif font (`Georgia`, `Cambria`, or system serif) with high contrast.
  - Body Text: High-legibility system sans (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `sans-serif`) at 16px minimum with 1.6 line height.
  - Telemetry & Code: Monospaced font (`ui-monospace`, `SFMono-Regular`, `Consolas`, `monospace`).
