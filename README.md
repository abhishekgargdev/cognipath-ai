# CogniPath AI — Adaptive Pedagogical Learning Platform

> **CogniPath AI** is a personalized AI learning platform that analyzes student and engineer goals, maps custom skill roadmaps, delivers deep conceptual treatises, provides adaptive daily coding and conceptual practice, and continuously recalibrates what to learn next based on real diagnostic telemetry.

---

## 🏛️ Core Architecture & Features

### 1. Goal & Skill Calibration (Onboarding Engine)
- **Diagnostic Goal Setting**: Calibrates individualized learning roadmaps tailored to specific career benchmarks (e.g. Senior Frontend Architect, Distributed Systems Engineer, AI Engineer).
- **Adaptive Pacing**: Configures daily commitment thresholds (e.g., 5-15 daily questions, 20-40 minutes per day) with dynamic recalculation of milestone target completion dates.

### 2. Interactive Curricular Roadmap
- **Topological Prerequisite Trees**: Visually maps foundational, intermediate, and advanced topics with state markers (`completed`, `in-progress`, `available`, `locked`).
- **Dynamic Re-sequencing**: Injects targeted remedial topics and reinforcement exercises automatically when diagnostic weaknesses are detected during practice.

### 3. Pedagogical Monograph Lessons (`/learn`)
- **Academic Treatise Formatting**: Comprehensive lesson materials featuring historical context, runtime memory layouts, and heap execution semantics.
- **Deep Code Snippets & Visual Diagrams**: Highlighting critical operational nuances such as microtask vs. macrotask event loop precedence and lexical closures.
- **Formative Knowledge Calibrations**: Inline interactive quizzes verifying comprehension before advancing to hands-on exercises.

### 4. Adaptive Daily Practice & Test Runner (`/practice`)
- **Diverse Exercise Typologies**: Seamlessly blends conceptual multiple-choice deductions, algorithmic coding problems, and refactoring challenges.
- **Monaco Code Editor**: High-fidelity code editing experience with language selection (`JavaScript`, `TypeScript`, `Python`), syntax highlighting, and tab formatting.
- **Client-Side Test Harness**: Sandboxed execution checking user algorithms against multiple unit test cases with assertion output.
- **Streamlined Pagination**: Clear numbered navigation tabs, previous/next controls, and shortcut jump pads across the daily practice set.

### 5. Intelligent Diagnostic AI Evaluation Modal
- **Multi-Dimensional Scoring**: Evaluates code submissions on functional accuracy, edge-case coverage, runtime complexity ($O(1)$, $O(n)$), and memory footprint.
- **Three-Tier Deep Dive**:
  - **Diagnostic Report**: AST breakdown, positive patterns, and targeted remedial advice.
  - **Exemplary Solutions**: Side-by-side comparison of baseline, idiomatic, and high-performance production approaches.
  - **Theoretical Synthesis**: Detailed conceptual explanations grounding the solution in standard specifications.

---

## 🧩 Reusable Component Library (`/src/components/common`)

CogniPath AI features a modular, performant UI component architecture designed to eliminate code duplication, standardize styling, and ensure responsive loading states:

| Component | Description |
|-----------|-------------|
| `Button` | Accessible button with `primary`, `secondary`, `academic`, `danger`, and `ghost` variants, loading spinner integration, and icon slots. |
| `Badge` | Compact tag with `default`, `primary`, `success`, `warning`, `danger`, and `outline` variants. |
| `Card` | Modular card container with sub-components: `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`. |
| `MetricCard` | Specialized academic metric card with trend indicators, progress bars, and custom day-streak indicators. |
| `LoadingSpinner` | SVG-based rotational spinner with configurable sizes (`xs`, `sm`, `md`, `lg`) and variant color palettes. |
| `Skeleton` | Base shimmering pulse block with custom dimensions and border radius. |
| `SkeletonText` | Multi-line text placeholder with varied widths for natural layout simulation. |
| `SkeletonCard` & `SkeletonMetricCard` | Pre-composed card skeleton states for grid layouts. |
| `ViewSkeleton` | View-level skeleton layouts (`DashboardSkeleton`, `LessonSkeleton`, `PracticeEvaluationSkeleton`). |
| `Modal` | Accessible backdrop modal dialog with smooth transitions and escape/backdrop dismiss handlers. |
| `EmptyState` | Standardized zero-data fallback component with action button support. |

---

## 🎨 Design System & Aesthetic Archetype

- **The CogniPath Gazette**: Inspired by prestigious academic publications and classic editorial monographs.
- **Typographic Hierarchy**: Elegant serif display typography paired with geometric monospaced accents for code telemetry and data labels.
- **Palette**: Refined warm off-white canvas (`#F9F7F2`), deep onyx typography (`#121212`), and rich crimson accenting (`#8B2635`), with full high-contrast dark mode support.
- **Strict Anti-Slop Discipline**: No generic purple gradients, arbitrary glassmorphism, or non-functional decorative clutter.

---

## 🛠️ Technology Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark mode class strategy
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Tailwind CSS keyframes
- **Code Editing**: Integrated web code editing harness

---

## 🚀 Development & Scripts

- `npm run dev`: Starts the development server at `http://localhost:3000`
- `npm run build`: Bundles the production application into `dist/`
- `npm run lint`: Performs TypeScript static type checking without emitting files

---

## 📚 Technical Specifications & AI Agent Documentation

CogniPath AI includes comprehensive technical blueprints designed for AI coding agents, IDE copilots, and full-stack engineers:

1. **[`FRONTEND_MODULES.md`](./FRONTEND_MODULES.md)**: Exhaustive breakdown of all 11 frontend view modules, sub-sections, UI components, interaction contracts, design tokens, and context state flows.
2. **[`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)**: RESTful API contracts (`/api/v1`), Zod/JSON schemas, sandboxed execution rules, error taxonomy (RFC 7807), edge cases, and end-to-end integration test cases.
3. **[`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md)**: PostgreSQL DDL definitions, UUID foreign keys, enum types, automated telemetry triggers, compound indexes, Row-Level Security (RLS) policies, and Cloud Firestore document projections.
