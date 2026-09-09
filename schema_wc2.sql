-- ==============================================================================
-- WC 2.0 - IXR & Creative Operations Operating System Database Schema
-- Run this in your Supabase SQL Editor to initialize your fresh database project.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE asset_type AS ENUM ('video', 'audio', 'quiz', 'notes', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE work_item_status AS ENUM (
        'draft',
        'review_in_progress',
        'changes_requested',
        'approved_l1',
        'approved_l2',
        'approved_l3',
        'approved_final',
        'blocked',
        'published'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE review_severity AS ENUM ('critical', 'correction', 'enhancement', 'positive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE remark_status AS ENUM ('open', 'resolved', 'reopened', 'dismissed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES / USERS TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'agent', -- 'head', 'subhead', 'lead', 'agent', 'support'
    designation TEXT, -- e.g. 'Lead HB Reviewer', 'Senior Video Editor', 'Audio Engineer'
    avatar_url TEXT,
    presence TEXT DEFAULT 'offline',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROJECT CLASSES (e.g. Class 10th Maths, Class 12th Physics)
CREATE TABLE IF NOT EXISTS project_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE, -- e.g. 'CLS-10-MTH'
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    color TEXT DEFAULT '#3B82F6',
    head_in_charge UUID REFERENCES profiles(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CHAPTERS (Course chapters e.g. Chapter 01: Optics, Chapter 02: Electricity)
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_classes(id) ON DELETE CASCADE,
    chapter_number INT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'review', 'completed'
    target_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORK ITEMS (Creative Assets / Content Units)
CREATE TABLE IF NOT EXISTS work_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES project_classes(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    chapter_track TEXT, -- 'script', 'video_l1', 'video_l2', 'video_l3', 'video_l4', 'audio_l1', 'audio_l2', 'quiz_generation', 'quiz_review', 'quiz_implementation', 'quiz_testing', 'hb_review'
    title TEXT NOT NULL,
    asset_type asset_type NOT NULL,
    status work_item_status NOT NULL DEFAULT 'draft',
    current_review_stage TEXT NOT NULL DEFAULT 'L1', -- 'L1', 'L2', 'L3', 'L4', 'L5'
    parallel_review_mode BOOLEAN DEFAULT FALSE,
    latest_version_number INT DEFAULT 1,
    briefing_url TEXT, -- Shared drive / doc / figma / frame.io
    assignee_ids UUID[] DEFAULT '{}',
    reviewer_ids UUID[] DEFAULT '{}',
    instruction_notes TEXT,
    due_date TIMESTAMPTZ,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ASSET VERSIONS (v1, v2, v3... revision tree)
CREATE TABLE IF NOT EXISTS asset_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    preview_url TEXT,
    source_file_url TEXT,
    notes TEXT,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REVIEW REMARKS (Frame.io style timestamped corrections & remarks)
CREATE TABLE IF NOT EXISTS review_remarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    version_number INT NOT NULL,
    review_stage TEXT NOT NULL DEFAULT 'L1',
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    timestamp_marker TEXT, -- e.g. '04:12' or 'Slide 14'
    target_reference TEXT, -- e.g. 'Question 4 formula'
    severity review_severity NOT NULL DEFAULT 'correction',
    status remark_status NOT NULL DEFAULT 'open',
    is_confidential BOOLEAN DEFAULT FALSE, -- If true: visible only to Client, Head, CEO
    resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    resolved_at_version INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. CONFIDENTIAL CLIENT COMMUNICATIONS (Private Channel: Client <-> Head of IXR <-> CEO)
CREATE TABLE IF NOT EXISTS client_communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES project_classes(id) ON DELETE CASCADE,
    chapter_id UUID REFERENCES chapters(id) ON DELETE SET NULL,
    work_item_id UUID REFERENCES work_items(id) ON DELETE SET NULL,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL, -- 'client', 'head', 'executive'
    recipient_roles TEXT[] DEFAULT ARRAY['head', 'executive'],
    type TEXT NOT NULL, -- 'reassignment_request', 'private_directive', 'scope_alert', 'budget_sla'
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    suggested_assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    target_track TEXT,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'actioned', 'dismissed'
    is_confidential BOOLEAN DEFAULT TRUE,
    action_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HANDOVER AUDIT LOGS (Traceability when teammates leave/rebalance)
CREATE TABLE IF NOT EXISTS handover_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    work_item_id UUID NOT NULL REFERENCES work_items(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    briefing_notes TEXT NOT NULL,
    current_version INT NOT NULL,
    pending_remarks_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_work_items_class_id ON work_items(class_id);
CREATE INDEX IF NOT EXISTS idx_work_items_status ON work_items(status);
CREATE INDEX IF NOT EXISTS idx_review_remarks_item_id ON review_remarks(work_item_id);
CREATE INDEX IF NOT EXISTS idx_asset_versions_item_id ON asset_versions(work_item_id);
CREATE INDEX IF NOT EXISTS idx_handover_item_id ON handover_logs(work_item_id);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_remarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE handover_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view profiles
CREATE POLICY "Allow authenticated read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update profiles" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow authenticated read/write on workspace data
CREATE POLICY "Allow authenticated all project_classes" ON project_classes FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated all chapters" ON chapters FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated all work_items" ON work_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated all asset_versions" ON asset_versions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated all review_remarks" ON review_remarks FOR ALL TO authenticated USING (true);
-- Confidential client channel restricted to client, head, and executive roles
CREATE POLICY "Allow privileged client_communications" ON client_communications FOR ALL TO authenticated 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('client', 'head', 'executive')));
CREATE POLICY "Allow authenticated all handover_logs" ON handover_logs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow users own notifications" ON notifications FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Optional trigger to auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_items_timestamp
BEFORE UPDATE ON work_items
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
