# WC 2.0 - Supabase Setup & Production Migration Guide

Welcome to **WC 2.0** (IXR & Creative Operations Operating System).

Currently, WC 2.0 is running in **Instant Offline Trial Mode** using in-browser local persistence (`wc2_*` keys) and pre-seeded mock IXR data (Class 10th & 12th math/physics projects, video/audio/quiz assets, multi-tier reviews, and handoff audit trails). No configuration or external accounts are required to test or demonstrate this with your team.

---

## 🚀 Transitioning to Live Supabase (When Ready)

When you are ready to transition from trial to a shared, live cloud or self-hosted database:

### Step 1: Create a Free Project on Supabase
1. Go to [https://supabase.com](https://supabase.com) and create a new project (e.g. `wc2-ixr-production`).
2. Copy your **Project URL** and **Anon Public Key** from **Project Settings > API**.

### Step 2: Run the SQL Schema
1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar.
2. Open [`schema_wc2.sql`](file:///C:/Users/Admin/.gemini/antigravity/scratch/WC%202.0/schema_wc2.sql) located in the root of this project.
3. Paste the entire SQL script into the editor and click **Run**.
4. This creates all necessary tables (`project_classes`, `work_items`, `asset_versions`, `review_remarks`, `handover_logs`, `profiles`), custom ENUMs, triggers, and Row Level Security policies.

### Step 3: Configure Environment Variables
Create a file named `.env` (or update your environment) in the project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Restart the Dev / Build Server
```bash
npm run build
npm run dev
```
The application will automatically detect the presence of the credentials in `src/services/supabase.ts` and route all mutations, live subscriptions, and asset reviews directly to your Supabase PostgreSQL cluster!
