<div align="center">

# 🌿 WC 2.0 (Workflow Convergence)
### *Next-Generation IXR & Creative Operations Operating System*
**The High-Velocity Alternative to Clunky Spreadsheets & Disjointed Slack Threads**

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Vercel Ready](https://img.shields.io/badge/Vercel-Production%20Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <b>WC 2.0</b> converges the density and muscle-memory speed of <b>Excel</b>, the visual pipeline tracking of <b>Jira</b>, and the precision timecoded review environment of <b>Frame.io</b> into a single, cohesive operating system tailored for fast-moving <b>IXR (Interactive / Extended Reality) and creative content teams</b>.
</p>

[Mission & Why WC 2.0](#-the-origin--mission) • [The 4 Core Pillars](#-core-architectural-pillars) • [Spreadsheets vs Apps Deep-Dive](#-why-spreadsheets-fail--the-wc-20-answer) • [Role Simulator Test Flight](#-role-simulator--persona-test-flight) • [Vercel Deployment](#-one-click-vercel-deployment) • [Database Architecture](#-database-schema--supabase-setup) • [Changelog & Patches](#-patch-notes--changelog)

---

</div>

## 🎯 The Origin & Mission

### The Friction in Modern IXR Teams
In content, 3D, interactive media, and video production departments, operations frequently devolve into a chaotic mixture of **massive 50-column Excel sheets** and **hundreds of fragmented Slack messages**.

When team members are asked whether this workflow is efficient, the answer is an overwhelming **"No"**:
1. **Multi-Tier Rework Chaos (L1, L2, L3, HB, QA)**: Reviewers leave remarks in Slack DMs or cell notes. When a video or 3D asset moves to revision 2 ($v2$) or 3 ($v3$), the historical remarks and timestamps are lost or overwritten.
2. **Out-of-Order Execution**: Team members often begin work on higher-level reviews (e.g., L3/L4 or audio design) while initial L1 script sign-offs are still pending. Rigid legacy tools crash or lock up; spreadsheets simply let anyone overwrite anything with zero safeguards.
3. **High Team Turnover & Frequent Reassignment**: Freelancers, animators, and specialists join and leave mid-project. In spreadsheets, reassigning 50 items means tedious manual copy-pasting, inevitably breaking cell formulas and losing accountability.
4. **Context Fragmentation**: Deliverable links (Drive, Frame.io, Figma, YouTube) are buried in chat threads rather than living permanently on the project dossier.

### The WC 2.0 Solution
**WC 2.0** unifies this entire workflow lifecycle:
- **Dual-View Cockpit**: Instant toggle between high-density **Excel Grid Mode** (for batch velocity) and visual **Kanban Pipeline** (for phase progression).
- **Frame.io-Style Review Drawer**: Asset video preview with timestamped remarks, visual playhead scrubbing, and version comparison tree ($v1 \leftrightarrow v2 \leftrightarrow v3$).
- **Role Simulator Sandbox**: Fake-login test flight with 7 specialized personas for instant UI verification without database friction.
- **Dynamic Revision Lifecycle**: Resilient status machine accommodating non-linear reviews (L1, L2, L3, Head Approval, Final QA) with complete audit logging.
- **Calm Botanical Light Aesthetic**: Designed for long production hours with a soothing Sage & Slate palette, high-contrast readability, and zero eye fatigue.

---

## 🏛️ Core Architectural Pillars

```
                     WC 2.0 OPERATIONAL HUB
    ┌───────────────────────────────────────────────────────┐
    │              Unified Project Asset Dossier            │
    └───────────┬───────────────────────────────┬───────────┘
                ▼                               ▼
    ┌───────────────────────┐       ┌───────────────────────┐
    │   Excel Grid View     │       │    Kanban Pipeline    │
    │  • Batch Cell Edits   │       │  • Drag & Drop Phases │
    │  • Speed Filters      │       │  • Bottleneck Auditing│
    │  • 1-Click CSV Export │       │  • Visual Velocity    │
    └───────────┬───────────┘       └───────────┬───────────┘
                └───────────────┬───────────────┘
                                ▼
    ┌───────────────────────────────────────────────────────┐
    │          Frame.io-Style Review & Audit Drawer         │
    │  • Scrubber & Video Preview   • Timestamped Markers   │
    │  • Multi-Tier Signoffs (L1-4) • Turnover Audit Ledger │
    └───────────────────────────────────────────────────────┘
```

### 1. The Dual-View Cockpit (Excel Speed + Kanban Visibility)
- **High-Density Data Grid**: Clean, dense spreadsheet interface featuring sticky headers, inline cell edits, batch selection checkboxes, and dynamic status pill triggers.
- **Speed Filters**: Instant one-click presets to focus on what matters:
  - `⚡ My Pending Work`: Items assigned directly to the current simulated persona.
  - `🔍 Needs Review (L1/L2)`: Creative deliverables awaiting reviewer validation.
  - `🏁 Final Review / QA`: Assets in the final delivery gauntlet.
  - `⚠️ Delayed / At Risk`: Overdue items flagged for executive attention.
- **Instant CSV Export**: One-click operational backup exporting sanitized, structured CSV files ready for stakeholders who still demand raw data.

### 2. Frame.io-Inspired Review Drawer
- **Timecoded Remarks**: Reviewers add comments tied directly to exact video frames/timestamps (`00:42`, `01:15`).
- **Interactive Scrubber**: Clicking any timestamp immediately jumps the preview player to that exact moment.
- **Version Tree ($v1 \leftrightarrow v2 \dots$)**: Inspect current deliverables side-by-side with prior revisions to ensure animator/editor compliance with previous review notes.
- **Multi-Level Sign-Off Matrix**: Dedicated validation checkpoints for **L1 (Script/Initial)**, **L2 (Design/Rough Cut)**, **L3 (Polish/Audio)**, **HB (Head Boss Approval)**, and **QA**.

### 3. Role Handoff & Turnover Ledger
- **Seamless Reassignments**: When an editor or reviewer leaves the project, reassigning their queue takes 2 clicks and automatically updates the immutable turnover history.
- **Zero-Loss Handover Notes**: The incoming specialist inherits full context, past remarks, and revision history directly on the asset drawer.

---

## 📊 Why Spreadsheets Fail & The WC 2.0 Answer

| Traditional Spreadsheet Dilemma | How WC 2.0 Solves It |
| :--- | :--- |
| **"Accidental Cell Overwrites"**: Someone pastes an incorrect value or drags a formula, silently corrupting project status for 40 deliverables. | **Strict Schema & Role Boundaries**: Statuses and stages are controlled state-machine transitions. Nobody can delete or break columns. |
| **"Where Did That Comment Go?"**: Feedback lives in cell notes, unread email chains, or Slack DMs with dead file links. | **Frame.io Timecoded Drawer**: Remarks are anchored to exact timestamps on the asset itself, permanent and searchable. |
| **"Out-of-Order Chaos"**: An editor starts L4 color grading while L1 script sign-off is still missing; no one notices until final delivery. | **Visual Pipeline Stage Gates**: Stage transitions are highlighted with clear reviewer ownership and dependency flags. |
| **"No Granular Access Control"**: Everyone with edit link has god-mode power, leading to accidental deletions and unauthorized status changes. | **RBAC Engine**: Editors, Reviewers, Audio Specialists, and Executives only see and interact with their authorized actions. |
| **"File Version Nightmare"**: Rows named `video_final_v2_edit_final_FINAL.mp4` clutter cells without link verification. | **Structured Version Tree**: Clear $v1$, $v2$, $v3$ tracking with live preview embed and direct review remark comparisons. |

---

## 🎭 Role Simulator & Persona Test Flight

To enable instant stakeholder testing, demoing, and workflow verification **without forcing team members through tedious signup forms or email verification**, WC 2.0 includes a **Universal Persona Simulator**:

```
[ 🌿 WC 2.0 Login / Switcher ]
 ├─ 👑 CEO / Executive            (Full visibility, executive dashboards, override authority)
 ├─ 🎯 Head of IXR Operations     (Pipeline orchestration, assignment management, bottleneck auditing)
 ├─ 📝 HB Reviewer (Head Boss)    (Final artistic approval gatekeeper, high-priority sign-offs)
 ├─ 🎬 Video Reviewer (L1/L2)     (Precision timecode review, revision request issuer)
 ├─ ✂️ Video Editor (Specialist)  (Asset uploader, status updater, remark resolver)
 ├─ 🎵 Audio Specialist           (Sound design, SFX/VO checkpoints, L3 polish)
 └─ 🧪 Quiz / QA Specialist       (Interactive element validation, final QA gatekeeper)
```

Clicking **"Test Flight Login"** or using the **Role Switcher** in the top navigation bar immediately switches permissions, view filters, and assigned deliverables in real-time.

---

## 🎨 Design System: Calm Botanical Theme

Built to counteract the cognitive fatigue of working 8+ hours inside stark, blinding spreadsheets or pitch-black high-contrast dark modes:

- **Primary Background**: `#F8FAF8` (Soft Botanical Off-White / Sage Hue)
- **Card Surface**: Pure Crisp White `#FFFFFF` with ultra-fine `#E2E8F0` slate borders
- **Accent Emerald / Sage**: `#10B981` / `#059669` representing healthy progress and clean workflows
- **Typography**: Clean, geometric sans-serif with tabular numeric alignment for high-density figures

---

## 🚀 One-Click Vercel Deployment

WC 2.0 is fully pre-configured for zero-friction **Vercel** deployment.

### 1. Repository Setup
```bash
# Set origin to your GitHub repository
git remote add origin https://github.com/rachitmalik-byte/WC2.git
git branch -M main
git push -u origin main
```

### 2. Deploy via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the `rachitmalik-byte/WC2` repository.
3. Vercel will automatically detect Vite via `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. *(Optional)* Add Environment Variables for Supabase (if not provided, WC 2.0 automatically runs in resilient in-memory mock mode).
5. Click **Deploy**! 🚀

---

## 🗄️ Database Schema & Supabase Setup

WC 2.0 includes a ready-to-run PostgreSQL schema designed specifically for IXR multi-tier reviews and asset tracking.

### Schema Highlights (`schema_wc2.sql`):
- `ixr_projects`: Core project metadata, client, target delivery date, and health status.
- `ixr_deliverables`: Asset items (Video, 3D, Interactive Quiz, Audio) with current revision number and stage.
- `ixr_reviews`: Review tiers (L1, L2, L3, HB, QA) with timecode markers, status (`approved`, `rework_needed`), and remarks.
- `ixr_turnover_ledger`: Comprehensive audit log recording reassignments, personnel departures, and handoffs.

### Local Development Setup:
```bash
# 1. Clone repository
git clone https://github.com/rachitmalik-byte/WC2.git
cd WC2

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
# App will launch on http://localhost:5173
```

---

## 📝 Patch Notes & Changelog

### Version 2.0.0 — *The IXR Creative Operations Release*
*Release Date: September 2026*

#### 🌟 New Features & Capabilities
- **Dual-View Operational Cockpit**: Introduced high-density Excel spreadsheet view with inline editing alongside the visual Kanban workflow pipeline.
- **Frame.io-Style Review Drawer**: Added timecoded asset review with visual scrubber, precision remarks (`00:42`), and multi-tier sign-off checkpoints (L1, L2, L3, HB, QA).
- **Universal Role Simulator**: Replaced traditional email login barriers with 1-click persona switching (CEO, Head of IXR, HB Reviewer, Video Reviewer, Video Editor, Audio, Quiz QA).
- **Speed Filter Toolbar**: Instant filtering for "My Pending Work", "Needs Review", "Final Review / QA", and "Delayed Items".
- **1-Click CSV Export**: Instant table export enabling clean offline reporting for executive meetings.
- **Turnover Audit Ledger**: Full reassignment tracking to ensure smooth team handoffs when specialists leave or join.
- **Calm Botanical Theme & New Logo**: Modernized aesthetic with soft sage palette, slate cards, and brand new converging-rings SVG logo.
- **Vercel Zero-Config Deployment**: Added production-ready `vercel.json` SPA rewrite rules and Vite build configuration.

#### 🔒 Security & Sanitization
- Removed all legacy outbound sales CRM database connection strings and project keys.
- Sanitized `.env.example` with zero credential leaks.
- Zero-error TypeScript 5.7 compilation (`tsc -b && vite build` passing cleanly in under 4 seconds).

---

<div align="center">
  <b>WC 2.0</b> — Engineered with precision for modern IXR teams.<br>
  Built with ❤️ for frictionless creative collaboration.
</div>
