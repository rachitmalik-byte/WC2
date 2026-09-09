import React, { useState } from 'react';
import type { UserRole, Profile } from '../../types/database';
import { dbClient } from '../../services/dbClient';
import {
  Shield, CheckCircle2, Sparkles, Video, Mic,
  BookOpen, CheckSquare, Layers, ArrowRight, Zap,
  Lock, ChevronDown, ChevronUp, UserPlus, SlidersHorizontal
} from 'lucide-react';

interface AuthPageProps {
  onBypass: (userId?: string) => void;
  onSuccess?: () => void;
}

interface TestSubject {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: 'Leadership' | 'Client' | 'Reviewers' | 'Creators';
  presence: 'online' | 'idle' | 'busy';
  color: string;
  icon: any;
  powers: string[];
}

const TEST_SUBJECTS: TestSubject[] = [
  {
    id: 'client-rep-1',
    name: 'Dr. Alistair Vance',
    email: 'alistair.vance@curriculumcorp.org',
    role: 'client',
    designation: 'Client Project Director (Approvals & Directives)',
    department: 'Client',
    presence: 'online',
    color: 'from-emerald-600/20 to-teal-600/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40',
    icon: Shield,
    powers: [
      '🔒 Confidential Direct Channel: Send private directives directly to Head of IXR & CEO',
      '👥 Reassignment Directives: Request team member swaps with 1-click discreet leadership action',
      '🎯 Curriculum Milestone Clearance: Final client approval gate before LMS deployment',
      '💬 Private Remarks: Post confidential feedback hidden from general editors and testers'
    ]
  },
  {
    id: 'head-1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@relayhq.com',
    role: 'head',
    designation: 'Head of IXR & Production',
    department: 'Leadership',
    presence: 'online',
    color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
    icon: Layers,
    powers: [
      '🎬 Oversee All Classes & Chapters (Optics, Electricity, Chemistry)',
      '🔒 Confidential Client Hub: Review direct client requests & perform discreet reassignments',
      '⚡ Toggle Parallel Review Mode (Permit L4 review before L1 completion)',
      '📝 Approve L1–L4 review tiers & deliver assets'
    ]
  },
  {
    id: 'ceo-1',
    name: 'Ashish Garg',
    email: 'ashish.garg@vaidikedu.com',
    role: 'head',
    designation: 'Chief Executive Officer',
    department: 'Leadership',
    presence: 'online',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30',
    icon: Shield,
    powers: [
      '👑 Executive Organization Oversight & Master Controls',
      '🔒 Direct Client Escalation Oversight & Commercial SLA controls',
      '🔓 Final Signoff (Approved Final) & Gate Override',
      '📊 Cross-Class Velocity & Pipeline Health Analytics'
    ]
  },
  {
    id: 'hb-rev-1',
    name: 'Arjab Jain',
    email: 'arjab.jain@vaidikedu.com',
    role: 'hb_reviewer',
    designation: 'Lead Handbook (HB) & Pedagogy Reviewer',
    department: 'Reviewers',
    presence: 'online',
    color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30',
    icon: BookOpen,
    powers: [
      '📖 Handbook Syllabus & Curriculum Accuracy Verification',
      '🚩 Log Critical Blocker Remarks linked to formula/slide targets',
      '⚡ Work in Parallel Review Mode while L1 tech checks run',
      '🔄 Sign off L2/L3 Pedagogy stage to unblock delivery'
    ]
  },
  {
    id: 'vid-rev-1',
    name: 'Rachit Malik',
    email: 'rachit.malik@vaidikedu.com',
    role: 'video_reviewer',
    designation: 'Technical Video Reviewer (L1/L2 Lead)',
    department: 'Reviewers',
    presence: 'online',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    icon: Video,
    powers: [
      '🔍 Frame-by-Frame Technical QC (audio sync, cuts, aspect ratios)',
      '⏱️ Drop exact MM:SS video timeline review markers',
      '🚦 Advance review pipeline from L1 to L2',
      '❌ Request draft corrections from video editors'
    ]
  },
  {
    id: 'video-ed-1',
    name: 'Alex Rivera',
    email: 'alex.r@relayhq.com',
    role: 'video_editor',
    designation: 'Lead Video Editor (3D & Motion)',
    department: 'Creators',
    presence: 'online',
    color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
    icon: Video,
    powers: [
      '🎥 Access assigned video queue & script briefs',
      '📤 Upload new asset revision drafts (v1 → v2 → v3)',
      '✅ Resolve remarks with revision audit comments',
      '🤝 1-Click Role Handover when rebalancing workload or taking leave'
    ]
  },
  {
    id: 'audio-gen-1',
    name: 'Elena Rostova',
    email: 'elena.r@relayhq.com',
    role: 'audio_generator',
    designation: 'Audio Generator & Voiceover Artist',
    department: 'Creators',
    presence: 'idle',
    color: 'from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/30',
    icon: Mic,
    powers: [
      '🎙️ AI/Human voiceover generation & waveform sync',
      '🎧 Sound level & pronunciation remark inspection',
      '📤 Upload revision audio tracks and stems',
      '✅ Close audio QC remarks'
    ]
  },
  {
    id: 'quiz-imp-1',
    name: 'Marcus Chen',
    email: 'marcus.c@relayhq.com',
    role: 'quiz_implementer',
    designation: 'Quiz Implementer & Interactive Dev',
    department: 'Creators',
    presence: 'busy',
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
    icon: CheckSquare,
    powers: [
      '🧩 Interactive exercise coding & LMS SCORM packaging',
      '🎯 Math formula parsing & option layout fixes',
      '📤 Submit updated quiz builds for reviewer check',
      '✅ Resolve interactive logic remarks'
    ]
  },
  {
    id: 'quiz-gen-1',
    name: 'Jane Doe',
    email: 'jane.d@relayhq.com',
    role: 'quiz_generator',
    designation: 'Subject SME & Quiz Generator',
    department: 'Creators',
    presence: 'online',
    color: 'from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30',
    icon: BookOpen,
    powers: [
      '📚 Curriculum question authoring & difficulty balancing',
      '✏️ Formulate new quiz items and practice assessments',
      '💬 Add pedagogical guidance notes for video & HB teams',
      '🤝 Role handoffs to quiz implementers'
    ]
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({ onBypass }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('head-1');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Leadership' | 'Client' | 'Reviewers' | 'Creators'>('All');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Custom persona creation state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('video_editor');
  const [customDesignation, setCustomDesignation] = useState('');

  // Future production auth explanation accordion
  const [showRealAuthInfo, setShowRealAuthInfo] = useState(false);

  const selectedSubject = TEST_SUBJECTS.find(s => s.id === selectedSubjectId) || TEST_SUBJECTS[0];

  const handleInstantLogin = (subjectId?: string) => {
    setIsLoggingIn(true);
    const targetId = subjectId || selectedSubjectId;
    setTimeout(() => {
      onBypass(targetId);
    }, 200);
  };

  const handleCreateCustomPersona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setIsLoggingIn(true);

    try {
      const newProfile: Omit<Profile, 'id' | 'created_at' | 'updated_at'> = {
        full_name: customName.trim(),
        email: `${customName.toLowerCase().replace(/\s+/g, '.')}@trial.local`,
        role: customRole,
        designation: customDesignation.trim() || `Custom ${customRole.replace(/_/g, ' ')}`,
        status: 'active',
        presence: 'online'
      };

      const created = await dbClient.createProfile(newProfile);
      onBypass(created.id);
    } catch (err) {
      console.error(err);
      setIsLoggingIn(false);
    }
  };

  const filteredSubjects = TEST_SUBJECTS.filter(s => {
    if (activeFilter === 'All') return true;
    return s.department === activeFilter;
  });

  return (
    <div className="min-h-screen w-full bg-background text-foreground flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 selection:bg-primary/20">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-6xl z-10 flex flex-col items-center space-y-6 flex-1 justify-center">
        
        {/* Top Header Card */}
        <div className="w-full text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold tracking-wide shadow-sm">
            <Zap className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>WC 2.0 • TEST FLIGHT SIMULATOR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping" />
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            IXR & Content Operations Cockpit
          </h1>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Authentication is pre-bypassed for rapid trial testing. Choose any test subject below to simulate their exact workflow powers, review tier authority, and handover capabilities.
          </p>

          {/* Instant Default Quick Login Callout */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => handleInstantLogin('head-1')}
              disabled={isLoggingIn}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-lg shadow-primary/20 transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="h-4 w-4" />
              <span>Instant 1-Click Login (Sarah Jenkins • Head of IXR)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setShowCustomModal(true)}
              className="px-4 py-2.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="h-4 w-4 text-primary" />
              <span>Add Custom Tester Persona</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Role Filter:</span>
          </span>
          {(['All', 'Client', 'Leadership', 'Reviewers', 'Creators'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === filter
                  ? 'bg-foreground text-background shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Test Personas Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {filteredSubjects.map((subject) => {
            const isSelected = subject.id === selectedSubjectId;
            const Icon = subject.icon;

            return (
              <div
                key={subject.id}
                onClick={() => setSelectedSubjectId(subject.id)}
                className={`relative rounded-xl border p-4 transition-all text-left flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md transform -translate-y-0.5'
                    : 'bg-card/70 hover:bg-card border-border hover:border-primary/40 shadow-sm'
                }`}
              >
                {/* Active selection tick */}
                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                )}

                {/* Profile Header */}
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="relative">
                      <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${subject.color} flex items-center justify-center font-bold text-sm border shadow-inner`}>
                        {subject.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
                          subject.presence === 'online' ? 'bg-emerald-500' :
                          subject.presence === 'busy' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        title={`Status: ${subject.presence}`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">
                        {subject.designation}
                      </p>
                    </div>
                  </div>

                  {/* Role & Department Badge */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground uppercase tracking-wider">
                      {subject.department}
                    </span>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      <Icon className="h-2.5 w-2.5" />
                      <span>{subject.role.replace(/_/g, ' ')}</span>
                    </span>
                  </div>

                  {/* Testing Powers list */}
                  <div className="space-y-1.5 my-2">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="h-2.5 w-2.5 text-primary" />
                      <span>Role Powers in Trial:</span>
                    </p>
                    <ul className="space-y-1 text-[11px] text-foreground/90 font-medium">
                      {subject.powers.slice(0, 3).map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-tight">
                          <span className="text-primary text-xs mt-0.5 flex-shrink-0">•</span>
                          <span className="truncate">{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Login Button */}
                <div className="mt-4 pt-3 border-t border-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstantLogin(subject.id);
                    }}
                    disabled={isLoggingIn}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm'
                        : 'bg-muted hover:bg-primary/15 text-foreground hover:text-primary'
                    }`}
                  >
                    <span>Login as {subject.name.split(' ')[0]}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Persona Power Spotlight */}
        <div className="w-full bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${selectedSubject.color} flex items-center justify-center font-bold text-base border shadow-inner flex-shrink-0`}>
              <selectedSubject.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm font-bold text-foreground">
                  Active Test Subject: {selectedSubject.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {selectedSubject.designation}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Will enter WC 2.0 with <span className="text-foreground font-semibold">{selectedSubject.role}</span> pipeline access and testing capabilities.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleInstantLogin(selectedSubject.id)}
            disabled={isLoggingIn}
            className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Enter WC 2.0 as {selectedSubject.name}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Collapsible: Future Real Supabase Auth Accordion */}
        <div className="w-full max-w-3xl border border-border/60 bg-muted/20 rounded-xl overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setShowRealAuthInfo(!showRealAuthInfo)}
            className="w-full px-4 py-2.5 flex items-center justify-between text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Production Supabase Authentication (Disabled During Pilot Trial)</span>
            </div>
            {showRealAuthInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showRealAuthInfo && (
            <div className="px-4 pb-4 pt-1 text-xs text-muted-foreground border-t border-border/40 space-y-2 text-left bg-card/50">
              <p>
                <strong>Need real email/password or Google corporate SSO later?</strong>
              </p>
              <p>
                As requested, the production login window has been bypassed with this instant test-subject selector so your team can test the IXR workflow without database configuration.
              </p>
              <p>
                When your pilot succeeds and you want to lock the system down:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                <li>Create your database project in Supabase.</li>
                <li>Run the provided <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">schema_wc2.sql</code> script.</li>
                <li>Set your <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">VITE_SUPABASE_URL</code> and <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">VITE_SUPABASE_ANON_KEY</code> in <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">.env</code>.</li>
              </ol>
              <p className="text-[11px] text-primary font-semibold">
                See <code className="underline">SETUP_SUPABASE.md</code> for full details.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-[11px] text-muted-foreground/80 z-10">
        <span>WC 2.0 • IXR & Creative Operations Operating System • Offline Trial Sandbox</span>
      </footer>

      {/* Custom Test Persona Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-left space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Create Custom Test Persona</h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomPersona} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Tester Full Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Siddharth Verma"
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Pipeline Role
                </label>
                <select
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="head">👑 Head / Executive (Full Pipeline Control)</option>
                  <option value="hb_reviewer">📖 Lead HB Reviewer (Handbook & Pedagogy)</option>
                  <option value="video_reviewer">🔍 Video Reviewer (Technical QC & L1)</option>
                  <option value="video_editor">🎬 Video Editor (3D & Motion Graphics)</option>
                  <option value="audio_generator">🎙️ Audio & Voiceover Specialist</option>
                  <option value="quiz_implementer">🧩 Quiz Implementer (Interactive Dev)</option>
                  <option value="quiz_generator">📚 Quiz Generator (Subject SME)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Custom Designation (Optional)
                </label>
                <input
                  type="text"
                  value={customDesignation}
                  onChange={(e) => setCustomDesignation(e.target.value)}
                  placeholder="e.g. Senior 3D Animator (Guest Tester)"
                  className="w-full px-3 py-2 border border-border bg-background text-foreground text-xs rounded-lg focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customName.trim() || isLoggingIn}
                  className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  Create & Login Instantly
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
