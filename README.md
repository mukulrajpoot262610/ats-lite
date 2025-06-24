# ATS Challenge — "Watch the ATS Think"

_A mini coding exercise that shows off front‑end polish, back‑end logic, and a transparent agent loop._

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your OpenAI API key to .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see ATS-Lite in action!

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 1 · Scenario

You ship a tiny **Next.js** site that:

1. **Pre‑loads a CSV** — `candidates.csv` (≈ 50 dummy rows)

   ```csv
   id,full_name,title,location,years_experience,skills,availability_weeks,willing_to_relocate,etc.
   ```

2. Displays a **chat box** for recruiters to type natural‑language queries such as:

   > Backend engineers in Germany, most experience first.

3. Runs an explicit **MCP loop** (Think → Act → Act → Speak) to

   - **filter** the dataset
   - **rank** the subset
   - **stream every step** to the UI with smooth animations

The assistant is nick‑named **ATS‑Lite**.

## 2 · Required Tools (pure JavaScript)

| Tool                        | Signature                                         | Purpose                            |
| --------------------------- | ------------------------------------------------- | ---------------------------------- |
| `filterCandidates(plan)`    | `{ include?, exclude? } → Candidate[]`            | Boolean / regex / ≥ filtering      |
| `rankCandidates(ids, plan)` | `{ primary, tie_breakers? } → Candidate[]`        | Scores & sorts the filtered subset |
| `aggregateStats(ids)`[^1]   | `ids[] → { count, avg_experience, top_skills[] }` | Quick stats for richer replies     |

All tools are _synchronous_ – no DB or external I/O.

[^1]: Optional, but helpful for richer assistant summaries.

## 3 · MCP Workflow

1. **THINK** – The LLM receives the user message **plus** the CSV header row and replies _only_ with JSON:

   ```json
   {
     "filter": {
       /* FilterPlan */
     },
     "rank": {
       /* RankingPlan */
     }
   }
   ```

2. **ACT 1** – Front‑end calls `filterCandidates(filterPlan)`

3. **ACT 2** – Front‑end calls `rankCandidates(ids, rankingPlan)`

4. **SPEAK** – Front‑end calls the LLM again, passing the **top 5 rows** to generate a recruiter‑friendly summary

Each phase emits an event that surfaces live in the UI.

## 4 · UI & Animation Requirements

| Area                 | Must‑have                                                                                                                       | Library ideas                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Chat panel**       | Stream assistant tokens as they arrive                                                                                          | Tailwind, `react-virtual`         |
| **Timeline sidebar** | Collapsible panel that reveals, one line at a time: 1️⃣ filter plan JSON → 2️⃣ match count → 3️⃣ ranking plan JSON → 4️⃣ ranked IDs | `framer-motion` (stagger / slide) |
| **Result table**     | Always shows the **current ranked subset**; when rows change or reorder, they **animate** into place                            | `framer-motion` layout / FLIP     |
| Loading cues         | Progress bar or shimmer while the agent works                                                                                   | `nprogress` or custom             |
| Row details          | Click a row → side panel with full candidate JSON                                                                               | —                                 |

## 5 · Example Flow

```text
You: Backend engineers in Germany, most experience first.

Timeline ▶
1️⃣ filter plan ready
2️⃣ 7 rows matched
3️⃣ ranking plan ready
4️⃣ ranked IDs [14, 5, 22, …]   ← lines fade‑in one by one

Result table slides into new order.

ATS‑Lite: I found 7 matches (avg 6.1 yrs). Here are the top three…
```

## 🎯 Implementation Highlights

### ✅ **Core Features**

- **Complete MCP Workflow**: Think → Filter → Rank → Speak with real-time UI updates
- **Advanced Filtering**: Boolean, regex, and numeric operators (`>=`, `<=`, etc.)
- **Intelligent Ranking**: Primary field + tie-breakers with ascending/descending order
- **Real-time Timeline**: Animated step-by-step visualization of the agent's thinking process
- **Responsive Animations**: Smooth FLIP animations for candidate table reordering
- **Keyboard Shortcuts**: ⌘+Enter to send messages for power users

### 🏗️ **Architecture**

- **Modular Services**: Clean separation between `MCPService`, `LLMService`, and UI components
- **Type Safety**: Full TypeScript coverage with proper interfaces
- **State Management**: Zustand for clean, reactive state management
- **Error Handling**: Graceful error recovery and user feedback

### 🎨 **UI/UX Polish**

- **Framer Motion**: Staggered animations, layout transitions, and micro-interactions
- **Tailwind CSS**: Modern, responsive design with dark mode support
- **Radix UI**: Accessible, composable UI components
- **Smooth Interactions**: Loading states, skeleton screens, and progressive disclosure

## 6 · Deliverables

- ✅ **Git repo** with clean commits & clear `README.md` (`pnpm install && pnpm dev`)
- ✅ **`.env.example`** for the OpenAI key
- ✅ **Jest tests** with meaningful coverage including the required test case
- 🔄 **Live deployment** (coming soon)

## 7 · Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Animations**: Framer Motion
- **State**: Zustand
- **Testing**: Jest + Bun
- **LLM**: OpenAI GPT-4
- **Package Manager**: pnpm/bun

---

### Keep It Small 📎

No auth, no uploads, no database — just a CSV in memory, two synchronous tools, two LLM calls, and a polished UI that lets reviewers **watch the ATS think** in real time.

### 🧪 Test Coverage

The project includes comprehensive Jest tests covering:

- MCP tool functionality (filter, rank, aggregate)
- The exact challenge scenario: "React dev, Cyprus, sort by experience desc"
- Edge cases and error conditions
- Integration between filtering and ranking

Run `pnpm test` to see all tests pass! ✨
