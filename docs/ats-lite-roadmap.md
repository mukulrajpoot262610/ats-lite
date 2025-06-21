# 📄 ATS-Lite Implementation Roadmap

## 🧠 Overview

**ATS-Lite** is a mini-app that showcases the thinking of a lightweight applicant tracking system (ATS) using a transparent **MCP loop** (Think → Act → Act → Speak). It demonstrates LLM integration, UI streaming, and synchronous filtering/ranking logic.

## 🚀 Goals

- Allow recruiters to query a dummy candidate dataset (CSV) using natural language.
- Visibly trace the **MCP loop**: from plan generation to final output.
- Animate every phase for polish and clarity.
- Build clean, testable, scalable code — worthy of Staff-level design.

## 📌 High-Level Architecture

```javsscript
             ┌────────────┐
             │ Chat Input │
             └─────┬──────┘
                   │
           ┌───────▼────────┐
           │ THINK: LLM Call│
           │ (returns plan) │
           └───────┬────────┘
                   │
    ┌──────────────▼───────────────┐
    │ ACT 1: filterCandidates(plan)│
    └──────────────┬───────────────┘
                   │
    ┌──────────────▼──────────────┐
    │ ACT 2: rankCandidates(plan) │
    └──────────────┬──────────────┘
                   │
        ┌──────────▼───────────┐
        │ SPEAK: LLM Summary   │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────┐
        │ Result Table + Stats │
        └──────────────────────┘
```

## 🔧 Low-Level Design

### 1. Modules

| Module                   | Responsibility                                         |
| ------------------------ | ------------------------------------------------------ |
| `/lib/tools.ts`          | `filterCandidates`, `rankCandidates`, `aggregateStats` |
| `/lib/llm.ts`            | OpenAI interactions for THINK and SPEAK                |
| `/hooks/useAgentLoop.ts` | Drives the MCP lifecycle state machine                 |
| `/components/`           | UI for chat, table, timeline, detail drawer            |
| `/store/agentState.ts`   | Global state for MCP phases using Zustand              |

### 2. MCP Loop Breakdown

| Phase     | Detail                                                                       |
| --------- | ---------------------------------------------------------------------------- |
| **THINK** | LLM gets user message + CSV headers → returns JSON plan (`{ filter, rank }`) |
| **ACT 1** | Frontend filters candidates synchronously with `filterCandidates(plan)`      |
| **ACT 2** | Ranks them using `rankCandidates(ids, plan)`                                 |
| **SPEAK** | LLM is passed top 5 rows → returns recruiter-friendly summary                |

### 3. UI Components

| Component            | Features                                              |
| -------------------- | ----------------------------------------------------- |
| `ChatBox.tsx`        | Stream assistant text, handle ⌘ + Enter               |
| `Timeline.tsx`       | Animates each MCP step in order                       |
| `CandidateTable.tsx` | Animated reordering with Framer Motion                |
| `DetailPanel.tsx`    | Side panel for candidate JSON details                 |
| `HeaderProgress.tsx` | Optional: top-level progress loader using `nprogress` |

## 🧰 Tech Stack

| Category        | Tech                                            |
| --------------- | ----------------------------------------------- |
| **Framework**   | Next.js (App Router)                            |
| **Lang**        | TypeScript                                      |
| **Styling**     | Tailwind CSS                                    |
| **Animations**  | Framer Motion                                   |
| **State**       | Zustand                                         |
| **CSV Parsing** | PapaParse                                       |
| **AI API**      | OpenAI (GPT-4o or GPT-3.5)                      |
| **Streaming**   | Custom useChatStream (SSE-style token-by-token) |
| **Testing**     | Jest + React Testing Library                    |
| **Deployment**  | Vercel                                          |

## ✅ Deliverables Checklist

| Task                                      | Status |
| ----------------------------------------- | ------ |
| CSV load and transformation               | ✅     |
| Chat input + streaming                    | ⬜     |
| LLM prompt for THINK (filter + rank)      | ⬜     |
| LLM prompt for SPEAK (summary)            | ⬜     |
| Synchronous filtering logic               | ⬜     |
| Ranking logic (primary + tiebreakers)     | ⬜     |
| UI animations: timeline, table reordering | ⬜     |
| Candidate detail drawer                   | ⬜     |
| Jest test for required case               | ⬜     |
| Clean README + .env.example               | ⬜     |
| Live deployment (Vercel)                  | ⬜     |

## 🔍 Testing Plan

| Case                                | Tool                  |
| ----------------------------------- | --------------------- |
| Required test (React dev in Cyprus) | Jest                  |
| Ranking accuracy                    | Jest                  |
| Filter logic edge cases             | Jest                  |
| MCP transitions (optional)          | React Testing Library |
| Invalid/malformed LLM JSON          | Manual + retry logic  |

## 🧠 Prompting Strategy

### THINK Prompt (input → JSON plan)

- Includes CSV headers
- Instructs model to reply with _only_ valid JSON (`{ filter, rank }`)
- Includes format hints + retry handling

### SPEAK Prompt (top 5 rows → summary)

- Instructs LLM to generate a recruiter-friendly summary
- Includes aggregate stats from `aggregateStats()`

## 💬 Timeline Strategy

- MCP phases emitted with delay:
  - Phase 1: `filter plan ready`
  - Phase 2: `X rows matched`
  - Phase 3: `ranking plan ready`
  - Phase 4: `ranked IDs [14, 5, 22…]`
- Each line animates in using Framer Motion stagger

## 🔑 Unique Highlights

- Agent thinking is fully **transparent** in UI.
- Graceful handling of malformed LLM JSON (fallback/retry).
- Streaming token-by-token output like ChatGPT.
- Strong separation of AI logic, filtering engine, and UI layers.
