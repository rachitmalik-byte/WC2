export type UserRole = 
  | 'head' 
  | 'video_editor' 
  | 'audio_generator' 
  | 'quiz_generator' 
  | 'quiz_implementer' 
  | 'hb_reviewer' 
  | 'video_reviewer' 
  | 'growth_specialist'
  | 'client';

export type ProfileStatus = 'active' | 'inactive';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
export type LeadPriority = 'low' | 'medium' | 'high';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskType = 'personal' | 'assigned' | 'team';

// IXR Creative & Content Operating System Types
export type AssetType = 'video' | 'audio' | 'quiz' | 'handbook' | 'interactive_module' | 'script';
export type WorkItemStatus = 'backlog' | 'in_production' | 'review_in_progress' | 'approved' | 'delivered';
export type ReviewSeverity = 'blocker' | 'correction' | 'suggestion' | 'nitpick';
export type RemarkStatus = 'open' | 'resolved' | 'rejected' | 'in_discussion';

// Strict Chapter Breakdown Sub-Tracks
export type ChapterTrack = 
  | 'script'
  | 'video_l1' 
  | 'video_l2' 
  | 'video_l3' 
  | 'video_l4'
  | 'audio_l1' 
  | 'audio_l2'
  | 'quiz_generation' 
  | 'quiz_review' 
  | 'quiz_implementation' 
  | 'quiz_testing'
  | 'hb_review';

export interface Chapter {
  id: string;
  project_id: string;
  chapter_number: number;
  title: string;
  description?: string;
  status: 'planned' | 'in_progress' | 'review' | 'completed';
  target_date?: string;
  created_at: string;
  updated_at: string;
}

export type ClientCommunicationType = 
  | 'reassignment_request' 
  | 'private_directive' 
  | 'scope_alert' 
  | 'budget_sla' 
  | 'candid_critique';

export interface ClientCommunication {
  id: string;
  project_id: string;
  chapter_id?: string;
  work_item_id?: string;
  sender_id: string;
  sender_role: 'client' | 'head' | 'executive';
  recipient_roles: UserRole[];
  type: ClientCommunicationType;
  title: string;
  message: string;
  suggested_assignee_id?: string;
  target_assignee_id?: string; // e.g. specialist client wants replaced
  target_track?: ChapterTrack;
  status: 'pending' | 'actioned' | 'dismissed';
  is_confidential: boolean; // strictly hidden from production team
  action_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectClass {
  id: string;
  name: string; // e.g. "Class 10 - Physics 3D Simulation"
  code: string; // e.g. "C10-PHY"
  category: 'Class Course' | 'Interactive Lab' | 'Quiz Bank' | 'Special Module';
  description?: string;
  thumbnail?: string;
  status: 'active' | 'archived' | 'completed';
  custom_review_stages: string[]; // e.g. ["L1: Tech Check", "L2: HB Accuracy", "L3: Quiz Sync", "L4: Final Signoff"]
  lead_id?: string;
  chapters?: Chapter[];
  created_at: string;
  updated_at: string;
}

export interface ReviewRemark {
  id: string;
  work_item_id: string;
  version_number: number;
  review_stage: string; // e.g. "L1", "L2", "L3", "L4"
  timestamp_seconds?: number; // e.g. 84 for 01:24
  target_ref?: string; // e.g. "Question 4", "Slide 12", "Intro VO"
  remark_text: string;
  severity: ReviewSeverity;
  status: RemarkStatus;
  author_id: string;
  is_confidential?: boolean; // If true: visible only to Client, Head, CEO. Hidden from editors/testers.
  resolved_in_version?: number;
  resolved_by?: string;
  created_at: string;
}

export interface AssetVersion {
  id: string;
  work_item_id: string;
  version_number: number;
  preview_url?: string;
  source_file_url?: string;
  notes?: string;
  uploaded_by: string;
  created_at: string;
}

export interface HandoverLog {
  id: string;
  work_item_id: string;
  from_user_id: string;
  to_user_id: string;
  reason: string;
  briefing_notes: string;
  current_version: number;
  pending_remarks_count: number;
  created_at: string;
}

export interface InstructionHistory {
  id: string;
  work_item_id: string;
  version: number;
  instruction_text: string;
  change_reason?: string;
  updated_by: string;
  created_at: string;
}

export interface WorkItem {
  id: string;
  project_id: string;
  chapter_id?: string;
  chapter_track?: ChapterTrack;
  title: string;
  asset_type: AssetType;
  status: WorkItemStatus;
  priority: TaskPriority;
  current_review_stage: string; // e.g. "L1", "L2", "L3"
  is_parallel_review_allowed: boolean;
  assignee_ids: string[];
  reviewer_ids: string[];
  deadline?: string;
  instruction_text: string;
  instruction_version: number;
  drive_folder_url?: string;
  latest_version_number: number;
  versions?: AssetVersion[];
  remarks?: ReviewRemark[];
  handovers?: HandoverLog[];
  dependencies?: string[]; // IDs of other work items this depends on
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: ProfileStatus;
  designation?: string;
  presence?: 'online' | 'idle' | 'busy' | 'offline';
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  company_name: string;
  prospect_name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  company_type?: string;
  industry?: string;
  service_needed?: string;
  service_offered?: string;
  status: LeadStatus;
  priority: LeadPriority;
  notes?: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  ref_image?: string;
  demand_type?: string;
  reply_received?: string;
  proposal_sent?: string;
  hidden_by?: string[];
  // UI helper fields:
  assigned_users?: string[]; // user IDs
}

export interface LeadUpdate {
  id: string;
  lead_id: string;
  user_id: string;
  content: string;
  created_at: string;
  reactions?: { emoji: string; user_ids: string[] }[];
}

export interface LeadAttachment {
  id: string;
  lead_id: string;
  file_name: string;
  file_url: string;
  uploaded_by: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string;
  assignee_ids?: string[];
  creator_id: string;
  priority: TaskPriority;
  deadline?: string;
  reminder_offsets: number[]; // e.g. [15, 30] minutes before
  status: TaskStatus;
  type: TaskType;
  attachments: { name: string; url: string }[];
  created_at: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_interval?: number;
  recurrence_end_date?: string;
  parent_task_id?: string;
}

export interface Reminder {
  id: string;
  title: string;
  reminder_time: string;
  reminder_offsets: number[];
  is_custom: boolean;
  lead_id?: string;
  task_id?: string;
  company_name?: string;
  creator_id: string;
  status: 'active' | 'dismissed';
  notification_type?: 'notification' | 'alarm';
  created_at: string;
  is_company_event?: boolean;
  notes?: string;
  // UI helper fields:
  invited_users?: string[]; // user IDs
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  created_by: string;
  created_at: string;
  // UI helper fields:
  member_ids?: string[];
}

export interface Message {
  id: string;
  channel_id?: string; // null if DM
  sender_id: string;
  receiver_id?: string; // null if channel message
  content: string;
  attachments: { name: string; url: string }[];
  created_at: string;
  isOptimistic?: boolean;
  message_read_receipts?: MessageReadReceipt[];
  reactions?: { emoji: string; user_ids: string[] }[];
}

export interface MessageReadReceipt {
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'lead_update' | 'task_update' | 'reminder_alert' | 'assignment_alert' | 'mention_alert' | 'message_alert';
  title: string;
  body: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export type NoteCategory = 'email_template' | 'call_script' | 'meeting_note' | 'draft' | 'general';

export interface PersonalNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  lead_id?: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

