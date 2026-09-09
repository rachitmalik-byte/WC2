import type { 
  Profile, Lead, LeadUpdate, LeadAttachment, Task, Reminder, Channel, Message, Notification, PersonalNote,
  ProjectClass, WorkItem, ReviewRemark, AssetVersion, HandoverLog, Chapter, ClientCommunication
} from '../types/database';

// Pre-populated Profiles tailored for IXR, EdTech & Creative Production
export const MOCK_PROFILES: Profile[] = [
  {
    id: 'ceo-1',
    full_name: 'Ashish Garg',
    email: 'ashish.garg@vaidikedu.com',
    role: 'head',
    status: 'active',
    designation: 'Chief Executive Officer',
    presence: 'online',
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'head-1',
    full_name: 'Sarah Jenkins',
    email: 'sarah.j@relayhq.com',
    role: 'head',
    status: 'active',
    designation: 'Head of IXR & Production',
    presence: 'online',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-rep-1',
    full_name: 'Dr. Alistair Vance',
    email: 'alistair.vance@curriculumcorp.org',
    role: 'client',
    status: 'active',
    designation: 'Client Project Director (Curriculum & Approvals)',
    presence: 'online',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'video-ed-1',
    full_name: 'Alex Rivera',
    email: 'alex.r@relayhq.com',
    role: 'video_editor',
    status: 'active',
    designation: 'Lead Video Editor (3D & Motion)',
    presence: 'online',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'audio-gen-1',
    full_name: 'Elena Rostova',
    email: 'elena.r@relayhq.com',
    role: 'audio_generator',
    status: 'active',
    designation: 'Audio Generator & Voiceover Artist',
    presence: 'idle',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quiz-imp-1',
    full_name: 'Marcus Chen',
    email: 'marcus.c@relayhq.com',
    role: 'quiz_implementer',
    status: 'active',
    designation: 'Quiz Implementer & Interactive Dev',
    presence: 'busy',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'quiz-gen-1',
    full_name: 'Jane Doe',
    email: 'jane.d@relayhq.com',
    role: 'quiz_generator',
    status: 'active',
    designation: 'Subject SME & Quiz Generator',
    presence: 'online',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'hb-rev-1',
    full_name: 'Arjab Jain',
    email: 'arjab.jain@vaidikedu.com',
    role: 'hb_reviewer',
    status: 'active',
    designation: 'Handbook (HB) & Pedagogy Reviewer',
    presence: 'online',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'vid-rev-1',
    full_name: 'Rachit Malik',
    email: 'rachit.malik@vaidikedu.com',
    role: 'video_reviewer',
    status: 'active',
    designation: 'Technical Video Reviewer (L1/L2 Lead)',
    presence: 'online',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// IXR & EdTech Class Projects
export const MOCK_CLASSES: ProjectClass[] = [
  {
    id: 'class-1',
    name: 'Class 10 - Physics 3D Interactive Lab',
    code: 'C10-PHY',
    category: 'Class Course',
    description: '3D simulation assets, interactive optics quizzes, and conceptual video lectures.',
    status: 'active',
    custom_review_stages: ['L1: Tech Audio/Video', 'L2: HB Accuracy', 'L3: Quiz Logic', 'L4: Final Executive Signoff'],
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'class-2',
    name: 'Class 8 - Chemistry Molecules & Bonding',
    code: 'C8-CHEM',
    category: 'Interactive Lab',
    description: 'Animated electron orbits, molecular bonding puzzles, and voiceover walkthroughs.',
    status: 'active',
    custom_review_stages: ['L1: Tech Audio/Video', 'L2: HB Accuracy', 'L3: Quiz Logic', 'L4: Final Executive Signoff'],
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'class-3',
    name: 'Class 12 - Advanced Biology Genetics & DNA',
    code: 'C12-BIO',
    category: 'Class Course',
    description: 'Microscopic 3D rendering of DNA replication, transcription quizzes, and lab experiments.',
    status: 'active',
    custom_review_stages: ['L1: Tech Audio/Video', 'L2: HB Accuracy', 'L3: Quiz Logic', 'L4: Final Executive Signoff'],
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'class-4',
    name: 'Interactive Math Explorations: 3D Calculus',
    code: 'MATH-3D',
    category: 'Special Module',
    description: 'Graph visualization, dynamic curves, and step-by-step interactive problem sets.',
    status: 'active',
    custom_review_stages: ['L1: Tech Audio/Video', 'L2: HB Accuracy', 'L3: Quiz Logic', 'L4: Final Executive Signoff'],
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Structured Chapters for IXR Courses
export const MOCK_CHAPTERS: Chapter[] = [
  {
    id: 'chap-10-01',
    project_id: 'class-1',
    chapter_number: 1,
    title: 'Optics: Light Reflection & Refraction',
    description: 'Ray diagrams, Snell\'s law, convex/concave lens simulations, and refractive index interactive lab.',
    status: 'in_progress',
    target_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'chap-10-02',
    project_id: 'class-1',
    chapter_number: 2,
    title: 'Electricity: Ohm\'s Law & Circuits',
    description: 'Electric potential, resistance in series/parallel, dynamic voltmeter-ammeter interactive circuits.',
    status: 'planned',
    target_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Direct & Confidential Client Communications (Strictly isolated to Client, Head, and CEO)
export const MOCK_CLIENT_COMMUNICATIONS: ClientCommunication[] = [
  {
    id: 'comm-1',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    work_item_id: 'c1-vid-l2',
    sender_id: 'client-rep-1',
    sender_role: 'client',
    recipient_roles: ['head'],
    type: 'reassignment_request',
    title: 'Client Directive: Swap Editor on Chapter 1 Video L2',
    message: 'The motion graphics in cut v2 are still too slow-paced for our 10th-grade curriculum pace. Please assign this track to a senior motion specialist like Alex Rivera immediately, but keep this private so the previous artist isn\'t discouraged.',
    target_assignee_id: 'video-ed-1',
    suggested_assignee_id: 'video-ed-1',
    target_track: 'video_l2',
    status: 'pending',
    is_confidential: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comm-2',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    work_item_id: 'c1-hb',
    sender_id: 'client-rep-1',
    sender_role: 'client',
    recipient_roles: ['head'],
    type: 'private_directive',
    title: 'School Board Inspection: Fast-Track Chapter 1 Delivery',
    message: 'The ministry inspection committee is reviewing Chapter 1 next Thursday. If Video L3 and Quiz Testing are cleared by Tuesday 6 PM, our bonus milestone will be unlocked.',
    status: 'pending',
    is_confidential: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  }
];

// Realistic IXR Work Items across Video, Audio, Quiz, and Handbook
export const MOCK_WORK_ITEMS: WorkItem[] = [
  // Chapter 1 Track: Script
  {
    id: 'c1-script',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'script',
    title: 'Optics: Master Script & Pedagogical Blueprint',
    asset_type: 'script',
    status: 'approved',
    priority: 'high',
    current_review_stage: 'Approved',
    is_parallel_review_allowed: false,
    assignee_ids: ['quiz-gen-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Complete narrative script for reflection, refraction, refractive index, and prism dispersion with timestamped visual cues.',
    instruction_version: 3,
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Video L1
  {
    id: 'c1-vid-l1',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'video_l1',
    title: 'Optics: 3D Animatic & Tech Rough Cut (L1)',
    asset_type: 'video',
    status: 'approved',
    priority: 'high',
    current_review_stage: 'Approved',
    is_parallel_review_allowed: true,
    assignee_ids: ['video-ed-1'],
    reviewer_ids: ['vid-rev-1'],
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: '3D block-out for laser path through rectangular glass slab and triangular prism. Check 60fps frame rate and camera angles.',
    instruction_version: 2,
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Video L2
  {
    id: 'c1-vid-l2',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'video_l2',
    title: 'Optics: Ray Tracer & Prism Refraction (L2)',
    asset_type: 'video',
    status: 'review_in_progress',
    priority: 'high',
    current_review_stage: 'L2',
    is_parallel_review_allowed: true,
    assignee_ids: ['video-ed-1'],
    reviewer_ids: ['vid-rev-1', 'hb-rev-1'],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Animate laser beam traveling through glass prism. Emphasize normal angle theta-1 and theta-2. Ensure refractive index formula n1*sin(th1) = n2*sin(th2) is clearly highlighted.',
    instruction_version: 2,
    drive_folder_url: 'https://drive.google.com/drive/folders/ixr-optics-demo',
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-1-1',
        work_item_id: 'c1-vid-l2',
        version_number: 1,
        preview_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=60',
        notes: 'Initial draft render at 1080p 60fps with basic lighting.',
        uploaded_by: 'video-ed-1',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ver-1-2',
        work_item_id: 'c1-vid-l2',
        version_number: 2,
        preview_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=60',
        notes: 'Fixed laser beam glow intensity and synced audio cues at 01:24.',
        uploaded_by: 'video-ed-1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    remarks: [
      {
        id: 'rem-1',
        work_item_id: 'c1-vid-l2',
        version_number: 1,
        review_stage: 'L1',
        timestamp_seconds: 45,
        target_ref: 'Prism entry point',
        remark_text: 'Laser light beam flickers when intersecting the outer boundary. Fix the normal angle reflection.',
        severity: 'correction',
        status: 'resolved',
        author_id: 'vid-rev-1',
        is_confidential: false,
        resolved_in_version: 2,
        resolved_by: 'video-ed-1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rem-2',
        work_item_id: 'c1-vid-l2',
        version_number: 2,
        review_stage: 'L2',
        timestamp_seconds: 84,
        target_ref: 'Snell formula card',
        remark_text: 'HB Review: The subscript for glass refractive index should say n_glass instead of n2 to avoid confusion for 10th graders.',
        severity: 'blocker',
        status: 'open',
        author_id: 'hb-rev-1',
        is_confidential: false,
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rem-priv-1',
        work_item_id: 'c1-vid-l2',
        version_number: 2,
        review_stage: 'L2',
        timestamp_seconds: 90,
        target_ref: 'Motion Pacing',
        remark_text: 'Client Direct: Pacing is sluggish here. If not solved by tomorrow noon, we should reassign per our direct comm note.',
        severity: 'correction',
        status: 'open',
        author_id: 'client-rep-1',
        is_confidential: true,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  },

  // Chapter 1 Track: Video L3
  {
    id: 'c1-vid-l3',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'video_l3',
    title: 'Optics: Lens Aberration & Visual Polish (L3)',
    asset_type: 'video',
    status: 'in_production',
    priority: 'medium',
    current_review_stage: 'L3',
    is_parallel_review_allowed: true,
    assignee_ids: ['video-ed-1'],
    reviewer_ids: ['vid-rev-1'],
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Chromatic aberration shaders and fine camera dolly movement.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Video L4
  {
    id: 'c1-vid-l4',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'video_l4',
    title: 'Optics: Final 4K Color Grading & Master Export (L4)',
    asset_type: 'video',
    status: 'backlog',
    priority: 'medium',
    current_review_stage: 'L4',
    is_parallel_review_allowed: false,
    assignee_ids: ['video-ed-1'],
    reviewer_ids: ['head-1'],
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Master color export and delivery packaging for LMS integration.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Audio L1
  {
    id: 'c1-aud-l1',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'audio_l1',
    title: 'Optics: Master Voiceover Recording & Dialogue EQ (Audio L1)',
    asset_type: 'audio',
    status: 'approved',
    priority: 'high',
    current_review_stage: 'Approved',
    is_parallel_review_allowed: true,
    assignee_ids: ['audio-gen-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Crystal-clear teacher voiceover matching optics script lines 1 to 48.',
    instruction_version: 1,
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Audio L2
  {
    id: 'c1-aud-l2',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'audio_l2',
    title: 'Optics: SFX Laser Chimes & Ambient Mix (Audio L2)',
    asset_type: 'audio',
    status: 'review_in_progress',
    priority: 'medium',
    current_review_stage: 'L2',
    is_parallel_review_allowed: true,
    assignee_ids: ['audio-gen-1'],
    reviewer_ids: ['vid-rev-1'],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Laser power-up hum, prism transition swooshes, and subtle background study ambience.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Quiz Generation
  {
    id: 'c1-quiz-gen',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'quiz_generation',
    title: 'Optics: 20-Item Question Bank Authoring (Quiz Generation)',
    asset_type: 'quiz',
    status: 'approved',
    priority: 'high',
    current_review_stage: 'Approved',
    is_parallel_review_allowed: true,
    assignee_ids: ['quiz-gen-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Author 20 conceptual questions with 4 plausible distractors and step-by-step solutions.',
    instruction_version: 2,
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Quiz Review
  {
    id: 'c1-quiz-rev',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'quiz_review',
    title: 'Optics: Pedagogical Accuracy & Curriculum Audit (Quiz Review)',
    asset_type: 'quiz',
    status: 'approved',
    priority: 'high',
    current_review_stage: 'Approved',
    is_parallel_review_allowed: true,
    assignee_ids: ['hb-rev-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Cross-verify formula symbols against National Science Standards handbook.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Quiz Implementation
  {
    id: 'c1-quiz-imp',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'quiz_implementation',
    title: 'Optics: Interactive Ray Slider & H5P Engine (Quiz Implementation)',
    asset_type: 'quiz',
    status: 'review_in_progress',
    priority: 'high',
    current_review_stage: 'Implementation',
    is_parallel_review_allowed: true,
    assignee_ids: ['quiz-imp-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Embed interactive canvas angle slider where student changes incident angle and watches refracted ray bend.',
    instruction_version: 2,
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: Quiz Testing
  {
    id: 'c1-quiz-test',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'quiz_testing',
    title: 'Optics: Cross-Device Telemetry & Scoring QA (Quiz Testing)',
    asset_type: 'quiz',
    status: 'in_production',
    priority: 'medium',
    current_review_stage: 'Testing',
    is_parallel_review_allowed: true,
    assignee_ids: ['quiz-imp-1'],
    reviewer_ids: ['head-1'],
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Test on iOS Safari, Chrome Android, and Windows Edge. Verify score payloads transmit to backend.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // Chapter 1 Track: HB Review
  {
    id: 'c1-hb',
    project_id: 'class-1',
    chapter_id: 'chap-10-01',
    chapter_track: 'hb_review',
    title: 'Optics: Principal Director Final Handbook Clearance (HB Review)',
    asset_type: 'handbook',
    status: 'review_in_progress',
    priority: 'high',
    current_review_stage: 'HB Approval',
    is_parallel_review_allowed: false,
    assignee_ids: ['hb-rev-1'],
    reviewer_ids: ['ceo-1', 'head-1'],
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Final executive validation of whole Chapter 1 package before packaging to client LMS.',
    instruction_version: 1,
    latest_version_number: 1,
    created_by: 'ceo-1',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'item-1',
    project_id: 'class-1',
    title: 'Optics: Refraction & Snell\'s Law 3D Animation',
    asset_type: 'video',
    status: 'review_in_progress',
    priority: 'high',
    current_review_stage: 'L2',
    is_parallel_review_allowed: true,
    assignee_ids: ['video-ed-1'],
    reviewer_ids: ['vid-rev-1', 'hb-rev-1'],
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Animate laser beam traveling through glass prism. Emphasize normal angle theta-1 and theta-2. Ensure refractive index formula n1*sin(th1) = n2*sin(th2) is clearly highlighted.',
    instruction_version: 2,
    drive_folder_url: 'https://drive.google.com/drive/folders/ixr-optics-demo',
    latest_version_number: 2,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-1-1',
        work_item_id: 'item-1',
        version_number: 1,
        preview_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=60',
        source_file_url: 'https://drive.google.com/file/d/optics_v1_blend',
        notes: 'Initial draft render at 1080p 60fps with basic lighting.',
        uploaded_by: 'video-ed-1',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'ver-1-2',
        work_item_id: 'item-1',
        version_number: 2,
        preview_url: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&auto=format&fit=crop&q=60',
        source_file_url: 'https://drive.google.com/file/d/optics_v2_blend',
        notes: 'Fixed laser beam glow intensity and synced audio cues at 01:24.',
        uploaded_by: 'video-ed-1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ],
    remarks: [
      {
        id: 'rem-1',
        work_item_id: 'item-1',
        version_number: 1,
        review_stage: 'L1',
        timestamp_seconds: 45,
        target_ref: 'Prism entry point',
        remark_text: 'Laser light beam flickers when intersecting the outer boundary. Fix the normal angle reflection.',
        severity: 'correction',
        status: 'resolved',
        author_id: 'vid-rev-1',
        resolved_in_version: 2,
        resolved_by: 'video-ed-1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rem-2',
        work_item_id: 'item-1',
        version_number: 2,
        review_stage: 'L2',
        timestamp_seconds: 84,
        target_ref: 'Snell formula card',
        remark_text: 'HB Review: The subscript for glass refractive index should say n_glass instead of n2 to avoid confusion for 10th graders.',
        severity: 'blocker',
        status: 'open',
        author_id: 'hb-rev-1',
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'rem-3',
        work_item_id: 'item-1',
        version_number: 2,
        review_stage: 'L3',
        timestamp_seconds: 110,
        target_ref: 'Interactive quiz callout',
        remark_text: 'Parallel review note: Ensure pause marker triggers exactly at 01:50 before quiz #1 begins.',
        severity: 'suggestion',
        status: 'open',
        author_id: 'quiz-imp-1',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ],
    handovers: [
      {
        id: 'ho-1',
        work_item_id: 'item-1',
        from_user_id: 'video-ed-1',
        to_user_id: 'video-ed-1',
        reason: 'Editor check-in',
        briefing_notes: 'All textures mapped. Waiting on HB reviewer signoff on the n_glass formula subscript.',
        current_version: 2,
        pending_remarks_count: 2,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'item-2',
    project_id: 'class-1',
    title: 'Snell\'s Law Explainer Voiceover Track',
    asset_type: 'audio',
    status: 'approved',
    priority: 'medium',
    current_review_stage: 'L4',
    is_parallel_review_allowed: false,
    assignee_ids: ['audio-gen-1'],
    reviewer_ids: ['hb-rev-1', 'head-1'],
    deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Tone should be energetic and clear. Pronounce Snell with emphasis. Match pauses at 00:45 and 01:24.',
    instruction_version: 1,
    drive_folder_url: 'https://drive.google.com/drive/folders/ixr-audio-snell',
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-2-1',
        work_item_id: 'item-2',
        version_number: 1,
        preview_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        source_file_url: 'https://drive.google.com/file/d/snell_master_wav',
        notes: 'Final master audio track with de-essing and studio compression.',
        uploaded_by: 'audio-gen-1',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    remarks: []
  },
  {
    id: 'item-3',
    project_id: 'class-1',
    title: 'Optics Quiz Set: 5 Interactive Multi-Step Questions',
    asset_type: 'quiz',
    status: 'in_production',
    priority: 'high',
    current_review_stage: 'L1',
    is_parallel_review_allowed: true,
    assignee_ids: ['quiz-imp-1', 'quiz-gen-1'],
    reviewer_ids: ['hb-rev-1'],
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Create 5 questions testing critical angle and refractive index calculation. Question 3 must include interactive slider for angle of incidence from 0 to 90 degrees.',
    instruction_version: 1,
    drive_folder_url: 'https://drive.google.com/drive/folders/ixr-optics-quizzes',
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    dependencies: ['item-1'],
    versions: [
      {
        id: 'ver-3-1',
        work_item_id: 'item-3',
        version_number: 1,
        preview_url: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=800&auto=format&fit=crop&q=60',
        source_file_url: 'https://github.com/vaidik/quiz-optics-json',
        notes: 'Branching logic completed. Tested on desktop and iPad viewport.',
        uploaded_by: 'quiz-imp-1',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    remarks: [
      {
        id: 'rem-301',
        work_item_id: 'item-3',
        version_number: 1,
        review_stage: 'L1',
        target_ref: 'Question 3 slider',
        remark_text: 'Slider steps should increment by 1 degree, currently jumping by 5 degrees.',
        severity: 'correction',
        status: 'open',
        author_id: 'vid-rev-1',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    id: 'item-4',
    project_id: 'class-2',
    title: 'Covalent vs Ionic Bonding 3D Molecular Simulation',
    asset_type: 'interactive_module',
    status: 'review_in_progress',
    priority: 'high',
    current_review_stage: 'L3',
    is_parallel_review_allowed: true,
    assignee_ids: ['video-ed-1', 'quiz-imp-1'],
    reviewer_ids: ['hb-rev-1', 'head-1'],
    deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    instruction_text: 'Student drags electron from Sodium (Na) to Chlorine (Cl) to form NaCl crystal lattice. Show electrostatic attraction vectors.',
    instruction_version: 1,
    drive_folder_url: 'https://drive.google.com/drive/folders/ixr-chem-bonding',
    latest_version_number: 1,
    created_by: 'head-1',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    versions: [
      {
        id: 'ver-4-1',
        work_item_id: 'item-4',
        version_number: 1,
        preview_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=60',
        source_file_url: 'https://drive.google.com/file/d/chem_nacl_sim',
        notes: '3D electron transfer physics baked into WebGL container.',
        uploaded_by: 'video-ed-1',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ],
    remarks: [
      {
        id: 'rem-401',
        work_item_id: 'item-4',
        version_number: 1,
        review_stage: 'L2',
        target_ref: 'Electron cloud',
        remark_text: 'Handbook note: The sodium ion radius should shrink after electron donation. Add visual scale animation.',
        severity: 'blocker',
        status: 'open',
        author_id: 'hb-rev-1',
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Realistic Pre-populated Leads (kept for backward-compatible fallback)
const MOCK_LEADS: Lead[] = [
  {
    id: 'lead-1',
    company_name: 'Class 10 Physics 3D Simulation',
    prospect_name: 'Optics & Light Module',
    email: 'physics-curriculum@vaidikedu.com',
    status: 'qualified',
    priority: 'high',
    notes: 'In active review. Video cut v2 in L2 review with HB reviewer.',
    tags: ['Class 10', 'Physics', '3D Lab'],
    created_by: 'head-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_users: ['video-ed-1', 'vid-rev-1', 'hb-rev-1']
  },
  {
    id: 'lead-2',
    company_name: 'Class 8 Chemistry Experiments',
    prospect_name: 'Molecular Bonding & Salt Crystals',
    email: 'chem-team@vaidikedu.com',
    status: 'proposal',
    priority: 'high',
    notes: 'Review level L3. Voiceover track approved, waiting for electron cloud scaling fix.',
    tags: ['Class 8', 'Chemistry', 'Interactive'],
    created_by: 'head-1',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    assigned_users: ['video-ed-1', 'quiz-imp-1', 'hb-rev-1']
  }
];

// Pre-populated Lead Updates
const MOCK_LEAD_UPDATES: LeadUpdate[] = [
  {
    id: 'update-1',
    lead_id: 'lead-1',
    user_id: 'specialist-1',
    content: 'Initial discovery call completed. Prospect is highly motivated to expand their US sales team and needs support set up automated email outbound workflows.',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'update-2',
    lead_id: 'lead-1',
    user_id: 'specialist-1',
    content: 'Demoed the Scale Plan features. They loved the outbound delivery dashboard. Follow-up proposal sent.',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'update-3',
    lead_id: 'lead-2',
    user_id: 'specialist-1',
    content: 'Pepper requested a customized SLA agreement. Shared the template document and scheduled a negotiation review for this Friday.',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'update-4',
    lead_id: 'lead-5',
    user_id: 'specialist-3',
    content: 'Sent contract revision with corrected billing terms. Expecting feedback within 24 hours.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Pre-populated Lead Attachments
const MOCK_LEAD_ATTACHMENTS: LeadAttachment[] = [
  {
    id: 'attach-1',
    lead_id: 'lead-1',
    file_name: 'Acme_Discovery_Notes.pdf',
    file_url: '#',
    uploaded_by: 'specialist-1',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'attach-2',
    lead_id: 'lead-2',
    file_name: 'Stark_Custom_Proposal_Draft.docx',
    file_url: '#',
    uploaded_by: 'specialist-1',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Pre-populated Tasks
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review Acme proposal draft',
    description: 'Double check the delivery timeline and pricing tiers before final Head review.',
    assignee_id: 'specialist-1',
    creator_id: 'head-1',
    priority: 'high',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_offsets: [15, 60],
    status: 'in_progress',
    type: 'assigned',
    attachments: [{ name: 'acme_draft.pdf', url: '#' }],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-2',
    title: 'Update Outreach target list',
    description: 'Compile a list of 50 enterprise tech targets for the new outreach campaign.',
    assignee_id: 'specialist-1',
    creator_id: 'specialist-1',
    priority: 'medium',
    deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_offsets: [30],
    status: 'todo',
    type: 'personal',
    attachments: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-3',
    title: 'Outbound sales strategy sync',
    description: 'Bi-weekly team sync to review lead conversions and strategy calibration.',
    creator_id: 'head-1',
    priority: 'high',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_offsets: [15, 120],
    status: 'todo',
    type: 'team',
    attachments: [],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-4',
    title: 'Follow up with Pepper Potts',
    description: 'Check if they signed the customized agreement terms document.',
    assignee_id: 'specialist-1',
    creator_id: 'head-1',
    priority: 'high',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_offsets: [60],
    status: 'todo',
    type: 'assigned',
    attachments: [],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'task-5',
    title: 'Audit Biotech industry leads',
    description: 'Heads audit of Biotech industry leads to verify progress update coverage.',
    assignee_id: 'specialist-3',
    creator_id: 'head-1',
    priority: 'low',
    deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    reminder_offsets: [],
    status: 'done',
    type: 'assigned',
    attachments: [],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Pre-populated Reminders
const MOCK_REMINDERS: Reminder[] = [
  {
    id: 'rem-1',
    title: 'Call Pepper Potts regarding contract modifications',
    reminder_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    reminder_offsets: [15],
    is_custom: false,
    lead_id: 'lead-2',
    company_name: 'Stark Industries',
    creator_id: 'specialist-1',
    status: 'active',
    notification_type: 'alarm',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    invited_users: ['head-1']
  },
  {
    id: 'rem-2',
    title: 'Acme Corp Follow-up meeting prep',
    reminder_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    reminder_offsets: [60],
    is_custom: false,
    lead_id: 'lead-1',
    company_name: 'Acme Corp',
    creator_id: 'specialist-1',
    status: 'active',
    notification_type: 'notification',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    invited_users: []
  },
  {
    id: 'rem-3',
    title: 'Biotech campaign launch checkpoint',
    reminder_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    reminder_offsets: [30],
    is_custom: true,
    creator_id: 'head-1',
    status: 'active',
    notification_type: 'notification',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    invited_users: ['specialist-3', 'specialist-2']
  }
];

// IXR Studio Production Channels
const MOCK_CHANNELS: Channel[] = [
  {
    id: 'chan-announcements',
    name: 'announcements',
    description: 'Studio-wide delivery milestones, master sign-offs, and critical updates.',
    is_private: false,
    created_by: 'ceo-1',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['ceo-1', 'head-ixr-1', 'hb-rev-1', 'vid-rev-1', 'video-ed-1', 'audio-gen-1', 'quiz-imp-1', 'quiz-gen-1']
  },
  {
    id: 'chan-ch01-optics',
    name: 'ch01-optics-production',
    description: 'Chapter 01: Optics & Refraction cross-functional sprint (Script, Video L1-4, Audio, Quiz).',
    is_private: false,
    created_by: 'head-ixr-1',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['head-ixr-1', 'vid-rev-1', 'video-ed-1', 'audio-gen-1', 'quiz-imp-1', 'hb-rev-1']
  },
  {
    id: 'chan-ch02-circuits',
    name: 'ch02-circuits-production',
    description: 'Chapter 02: Electricity & Circuits interactive 3D lab discussion.',
    is_private: false,
    created_by: 'head-ixr-1',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['head-ixr-1', 'vid-rev-1', 'video-ed-1', 'audio-gen-1', 'quiz-imp-1']
  },
  {
    id: 'chan-video-vfx',
    name: 'video-and-animation',
    description: 'Motion graphics, 3D visual assets, Premiere cuts, and L1-L4 review rounds.',
    is_private: false,
    created_by: 'vid-rev-1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['vid-rev-1', 'video-ed-1', 'head-ixr-1']
  },
  {
    id: 'chan-audio-sound',
    name: 'audio-and-sound',
    description: 'Voiceover recordings, Foley sound effects, EQ balancing, and stem deliveries.',
    is_private: false,
    created_by: 'audio-gen-1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['audio-gen-1', 'video-ed-1', 'head-ixr-1']
  },
  {
    id: 'chan-quiz-pedagogy',
    name: 'quiz-and-pedagogy',
    description: 'Curriculum compliance, interactive quiz widgets, formula calculations, and QA testing.',
    is_private: false,
    created_by: 'quiz-imp-1',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['quiz-imp-1', 'quiz-gen-1', 'hb-rev-1']
  },
  {
    id: 'chan-client-direct',
    name: 'client-direct-directives',
    description: '🔒 Confidential direct channel between Client (Dr. Vance), Head of IXR (Elena Rostova), and CEO (Ashish Garg).',
    is_private: true,
    created_by: 'client-rep-1',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    member_ids: ['client-rep-1', 'head-ixr-1', 'ceo-1']
  }
];

// Realistic IXR Messaging History with Deliverable Tags
const MOCK_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    channel_id: 'chan-announcements',
    sender_id: 'ceo-1',
    content: '🚀 Welcome to WC 2.0! We have transitioned away from clunky Excel sheets and Slack threads. All Chapter deliverables, L1–L4 review rounds, and timestamped Frame.io remarks will now be tracked here directly.',
    attachments: [],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    channel_id: 'chan-announcements',
    sender_id: 'head-ixr-1',
    content: '📢 Ministry inspection deadline for Class 10 Physics is set for next Thursday. Please ensure Chapter 01 Optics (Video L3, Audio Mix, and Quiz QA) are cleared on schedule.',
    attachments: [],
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    channel_id: 'chan-ch01-optics',
    sender_id: 'vid-rev-1',
    content: 'Hey Alex @alex.r, I reviewed the latest render for [asset:c1-vid-l2]. The laser beam glow effect is much cleaner in v2, but check the HB blocker note at 01:24 regarding the Snell Law formula subscript.',
    attachments: [],
    created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-4',
    channel_id: 'chan-ch01-optics',
    sender_id: 'video-ed-1',
    content: 'Got it Rachit! Uploading revision v3 shortly with the corrected n_glass subscript notation. Priya @elena.r, could you verify the narration sync at timestamp 01:20?',
    attachments: [],
    created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-5',
    channel_id: 'chan-ch01-optics',
    sender_id: 'audio-gen-1',
    content: 'Yes! The Foley sound effects for the prism light beam are mastered in [asset:c1-aud-l1]. Running at -14 LUFS standard.',
    attachments: [],
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-6',
    channel_id: 'chan-video-vfx',
    sender_id: 'video-ed-1',
    content: 'Working on Chapter 01 Ray Tracer [asset:c1-vid-l2]. Rendering out the 60fps 4K pass now. If anyone notices jitter on the normal angle vector, let me know.',
    attachments: [],
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-7',
    channel_id: 'chan-quiz-pedagogy',
    sender_id: 'quiz-imp-1',
    content: 'The interactive ray-tracing canvas widget [asset:c1-quiz-imp] is now connected to the scoring API. Tested across iPad Safari and Chrome Desktop.',
    attachments: [],
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  // Confidential Client Direct Channel (Restricted to Client, Head of IXR, CEO)
  {
    id: 'msg-priv-1',
    channel_id: 'chan-client-direct',
    sender_id: 'client-rep-1',
    content: '⚠️ Confidential Directive: Dr. Alistair Vance here. The pacing in cut v2 of the Optics chapter is slower than our curriculum target. If v3 is not approved by tomorrow noon, please reassign to senior motion lead per our discreet protocol.',
    attachments: [],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-priv-2',
    channel_id: 'chan-client-direct',
    sender_id: 'head-ixr-1',
    content: 'Understood Dr. Vance. I am actively supervising the v3 export with Alex and have senior backup ready on standby. We will maintain strict timeline compliance.',
    attachments: [],
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  },
  // Direct Messages (DMs)
  {
    id: 'msg-dm-1',
    sender_id: 'vid-rev-1',
    receiver_id: 'video-ed-1',
    content: 'Hey Alex, quick heads up: make sure to keep the Snell formula card on screen for at least 6 seconds so students have time to read the derivation.',
    attachments: [],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-dm-2',
    sender_id: 'video-ed-1',
    receiver_id: 'vid-rev-1',
    content: 'Will do Rachit, extended the hold to 7.5 seconds with a smooth highlight keyframe.',
    attachments: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  }
];

// Pre-populated Notifications
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'specialist-1',
    type: 'assignment_alert',
    title: 'New Task Assigned',
    body: 'Sarah Jenkins assigned you the task: "Review Acme proposal draft".',
    link: '/tasks',
    is_read: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'specialist-1',
    type: 'mention_alert',
    title: 'Mentioned in #enterprise-pipeline',
    body: 'Sarah Jenkins mentioned you: "Hey Alex, do we have updates on Stark Industries..."',
    link: '/messaging?channel=chan-3',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'head-1',
    type: 'lead_update',
    title: 'Lead Progress Update',
    body: 'Alex Rivera updated Stark Industries: "Pepper requested a customized SLA agreement..."',
    link: '/leads/lead-2',
    is_read: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 5000).toISOString()
  }
];

// Memory Database Store
class MemoryDB {
  profiles = (() => {
    try {
      const stored = localStorage.getItem('wc2_profiles');
      if (stored) return JSON.parse(stored);
      const deletedRaw = localStorage.getItem('wc2_deleted_profiles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      return MOCK_PROFILES.filter(p => !deletedIds.includes(p.id));
    } catch {
      return [...MOCK_PROFILES];
    }
  })();
  leads = (() => {
    try {
      const stored = localStorage.getItem('wc2_leads');
      return stored ? JSON.parse(stored) : [...MOCK_LEADS];
    } catch {
      return [...MOCK_LEADS];
    }
  })();
  leadUpdates = (() => {
    try {
      const stored = localStorage.getItem('wc2_lead_updates');
      return stored ? JSON.parse(stored) : [...MOCK_LEAD_UPDATES];
    } catch {
      return [...MOCK_LEAD_UPDATES];
    }
  })();
  leadAttachments = (() => {
    try {
      const stored = localStorage.getItem('wc2_lead_attachments');
      return stored ? JSON.parse(stored) : [...MOCK_LEAD_ATTACHMENTS];
    } catch {
      return [...MOCK_LEAD_ATTACHMENTS];
    }
  })();
  tasks = (() => {
    try {
      const stored = localStorage.getItem('wc2_tasks');
      return stored ? JSON.parse(stored) : [...MOCK_TASKS];
    } catch {
      return [...MOCK_TASKS];
    }
  })();
  reminders = (() => {
    try {
      const stored = localStorage.getItem('wc2_reminders');
      return stored ? JSON.parse(stored) : [...MOCK_REMINDERS];
    } catch {
      return [...MOCK_REMINDERS];
    }
  })();
  channels = (() => {
    try {
      const stored = localStorage.getItem('wc2_channels_v3');
      if (stored) return JSON.parse(stored);
      localStorage.removeItem('wc2_channels');
      return [...MOCK_CHANNELS];
    } catch {
      return [...MOCK_CHANNELS];
    }
  })();
  messages = (() => {
    try {
      const stored = localStorage.getItem('wc2_messages_v3');
      if (stored) return JSON.parse(stored);
      localStorage.removeItem('wc2_messages');
      return [...MOCK_MESSAGES];
    } catch {
      return [...MOCK_MESSAGES];
    }
  })();
  notifications = (() => {
    try {
      const stored = localStorage.getItem('wc2_notifications');
      return stored ? JSON.parse(stored) : [...MOCK_NOTIFICATIONS];
    } catch {
      return [...MOCK_NOTIFICATIONS];
    }
  })();
  
  personalNotes: PersonalNote[] = (() => {
    try {
      const stored = localStorage.getItem('wc2_personal_notes');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'note-1',
        title: 'US Enterprise Tech - Cold Email Template',
        content: 'Hi {{prospect_name}},<br /><br />Noticed you are scaling up the outbound growth team at {{company_name}}. We built a workflow execution engine called RelayHQ that saves reps 2.5 hours per day on CRM updates.<br /><br />Would you be open to a 10-minute sync this Thursday?<br /><br />Best,<br />{{sender_name}}',
        category: 'email_template',
        creator_id: 'specialist-1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'note-2',
        title: 'Pepper Potts follow up call script',
        content: '1. Re-pitch customized SLA terms.<br />2. Address contract clause 4.2 details regarding lead generation volumes.<br />3. Offer 5% discount on quarterly retainer pilot if signed before Q3.',
        category: 'call_script',
        lead_id: 'lead-2',
        creator_id: 'specialist-1',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  })();

  projectClasses: ProjectClass[] = (() => {
    try {
      const stored = localStorage.getItem('wc2_project_classes');
      return stored ? JSON.parse(stored) : [...MOCK_CLASSES];
    } catch {
      return [...MOCK_CLASSES];
    }
  })();

  chapters: Chapter[] = (() => {
    try {
      const stored = localStorage.getItem('wc2_chapters');
      return stored ? JSON.parse(stored) : [...MOCK_CHAPTERS];
    } catch {
      return [...MOCK_CHAPTERS];
    }
  })();

  clientCommunications: ClientCommunication[] = (() => {
    try {
      const stored = localStorage.getItem('wc2_client_comms');
      return stored ? JSON.parse(stored) : [...MOCK_CLIENT_COMMUNICATIONS];
    } catch {
      return [...MOCK_CLIENT_COMMUNICATIONS];
    }
  })();

  workItems: WorkItem[] = (() => {
    try {
      const stored = localStorage.getItem('wc2_work_items');
      return stored ? JSON.parse(stored) : [...MOCK_WORK_ITEMS];
    } catch {
      return [...MOCK_WORK_ITEMS];
    }
  })();

  persist(table: string) {
    try {
      if (table === 'profiles') localStorage.setItem('wc2_profiles', JSON.stringify(this.profiles));
      if (table === 'project_classes') localStorage.setItem('wc2_project_classes', JSON.stringify(this.projectClasses));
      if (table === 'chapters') localStorage.setItem('wc2_chapters', JSON.stringify(this.chapters));
      if (table === 'client_communications') localStorage.setItem('wc2_client_comms', JSON.stringify(this.clientCommunications));
      if (table === 'work_items') localStorage.setItem('wc2_work_items', JSON.stringify(this.workItems));
      if (table === 'leads') localStorage.setItem('wc2_leads', JSON.stringify(this.leads));
      if (table === 'lead_updates') localStorage.setItem('wc2_lead_updates', JSON.stringify(this.leadUpdates));
      if (table === 'lead_attachments') localStorage.setItem('wc2_lead_attachments', JSON.stringify(this.leadAttachments));
      if (table === 'tasks') localStorage.setItem('wc2_tasks', JSON.stringify(this.tasks));
      if (table === 'reminders') localStorage.setItem('wc2_reminders', JSON.stringify(this.reminders));
      if (table === 'channels') localStorage.setItem('wc2_channels_v3', JSON.stringify(this.channels));
      if (table === 'messages') localStorage.setItem('wc2_messages_v3', JSON.stringify(this.messages));
      if (table === 'notifications') localStorage.setItem('wc2_notifications', JSON.stringify(this.notifications));
      if (table === 'personal_notes') localStorage.setItem('wc2_personal_notes', JSON.stringify(this.personalNotes));
    } catch (e) {
      console.error('Error persisting table ' + table + ' to localStorage:', e);
    }
  }

  supabaseUrl = '';
  supabaseKey = '';
  
  notificationSettings = (() => {
    try {
      const saved = localStorage.getItem('relayhq_notification_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      desktopAlerts: true,
      soundAlerts: true,
      messagePreviews: true,
    };
  })();


  // Active User Profile Simulation
  currentUser: Profile = MOCK_PROFILES[0]; // defaults to Head (Sarah Jenkins)
  
  readReceipts: { message_id: string; user_id: string; read_at: string }[] = [];

  // PubSub listeners for realtime simulator
  private listeners: Set<(table: string, type: string, payload: any) => void> = new Set();

  subscribe(callback: (table: string, type: string, payload: any) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify(table: string, type: string, payload: any) {
    this.listeners.forEach((listener) => {
      try {
        listener(table, type, payload);
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  // Auth Operations
  getCurrentUser(): Profile {
    return this.currentUser;
  }

  setCurrentUser(userId: string) {
    const prof = this.profiles.find((p) => p.id === userId);
    if (prof) {
      this.currentUser = prof;
      this.notify('auth', 'update', prof);
    }
  }

  // Lead Privacy Filter check
  hasLeadAccess(lead: Lead, userId: string, role: string): boolean {
    if (role === 'head') return true;
    if (lead.created_by === userId) return true;
    if (lead.assigned_users?.includes(userId)) return true;
    return false;
  }

  // Leads CRUD
  getLeads(userId: string, role: string): Lead[] {
    return this.leads.filter((l) => this.hasLeadAccess(l, userId, role));
  }

  getLeadById(id: string, userId: string, role: string): Lead | undefined {
    const lead = this.leads.find((l) => l.id === id);
    if (lead && this.hasLeadAccess(lead, userId, role)) {
      return lead;
    }
    return undefined;
  }

  createLead(leadData: Omit<Lead, 'id' | 'created_by' | 'created_at' | 'updated_at'>, userId: string): Lead {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Math.random().toString(36).substr(2, 9)}`,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_users: Array.from(new Set([userId, ...(leadData.assigned_users || [])]))
    };
    this.leads.unshift(newLead);
    this.persist('leads');
    
    // Auto-create log/update
    this.createLeadUpdate(newLead.id, userId, 'Project was created.');

    // If Head or other users are assigned, send them notification
    const assigned = newLead.assigned_users || [];
    assigned.forEach((uid) => {
      if (uid !== userId) {
        this.createNotification(
          uid,
          'assignment_alert',
          'Assigned to Project',
          `You have been assigned to project: ${newLead.company_name} (${newLead.prospect_name}).`,
          `/leads/${newLead.id}`
        );
      }
    });

    this.notify('leads', 'insert', newLead);
    return newLead;
  }

  updateLead(id: string, leadData: Partial<Lead>, userId: string, role: string): Lead {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    
    const lead = this.leads[idx];
    if (!this.hasLeadAccess(lead, userId, role)) {
      throw new Error('Access Denied');
    }

    const prevAssigned = lead.assigned_users || [];
    const updatedLead: Lead = {
      ...lead,
      ...leadData,
      updated_at: new Date().toISOString(),
    };
    
    // Safety check: Lead creator is always assigned
    if (updatedLead.assigned_users && !updatedLead.assigned_users.includes(updatedLead.created_by)) {
      updatedLead.assigned_users.push(updatedLead.created_by);
    }

    this.leads[idx] = updatedLead;
    this.persist('leads');

    // Detect status changes to write an automatic progress update
    if (leadData.status && leadData.status !== lead.status) {
      this.createLeadUpdate(id, userId, `Status changed from "${lead.status}" to "${leadData.status}".`);
    } else {
      this.createLeadUpdate(id, userId, 'Project details updated.');
    }

    // Notify new assignees
    if (updatedLead.assigned_users) {
      const addedUsers = updatedLead.assigned_users.filter(u => !prevAssigned.includes(u));
      addedUsers.forEach((uid) => {
        if (uid !== userId) {
          this.createNotification(
            uid,
            'assignment_alert',
            'Assigned to Project',
            `You have been assigned to project: ${updatedLead.company_name}.`,
            `/leads/${updatedLead.id}`
          );
        }
      });
    }

    this.notify('leads', 'update', updatedLead);
    return updatedLead;
  }

  deleteLead(id: string, _userId: string, _role: string) {
    const idx = this.leads.findIndex((l) => l.id === id);
    if (idx === -1) throw new Error('Lead not found');
    
    // Allow any user with access to delete a lead for portfolio pruning
    this.leads.splice(idx, 1);
    this.leadUpdates = this.leadUpdates.filter((u) => u.lead_id !== id);
    this.leadAttachments = this.leadAttachments.filter((a) => a.lead_id !== id);
    this.persist('leads');
    this.persist('lead_updates');
    this.persist('lead_attachments');
    
    this.notify('leads', 'delete', { id });
  }

  // Lead Updates & Attachments
  getLeadUpdates(leadId: string): LeadUpdate[] {
    return this.leadUpdates
      .filter((u) => u.lead_id === leadId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createLeadUpdate(leadId: string, userId: string, content: string): LeadUpdate {
    const newUpdate: LeadUpdate = {
      id: `update-${Math.random().toString(36).substr(2, 9)}`,
      lead_id: leadId,
      user_id: userId,
      content,
      created_at: new Date().toISOString()
    };
    this.leadUpdates.push(newUpdate);
    
    // Update parent lead updated_at timestamp
    const lIdx = this.leads.findIndex(l => l.id === leadId);
    if (lIdx !== -1) {
      this.leads[lIdx].updated_at = new Date().toISOString();
      this.persist('leads');
    }
    this.persist('lead_updates');

    // Scan for mentions and send notifications
    this.profiles.forEach((p) => {
      if (p.id !== userId && p.status === 'active' && content.includes(`@${p.full_name}`)) {
        this.createNotification(
          p.id,
          'mention_alert',
          'Mentioned in Lead Update',
          `${this.profiles.find((u) => u.id === userId)?.full_name || 'A teammate'} mentioned you in a lead update.`,
          `/leads/${leadId}`
        );
      }
    });

    this.notify('lead_updates', 'insert', newUpdate);
    return newUpdate;
  }

  getLeadAttachments(leadId: string): LeadAttachment[] {
    return this.leadAttachments.filter((a) => a.lead_id === leadId);
  }

  addLeadAttachment(leadId: string, fileName: string, uploadedBy: string): LeadAttachment {
    const newAttach: LeadAttachment = {
      id: `attach-${Math.random().toString(36).substr(2, 9)}`,
      lead_id: leadId,
      file_name: fileName,
      file_url: '#', // Simulated
      uploaded_by: uploadedBy,
      created_at: new Date().toISOString()
    };
    this.leadAttachments.push(newAttach);
    this.persist('lead_attachments');
    
    this.createLeadUpdate(leadId, uploadedBy, `Attached file: ${fileName}`);
    this.notify('lead_attachments', 'insert', newAttach);
    return newAttach;
  }

  // Tasks CRUD
  getTasks(userId: string, role: string): Task[] {
    if (role === 'head') return this.tasks;
    return this.tasks.filter((t) => t.creator_id === userId || t.assignee_id === userId || t.assignee_ids?.includes(userId) || t.type === 'team');
  }

  createTask(taskData: Omit<Task, 'id' | 'creator_id' | 'created_at'>, userId: string): Task {
    const newTask: Task = {
      ...taskData,
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      creator_id: userId,
      created_at: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    this.persist('tasks');

    // Notify assignees
    const assignees = Array.from(new Set([
      ...(newTask.assignee_id ? [newTask.assignee_id] : []),
      ...(newTask.assignee_ids || [])
    ]));

    assignees.forEach((uid) => {
      if (uid !== userId) {
        this.createNotification(
          uid,
          'assignment_alert',
          'New Task Assigned',
          `${this.profiles.find(p => p.id === userId)?.full_name} assigned you: "${newTask.title}".`,
          '/tasks'
        );
      }
    });

    this.notify('tasks', 'insert', newTask);
    return newTask;
  }

  updateTask(id: string, taskData: Partial<Task>, userId: string, role: string): Task {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    const task = this.tasks[idx];

    // Access check
    if (role !== 'head' && task.creator_id !== userId && task.assignee_id !== userId && !task.assignee_ids?.includes(userId)) {
      throw new Error('Access Denied');
    }

    const updatedTask = {
      ...task,
      ...taskData
    };
    this.tasks[idx] = updatedTask;
    this.persist('tasks');

    // Send notifications for task status updates
    if (taskData.status && taskData.status !== task.status && task.creator_id !== userId) {
      this.createNotification(
        task.creator_id,
        'task_update',
        'Task Progress Update',
        `${this.profiles.find(p => p.id === userId)?.full_name} marked task "${task.title}" as ${taskData.status}.`,
        '/tasks'
      );
    }

    // Auto-create next occurrence on completion
    if (taskData.status === 'done' && task.status !== 'done' && updatedTask.recurrence_type && updatedTask.recurrence_type !== 'none') {
      let nextDeadline: Date | undefined = undefined;
      if (updatedTask.deadline) {
        const dl = new Date(updatedTask.deadline);
        const interval = updatedTask.recurrence_interval || 1;
        if (updatedTask.recurrence_type === 'daily') {
          dl.setDate(dl.getDate() + interval);
        } else if (updatedTask.recurrence_type === 'weekly') {
          dl.setDate(dl.getDate() + 7 * interval);
        } else if (updatedTask.recurrence_type === 'monthly') {
          dl.setMonth(dl.getMonth() + interval);
        }
        nextDeadline = dl;
      }

      const shouldRecreate = !updatedTask.recurrence_end_date || 
        !nextDeadline || 
        nextDeadline.getTime() <= new Date(updatedTask.recurrence_end_date).getTime();

      if (shouldRecreate) {
        const nextTask: Task = {
          id: `task-${Math.random().toString(36).substr(2, 9)}`,
          title: updatedTask.title,
          description: updatedTask.description,
          assignee_id: updatedTask.assignee_id,
          assignee_ids: updatedTask.assignee_ids,
          creator_id: updatedTask.creator_id,
          priority: updatedTask.priority,
          deadline: nextDeadline ? nextDeadline.toISOString() : undefined,
          reminder_offsets: updatedTask.reminder_offsets,
          status: 'todo',
          type: updatedTask.type,
          attachments: updatedTask.attachments,
          recurrence_type: updatedTask.recurrence_type,
          recurrence_interval: updatedTask.recurrence_interval,
          recurrence_end_date: updatedTask.recurrence_end_date,
          parent_task_id: updatedTask.parent_task_id || updatedTask.id,
          created_at: new Date().toISOString()
        };
        this.tasks.unshift(nextTask);
        this.persist('tasks');
        this.notify('tasks', 'insert', nextTask);
      }
    }

    this.notify('tasks', 'update', updatedTask);
    return updatedTask;
  }

  deleteTask(id: string, _userId: string, _role: string) {
    const idx = this.tasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    // Allow any user with access to delete a task
    this.tasks.splice(idx, 1);
    this.persist('tasks');
    this.notify('tasks', 'delete', { id });
  }

  // Reminders CRUD
  getReminders(userId: string, role: string): Reminder[] {
    if (role === 'head') return this.reminders;
    return this.reminders.filter((r) => r.creator_id === userId || r.invited_users?.includes(userId));
  }

  createReminder(reminderData: Omit<Reminder, 'id' | 'creator_id' | 'status' | 'created_at'>, userId: string): Reminder {
    const newRem: Reminder = {
      notification_type: 'notification',
      ...reminderData,
      id: `rem-${Math.random().toString(36).substr(2, 9)}`,
      creator_id: userId,
      status: 'active',
      created_at: new Date().toISOString()
    };
    this.reminders.unshift(newRem);
    this.persist('reminders');

    // Notify invited users
    if (newRem.invited_users) {
      newRem.invited_users.forEach((uid) => {
        if (uid !== userId) {
          this.createNotification(
            uid,
            'reminder_alert',
            'Reminder Invitation',
            `${this.profiles.find(p => p.id === userId)?.full_name} invited you to reminder: "${newRem.title}".`,
            '/reminders'
          );
        }
      });
    }

    this.notify('reminders', 'insert', newRem);
    return newRem;
  }

  updateReminder(id: string, reminderData: Partial<Reminder>): Reminder {
    const idx = this.reminders.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Reminder not found');
    const reminder = this.reminders[idx];

    const updatedRem = {
      ...reminder,
      ...reminderData
    };
    this.reminders[idx] = updatedRem;
    this.persist('reminders');
    this.notify('reminders', 'update', updatedRem);
    return updatedRem;
  }

  // Slack-style Messaging CRUD
  getChannels(userId: string, role: string): Channel[] {
    const user = this.profiles.find(p => p.id === userId);
    const isPrivileged = role === 'head' || role === 'client' || (user?.designation?.toLowerCase().includes('ceo') ?? false);
    if (isPrivileged) return this.channels;
    return this.channels.filter((c) => !c.is_private || c.member_ids?.includes(userId));
  }

  createChannel(name: string, description: string, isPrivate: boolean, userId: string): Channel {
    const newChan: Channel = {
      id: `chan-${Math.random().toString(36).substr(2, 9)}`,
      name: name.toLowerCase().replace(/\s+/g, '-'),
      description,
      is_private: isPrivate,
      created_by: userId,
      created_at: new Date().toISOString(),
      member_ids: [userId]
    };
    this.channels.push(newChan);
    this.persist('channels');
    this.notify('channels', 'insert', newChan);
    return newChan;
  }

  getMessages(channelId?: string, receiverId?: string, userId?: string): Message[] {
    let filteredMsgs: Message[] = [];
    if (channelId) {
      filteredMsgs = this.messages.filter((m) => m.channel_id === channelId);
    } else if (receiverId && userId) {
      filteredMsgs = this.messages.filter((m) => !m.channel_id && (
        (m.sender_id === userId && m.receiver_id === receiverId) ||
        (m.sender_id === receiverId && m.receiver_id === userId)
      ));
    } else {
      return [];
    }
    const sorted = [...filteredMsgs].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return sorted.map(msg => ({
      ...msg,
      message_read_receipts: this.readReceipts.filter(r => r.message_id === msg.id)
    }));
  }

  getAllMessages(userId: string): Message[] {
    const userChanIds = this.channels
      .filter((c) => !c.is_private || c.member_ids?.includes(userId))
      .map((c) => c.id);
    return this.messages.filter((m) => 
      (m.channel_id && userChanIds.includes(m.channel_id)) ||
      (!m.channel_id && (m.sender_id === userId || m.receiver_id === userId))
    );
  }

  sendMessage(channelId?: string, receiverId?: string, content?: string, attachments?: { name: string; url: string }[], senderId?: string): Message {
    if (!senderId) throw new Error('Sender ID required');
    const newMsg: Message = {
      id: `msg-${Math.random().toString(36).substr(2, 9)}`,
      channel_id: channelId,
      sender_id: senderId,
      receiver_id: receiverId,
      content: content || '',
      attachments: attachments || [],
      created_at: new Date().toISOString()
    };
    this.messages.push(newMsg);
    this.persist('messages');

    // Send notifications for DMs
    if (receiverId && receiverId !== senderId) {
      this.createNotification(
        receiverId,
        'message_alert',
        `New message from ${this.profiles.find(p => p.id === senderId)?.full_name}`,
        content || 'Shared an attachment.',
        `/messaging?dm=${senderId}`
      );
    }
    // Send notifications for mentions in Channels
    else if (channelId) {
      const chan = this.channels.find(c => c.id === channelId);
      if (chan) {
        // Simple mention parsing
        const members = chan.member_ids || [];
        members.forEach((mid) => {
          if (mid !== senderId) {
            const profile = this.profiles.find(p => p.id === mid);
            if (profile && content && content.includes(`@${profile.full_name}`)) {
              this.createNotification(
                mid,
                'mention_alert',
                `Mentioned in #${chan.name}`,
                `${this.profiles.find(p => p.id === senderId)?.full_name} mentioned you in #${chan.name}.`,
                `/messaging?channel=${chan.id}`
              );
            }
          }
        });
      }
    }

    this.notify('messages', 'insert', newMsg);
    return newMsg;
  }

  // Notifications CRUD
  getNotifications(userId: string): Notification[] {
    return this.notifications
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  createNotification(userId: string, type: Notification['type'], title: string, body: string, link?: string): Notification {
    const newNotif: Notification = {
      id: `notif-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type,
      title,
      body,
      link,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.notifications.unshift(newNotif);
    this.persist('notifications');
    this.notify('notifications', 'insert', newNotif);
    return newNotif;
  }

  markNotificationAsRead(id: string) {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx !== -1) {
      this.notifications[idx].is_read = true;
      this.persist('notifications');
      this.notify('notifications', 'update', this.notifications[idx]);
    }
  }

  markAllNotificationsAsRead(userId: string) {
    this.notifications.forEach((n) => {
      if (n.user_id === userId) {
        n.is_read = true;
      }
    });
    this.persist('notifications');
    this.notify('notifications', 'update_all', { userId });
  }

  // Profile Updates Mock
  updateProfile(id: string, updates: Partial<Profile>): Profile {
    const idx = this.profiles.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Profile not found');
    const updated = { ...this.profiles[idx], ...updates, updated_at: new Date().toISOString() };
    this.profiles[idx] = updated;
    if (this.currentUser.id === id) {
      this.currentUser = updated;
    }
    this.persist('profiles');
    this.notify('profiles', 'update', updated);
    this.notify('auth', 'update', updated);
    return updated;
  }

  createProfile(profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>): Profile {
    const newProfile: Profile = {
      ...profileData,
      id: `custom-${Math.random().toString(36).substr(2, 9)}`,
      status: profileData.status || 'active',
      presence: profileData.presence || 'online',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.profiles.push(newProfile);
    this.persist('profiles');
    this.notify('profiles', 'insert', newProfile);
    return newProfile;
  }

  hardDeleteProfile(id: string) {
    this.profiles = this.profiles.filter((p) => p.id !== id);
    this.persist('profiles');
    try {
      const deletedRaw = localStorage.getItem('wc2_deleted_profiles');
      const deletedIds = deletedRaw ? JSON.parse(deletedRaw) : [];
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem('wc2_deleted_profiles', JSON.stringify(deletedIds));
      }
    } catch (e) {
      console.error(e);
    }
    
    // Clean up references
    this.leads = this.leads.map((l) => ({
      ...l,
      assigned_users: l.assigned_users?.filter((uid) => uid !== id) || []
    }));
    this.persist('leads');
    
    this.tasks = this.tasks.filter((t) => t.assignee_id !== id && t.creator_id !== id);
    this.persist('tasks');
    
    this.reminders = this.reminders.filter((r) => r.creator_id !== id);
    this.persist('reminders');
    
    this.messages = this.messages.filter((m) => m.sender_id !== id && m.receiver_id !== id);
    this.persist('messages');
    
    this.channels = this.channels.map((c) => ({
      ...c,
      member_ids: c.member_ids?.filter((uid) => uid !== id) || []
    }));
    this.persist('channels');
    
    this.notify('profiles', 'delete', { id });
    this.notify('auth', 'delete', { id });
  }

  // Personal Notes CRUD
  getPersonalNotes(userId: string): PersonalNote[] {
    return this.personalNotes.filter((n) => n.creator_id === userId);
  }

  createPersonalNote(noteData: Omit<PersonalNote, 'id' | 'creator_id' | 'created_at' | 'updated_at'>, userId: string): PersonalNote {
    const newNote: PersonalNote = {
      ...noteData,
      id: `note-${Math.random().toString(36).substr(2, 9)}`,
      creator_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.personalNotes.unshift(newNote);
    this.persist('personal_notes');
    this.notify('personal_notes', 'insert', newNote);
    return newNote;
  }

  updatePersonalNote(id: string, noteData: Partial<PersonalNote>): PersonalNote {
    const idx = this.personalNotes.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    const updated = {
      ...this.personalNotes[idx],
      ...noteData,
      updated_at: new Date().toISOString()
    };
    this.personalNotes[idx] = updated;
    this.persist('personal_notes');
    this.notify('personal_notes', 'update', updated);
    return updated;
  }

  deletePersonalNote(id: string) {
    const idx = this.personalNotes.findIndex((n) => n.id === id);
    if (idx === -1) throw new Error('Note not found');
    this.personalNotes.splice(idx, 1);
    this.persist('personal_notes');
    this.notify('personal_notes', 'delete', { id });
  }

  toggleMessageReaction(messageId: string, emoji: string, userId: string): Message {
    const idx = this.messages.findIndex(m => m.id === messageId);
    if (idx === -1) throw new Error('Message not found');
    const msg = this.messages[idx];
    const reactions = msg.reactions ? [...msg.reactions] : [];
    
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing) {
      if (existing.user_ids.includes(userId)) {
        existing.user_ids = existing.user_ids.filter(id => id !== userId);
      } else {
        existing.user_ids.push(userId);
      }
    } else {
      reactions.push({ emoji, user_ids: [userId] });
    }
    
    const cleanedReactions = reactions.filter(r => r.user_ids.length > 0);
    
    const updatedMsg = { ...msg, reactions: cleanedReactions };
    this.messages[idx] = updatedMsg;
    this.persist('messages');
    this.notify('messages', 'update', updatedMsg);
    return updatedMsg;
  }

  toggleLeadUpdateReaction(updateId: string, emoji: string, userId: string): LeadUpdate {
    const idx = this.leadUpdates.findIndex(u => u.id === updateId);
    if (idx === -1) throw new Error('Lead update not found');
    const upd = this.leadUpdates[idx];
    const reactions = upd.reactions ? [...upd.reactions] : [];
    
    const existing = reactions.find(r => r.emoji === emoji);
    if (existing) {
      if (existing.user_ids.includes(userId)) {
        existing.user_ids = existing.user_ids.filter(id => id !== userId);
      } else {
        existing.user_ids.push(userId);
      }
    } else {
      reactions.push({ emoji, user_ids: [userId] });
    }
    
    const cleanedReactions = reactions.filter(r => r.user_ids.length > 0);
    
    const updatedUpd = { ...upd, reactions: cleanedReactions };
    this.leadUpdates[idx] = updatedUpd;
    this.persist('lead_updates');
    this.notify('lead_updates', 'update', updatedUpd);
    return updatedUpd;
  }

  markMessagesAsRead(channelId?: string, receiverId?: string, currentUserId?: string) {
    if (!currentUserId) return;
    let msgs: Message[] = [];
    if (channelId) {
      msgs = this.messages.filter(m => m.channel_id === channelId && m.sender_id !== currentUserId);
    } else if (receiverId) {
      msgs = this.messages.filter(m => !m.channel_id && m.sender_id === receiverId && m.receiver_id === currentUserId);
    }
    let newlyAdded = false;
    msgs.forEach(m => {
      const exists = this.readReceipts.some(r => r.message_id === m.id && r.user_id === currentUserId);
      if (!exists) {
        this.readReceipts.push({
          message_id: m.id,
          user_id: currentUserId,
          read_at: new Date().toISOString()
        });
        newlyAdded = true;
      }
    });
    if (newlyAdded) {
      this.persist('read_receipts');
      this.notify('read_receipts', 'insert', { channelId, receiverId });
    }
  }

  // --- IXR & EdTech Creative Operations Methods ---

  getProjectClasses(): ProjectClass[] {
    return [...this.projectClasses];
  }

  getProjectClassById(id: string): ProjectClass | undefined {
    return this.projectClasses.find(p => p.id === id);
  }

  createProjectClass(data: Omit<ProjectClass, 'id' | 'created_at' | 'updated_at'>): ProjectClass {
    const newClass: ProjectClass = {
      ...data,
      id: `class-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.projectClasses.unshift(newClass);
    this.persist('project_classes');
    this.notify('project_classes', 'insert', newClass);
    return newClass;
  }

  updateProjectClass(id: string, updates: Partial<ProjectClass>): ProjectClass {
    const idx = this.projectClasses.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Class/Project not found');
    const updated = {
      ...this.projectClasses[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.projectClasses[idx] = updated;
    this.persist('project_classes');
    this.notify('project_classes', 'update', updated);
    return updated;
  }

  getWorkItems(projectId?: string): WorkItem[] {
    if (projectId && projectId !== 'all') {
      return this.workItems.filter(item => item.project_id === projectId);
    }
    return [...this.workItems];
  }

  getWorkItemById(id: string): WorkItem | undefined {
    return this.workItems.find(item => item.id === id);
  }

  createWorkItem(data: Omit<WorkItem, 'id' | 'created_at' | 'updated_at' | 'latest_version_number'>, userId: string): WorkItem {
    const newItem: WorkItem = {
      ...data,
      id: `item-${Math.random().toString(36).substr(2, 9)}`,
      latest_version_number: 1,
      versions: [
        {
          id: `ver-${Math.random().toString(36).substr(2, 9)}`,
          work_item_id: '',
          version_number: 1,
          notes: 'Initial work item created.',
          uploaded_by: userId,
          created_at: new Date().toISOString()
        }
      ],
      remarks: [],
      handovers: [],
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    newItem.versions![0].work_item_id = newItem.id;
    this.workItems.unshift(newItem);
    this.persist('work_items');
    this.notify('work_items', 'insert', newItem);

    // Notify assignees
    newItem.assignee_ids.forEach(uid => {
      if (uid !== userId) {
        this.createNotification(
          uid,
          'assignment_alert',
          'Assigned to IXR Asset',
          `You have been assigned to ${newItem.title} (${newItem.asset_type.toUpperCase()}).`,
          `/items/${newItem.id}`
        );
      }
    });

    return newItem;
  }

  updateWorkItem(id: string, updates: Partial<WorkItem>, userId: string): WorkItem {
    const idx = this.workItems.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Work item not found');
    const current = this.workItems[idx];
    const prevAssignees = current.assignee_ids || [];

    const updated: WorkItem = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.workItems[idx] = updated;
    this.persist('work_items');
    this.notify('work_items', 'update', updated);

    // If new assignees were added
    if (updates.assignee_ids) {
      const added = updates.assignee_ids.filter(u => !prevAssignees.includes(u));
      added.forEach(uid => {
        if (uid !== userId) {
          this.createNotification(
            uid,
            'assignment_alert',
            'Assigned to IXR Asset',
            `You have been assigned to ${updated.title}`,
            `/items/${updated.id}`
          );
        }
      });
    }

    return updated;
  }

  deleteWorkItem(id: string): void {
    const idx = this.workItems.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Work item not found');
    this.workItems.splice(idx, 1);
    this.persist('work_items');
    this.notify('work_items', 'delete', { id });
  }

  // Multi-tier review remark operations (Frame.io style)
  addReviewRemark(
    itemId: string,
    remarkData: Omit<ReviewRemark, 'id' | 'created_at' | 'work_item_id'>
  ): ReviewRemark {
    const idx = this.workItems.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Work item not found');

    const newRemark: ReviewRemark = {
      ...remarkData,
      id: `rem-${Math.random().toString(36).substr(2, 9)}`,
      work_item_id: itemId,
      created_at: new Date().toISOString()
    };

    const item = this.workItems[idx];
    const remarks = item.remarks ? [...item.remarks] : [];
    remarks.push(newRemark);
    item.remarks = remarks;
    item.updated_at = new Date().toISOString();
    this.persist('work_items');
    this.notify('work_items', 'update', item);

    // Notify item assignees about review feedback
    item.assignee_ids.forEach(uid => {
      if (uid !== remarkData.author_id) {
        this.createNotification(
          uid,
          'task_update',
          `New ${remarkData.review_stage} Review Remark`,
          `[${remarkData.severity.toUpperCase()}] ${remarkData.remark_text.slice(0, 70)}...`,
          `/items/${itemId}`
        );
      }
    });

    return newRemark;
  }

  updateRemarkStatus(
    itemId: string,
    remarkId: string,
    status: ReviewRemark['status'],
    userId: string,
    versionNumber?: number
  ): ReviewRemark {
    const idx = this.workItems.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Work item not found');

    const item = this.workItems[idx];
    const rIdx = (item.remarks || []).findIndex(r => r.id === remarkId);
    if (rIdx === -1) throw new Error('Remark not found');

    item.remarks![rIdx].status = status;
    if (status === 'resolved') {
      item.remarks![rIdx].resolved_by = userId;
      if (versionNumber) {
        item.remarks![rIdx].resolved_in_version = versionNumber;
      }
    }
    item.updated_at = new Date().toISOString();
    this.persist('work_items');
    this.notify('work_items', 'update', item);
    return item.remarks![rIdx];
  }

  // Upload new version (v2, v3...)
  uploadAssetVersion(
    itemId: string,
    versionData: Omit<AssetVersion, 'id' | 'created_at' | 'work_item_id' | 'version_number'>
  ): AssetVersion {
    const idx = this.workItems.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Work item not found');

    const item = this.workItems[idx];
    const nextVerNum = (item.latest_version_number || 1) + 1;

    const newVer: AssetVersion = {
      ...versionData,
      id: `ver-${Math.random().toString(36).substr(2, 9)}`,
      work_item_id: itemId,
      version_number: nextVerNum,
      created_at: new Date().toISOString()
    };

    item.versions = [...(item.versions || []), newVer];
    item.latest_version_number = nextVerNum;
    item.status = 'review_in_progress';
    item.updated_at = new Date().toISOString();

    this.persist('work_items');
    this.notify('work_items', 'update', item);

    // Notify reviewers
    (item.reviewer_ids || []).forEach(uid => {
      this.createNotification(
        uid,
        'task_update',
        `Version v${nextVerNum} Uploaded`,
        `${item.title} has a new draft ready for review.`,
        `/items/${itemId}`
      );
    });

    return newVer;
  }

  // 1-Click Role Handoff Logger
  executeRoleHandoff(
    itemId: string,
    fromUserId: string,
    toUserId: string,
    briefingNotes: string,
    reason: string
  ): HandoverLog {
    const idx = this.workItems.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Work item not found');

    const item = this.workItems[idx];
    const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;

    const handover: HandoverLog = {
      id: `ho-${Math.random().toString(36).substr(2, 9)}`,
      work_item_id: itemId,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      reason,
      briefing_notes: briefingNotes,
      current_version: item.latest_version_number,
      pending_remarks_count: openRemarks,
      created_at: new Date().toISOString()
    };

    item.handovers = [handover, ...(item.handovers || [])];
    
    // Update assignees
    const currentAssignees = item.assignee_ids.filter(id => id !== fromUserId);
    if (!currentAssignees.includes(toUserId)) {
      currentAssignees.push(toUserId);
    }
    item.assignee_ids = currentAssignees;
    item.updated_at = new Date().toISOString();

    this.persist('work_items');
    this.notify('work_items', 'update', item);

    // Notify incoming teammate
    this.createNotification(
      toUserId,
      'assignment_alert',
      '🤝 Handover: You received an asset',
      `Briefing: ${briefingNotes.slice(0, 80)}... (${openRemarks} pending remarks)`,
      `/items/${itemId}`
    );

    return handover;
  }

  // Chapter Management
  getChapters(projectId?: string): Chapter[] {
    if (projectId && projectId !== 'all') {
      return this.chapters.filter(c => c.project_id === projectId);
    }
    return [...this.chapters];
  }

  createChapter(chapterData: Omit<Chapter, 'id' | 'created_at' | 'updated_at'>): Chapter {
    const newChap: Chapter = {
      ...chapterData,
      id: `chap-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.chapters.push(newChap);
    this.persist('chapters');
    this.notify('chapters', 'insert', newChap);
    return newChap;
  }

  // Client Direct & Confidential Communications
  getClientCommunications(projectId?: string): ClientCommunication[] {
    if (projectId && projectId !== 'all') {
      return this.clientCommunications.filter(c => c.project_id === projectId);
    }
    return [...this.clientCommunications];
  }

  createClientCommunication(data: Omit<ClientCommunication, 'id' | 'created_at' | 'updated_at' | 'status'>): ClientCommunication {
    const newComm: ClientCommunication = {
      ...data,
      id: `comm-${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.clientCommunications.unshift(newComm);
    this.persist('client_communications');
    this.notify('client_communications', 'insert', newComm);

    // Notify Head of IXR and CEO
    this.profiles
      .filter(p => p.role === 'head' || p.designation?.toLowerCase().includes('ceo'))
      .forEach(lead => {
        this.createNotification(
          lead.id,
          'task_update',
          `🔒 Client Direct Note: ${data.title}`,
          data.message.slice(0, 80) + '...',
          '/client-hub'
        );
      });

    return newComm;
  }

  actionClientCommunication(commId: string, actionNotes: string): ClientCommunication {
    const idx = this.clientCommunications.findIndex(c => c.id === commId);
    if (idx === -1) throw new Error('Communication not found');

    this.clientCommunications[idx].status = 'actioned';
    this.clientCommunications[idx].action_notes = actionNotes;
    this.clientCommunications[idx].updated_at = new Date().toISOString();
    this.persist('client_communications');
    this.notify('client_communications', 'update', this.clientCommunications[idx]);
    return this.clientCommunications[idx];
  }

  // Discreet Reassignment (Client directive executed smoothly by Head of IXR)
  discreetReassign(
    itemId: string,
    newAssigneeId: string,
    sanitizedBriefing: string,
    commId?: string
  ): { workItem: WorkItem; handover: HandoverLog } {
    const idx = this.workItems.findIndex(i => i.id === itemId);
    if (idx === -1) throw new Error('Work item not found');

    const item = this.workItems[idx];
    const prevAssigneeId = item.assignee_ids[0] || 'unknown';

    // Log to turnover ledger with sanitized briefing
    const handover: HandoverLog = {
      id: `ho-${Math.random().toString(36).substr(2, 9)}`,
      work_item_id: itemId,
      from_user_id: prevAssigneeId,
      to_user_id: newAssigneeId,
      reason: 'Capacity balancing & executive directive',
      briefing_notes: sanitizedBriefing,
      current_version: item.latest_version_number,
      pending_remarks_count: (item.remarks || []).filter(r => r.status === 'open').length,
      created_at: new Date().toISOString()
    };

    item.handovers = [handover, ...(item.handovers || [])];
    item.assignee_ids = [newAssigneeId];
    item.updated_at = new Date().toISOString();

    this.persist('work_items');
    this.notify('work_items', 'update', item);

    // If linked to a client communication, mark it actioned
    if (commId) {
      const newAssigneeProfile = this.profiles.find(p => p.id === newAssigneeId);
      this.actionClientCommunication(
        commId,
        `Discreetly reassigned to ${newAssigneeProfile?.full_name || newAssigneeId}. Briefing provided: "${sanitizedBriefing}"`
      );
    }

    // Notify incoming teammate with clean message
    this.createNotification(
      newAssigneeId,
      'assignment_alert',
      '🤝 Direct Assignment: You received an asset',
      `Briefing: ${sanitizedBriefing.slice(0, 80)}...`,
      `/items/${itemId}`
    );

    return { workItem: item, handover };
  }
}

export const mockDb = new MemoryDB();
