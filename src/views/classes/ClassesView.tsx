import React, { useState, useEffect } from 'react';
import type { 
  ProjectClass, WorkItem, AssetType, WorkItemStatus,
  Chapter, ClientCommunication, ChapterTrack 
} from '../../types/database';
import { dbClient } from '../../services/dbClient';
import { useAuth } from '../../context/AuthContext';
import { ReviewDrawer } from '../../components/ui/ReviewDrawer';
import {
  Layers, Table, Kanban, Plus, Search, Video, Mic, CheckSquare,
  FileText, ExternalLink, Download, CheckCheck, Sparkles,
  FolderTree, Lock, Send, UserCheck, MessageSquare,
  Shield, Check
} from 'lucide-react';

interface ClassesViewProps {
  onNavigate?: (view: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onNavigate: _onNavigate }) => {
  const { currentUser, profiles } = useAuth();

  const isPrivilegedRole = currentUser?.role === 'client' || currentUser?.role === 'head' || currentUser?.email?.toLowerCase().includes('ashish.garg');
  const isClientUser = currentUser?.role === 'client';

  const [classes, setClasses] = useState<ProjectClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [clientComms, setClientComms] = useState<ClientCommunication[]>([]);
  const [viewMode, setViewMode] = useState<'excel' | 'kanban' | 'chapters'>('chapters');
  const [searchQuery, setSearchQuery] = useState('');
  const [assetTypeFilter, setAssetTypeFilter] = useState<string>('all');
  const [roleQueueFilter, setRoleQueueFilter] = useState<string>('all');
  const [reviewStageFilter, setReviewStageFilter] = useState<string>('all');
  const [quickFilter, setQuickFilter] = useState<'all' | 'blockers' | 'parallel' | 'my_queue' | 'review' | 'approved'>('all');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Selected item for Frame.io style Review Drawer
  const [activeReviewItem, setActiveReviewItem] = useState<WorkItem | null>(null);

  // Client Direct Hub Modal
  const [showClientHub, setShowClientHub] = useState(false);
  const [activeCommTab, setActiveCommTab] = useState<'directives' | 'new_directive'>('directives');

  // Discreet Reassignment Dialog
  const [activeReassignComm, setActiveReassignComm] = useState<ClientCommunication | null>(null);
  const [reassignTargetItemId, setReassignTargetItemId] = useState<string>('');
  const [reassignNewAssigneeId, setReassignNewAssigneeId] = useState<string>('');
  const [reassignSanitizedBriefing, setReassignSanitizedBriefing] = useState<string>('');
  const [isExecutingReassign, setIsExecutingReassign] = useState<boolean>(false);

  // New Client Directive Form
  const [newCommTitle, setNewCommTitle] = useState('');
  const [newCommMessage, setNewCommMessage] = useState('');
  const [newCommType, setNewCommType] = useState<ClientCommunication['type']>('reassignment_request');
  const [newCommTargetTrack, setNewCommTargetTrack] = useState<ChapterTrack>('video_l2');
  const [newCommSuggestedAssignee, setNewCommSuggestedAssignee] = useState('');
  const [isSubmittingComm, setIsSubmittingComm] = useState(false);

  // New Work Item Modal
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssetType, setNewAssetType] = useState<AssetType>('video');
  const [newClassId, setNewClassId] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newReviewerId, setNewReviewerId] = useState('');
  const [newDriveUrl, setNewDriveUrl] = useState('');

  // New Class Project Modal
  const [isCreatingClass, setIsCreatingClass] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassCategory, setNewClassCategory] = useState<ProjectClass['category']>('Class Course');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Load classes, chapters, and work items
  const loadData = async () => {
    try {
      const cls = await dbClient.getProjectClasses();
      setClasses(cls);
      if (cls.length > 0 && !newClassId) {
        setNewClassId(cls[0].id);
      }

      const items = await dbClient.getWorkItems(selectedClassId);
      setWorkItems(items);

      const chaps = await dbClient.getChapters(selectedClassId);
      setChapters(chaps);

      if (isPrivilegedRole) {
        const comms = await dbClient.getClientCommunications(selectedClassId);
        setClientComms(comms);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = dbClient.subscribe((table) => {
      if (table === 'work_items' || table === 'project_classes' || table === 'chapters' || table === 'client_communications') {
        loadData();
      }
    });
    return () => unsub();
  }, [selectedClassId]);

  const getProfileName = (id: string) => {
    return profiles.find(p => p.id === id)?.full_name || 'Unassigned';
  };

  // Counts for speed filter chips
  const blockersCount = workItems.filter(i => (i.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'))).length;
  const parallelCount = workItems.filter(i => i.is_parallel_review_allowed).length;
  const myQueueCount = workItems.filter(i => currentUser && (i.assignee_ids?.includes(currentUser.id) || i.reviewer_ids?.includes(currentUser.id))).length;
  const pendingReviewCount = workItems.filter(i => i.status === 'review_in_progress').length;
  const approvedCount = workItems.filter(i => i.status === 'approved' || i.status === 'delivered').length;

  // Filter items
  const filteredItems = workItems.filter(item => {
    if (selectedClassId !== 'all' && item.project_id !== selectedClassId) return false;
    if (assetTypeFilter !== 'all' && item.asset_type !== assetTypeFilter) return false;
    if (reviewStageFilter !== 'all' && !item.current_review_stage?.includes(reviewStageFilter)) return false;

    // Quick speed-filter chips
    if (quickFilter === 'blockers') {
      const hasBlocker = (item.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'));
      if (!hasBlocker) return false;
    } else if (quickFilter === 'parallel') {
      if (!item.is_parallel_review_allowed) return false;
    } else if (quickFilter === 'my_queue') {
      if (!currentUser || (!item.assignee_ids?.includes(currentUser.id) && !item.reviewer_ids?.includes(currentUser.id))) return false;
    } else if (quickFilter === 'review') {
      if (item.status !== 'review_in_progress') return false;
    } else if (quickFilter === 'approved') {
      if (item.status !== 'approved' && item.status !== 'delivered') return false;
    }

    // Role Queue Filter (e.g. show items assigned to video editors or audio creators)
    if (roleQueueFilter === 'my_work') {
      if (!currentUser || !item.assignee_ids?.includes(currentUser.id)) return false;
    } else if (roleQueueFilter === 'my_reviews') {
      if (!currentUser || !item.reviewer_ids?.includes(currentUser.id)) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.instruction_text.toLowerCase().includes(q) ||
        item.asset_type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Batch action handlers
  const toggleSelectAll = () => {
    if (selectedItemIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(filteredItems.map(i => i.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchAdvanceStage = async () => {
    if (selectedItemIds.length === 0 || !currentUser) return;
    const stageFlow: Record<string, string> = {
      'L1': 'L2',
      'L2': 'L3',
      'L3': 'L4',
      'L4': 'Approved'
    };
    for (const id of selectedItemIds) {
      const item = workItems.find(i => i.id === id);
      if (item) {
        const nextStage = stageFlow[item.current_review_stage] || 'L2';
        await dbClient.updateWorkItem(id, {
          current_review_stage: nextStage,
          status: nextStage === 'Approved' ? 'approved' : 'review_in_progress'
        }, currentUser.id);
      }
    }
    setSelectedItemIds([]);
    await loadData();
  };

  const handleBatchApprove = async () => {
    if (selectedItemIds.length === 0 || !currentUser) return;
    for (const id of selectedItemIds) {
      await dbClient.updateWorkItem(id, {
        status: 'approved',
        current_review_stage: 'Approved'
      }, currentUser.id);
    }
    setSelectedItemIds([]);
    await loadData();
  };

  const handleBatchToggleParallel = async () => {
    if (selectedItemIds.length === 0 || !currentUser) return;
    for (const id of selectedItemIds) {
      const item = workItems.find(i => i.id === id);
      if (item) {
        await dbClient.updateWorkItem(id, {
          is_parallel_review_allowed: !item.is_parallel_review_allowed
        }, currentUser.id);
      }
    }
    setSelectedItemIds([]);
    await loadData();
  };

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Class Code',
      'Class Name',
      'Asset Title',
      'Asset Type',
      'Status',
      'Review Stage',
      'Parallel Review Allowed',
      'Latest Version',
      'Open Remarks Count',
      'Assignees',
      'Reviewers',
      'Drive Folder URL'
    ];

    const rows = filteredItems.map((item) => {
      const cls = classes.find(c => c.id === item.project_id);
      const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;
      const assignees = (item.assignee_ids || []).map(id => getProfileName(id)).join('; ');
      const reviewers = (item.reviewer_ids || []).map(id => getProfileName(id)).join('; ');

      return [
        item.id,
        `"${(cls?.code || '').replace(/"/g, '""')}"`,
        `"${(cls?.name || '').replace(/"/g, '""')}"`,
        `"${item.title.replace(/"/g, '""')}"`,
        item.asset_type,
        item.status,
        item.current_review_stage,
        item.is_parallel_review_allowed ? 'Yes' : 'No',
        `v${item.latest_version_number || 1}`,
        openRemarks,
        `"${assignees.replace(/"/g, '""')}"`,
        `"${reviewers.replace(/"/g, '""')}"`,
        `"${(item.drive_folder_url || '').replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wc2_assets_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Quick Create Work Item
  const handleCreateWorkItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !currentUser || !newClassId) return;

    try {
      await dbClient.createWorkItem({
        project_id: newClassId,
        title: newTitle.trim(),
        asset_type: newAssetType,
        status: 'in_production',
        priority: 'high',
        current_review_stage: 'L1',
        is_parallel_review_allowed: true,
        assignee_ids: newAssigneeId ? [newAssigneeId] : [currentUser.id],
        reviewer_ids: newReviewerId ? [newReviewerId] : [],
        instruction_text: newInstructions.trim(),
        instruction_version: 1,
        drive_folder_url: newDriveUrl.trim() || undefined,
        created_by: currentUser.id
      }, currentUser.id);

      setIsCreatingItem(false);
      setNewTitle('');
      setNewInstructions('');
      setNewDriveUrl('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Create Class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    try {
      const created = await dbClient.createProjectClass({
        name: newClassName.trim(),
        code: newClassCode.trim() || 'NEW-MOD',
        category: newClassCategory,
        description: newClassDesc.trim(),
        status: 'active',
        custom_review_stages: ['L1: Tech Audio/Video', 'L2: HB Accuracy', 'L3: Quiz Logic', 'L4: Final Executive Signoff']
      });

      setIsCreatingClass(false);
      setNewClassName('');
      setNewClassCode('');
      setNewClassDesc('');
      setSelectedClassId(created.id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Inline table field update (Excel-speed editing)
  const handleInlineStatusChange = async (itemId: string, status: WorkItemStatus) => {
    try {
      await dbClient.updateWorkItem(itemId, { status }, currentUser?.id || '');
      setWorkItems(prev => prev.map(i => i.id === itemId ? { ...i, status } : i));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInlineStageChange = async (itemId: string, current_review_stage: string) => {
    try {
      await dbClient.updateWorkItem(itemId, { current_review_stage }, currentUser?.id || '');
      setWorkItems(prev => prev.map(i => i.id === itemId ? { ...i, current_review_stage } : i));
    } catch (err) {
      console.error(err);
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'video': return <Video className="h-3.5 w-3.5 text-blue-500" />;
      case 'audio': return <Mic className="h-3.5 w-3.5 text-purple-500" />;
      case 'quiz': return <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />;
      default: return <FileText className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const kanbanColumns: { status: WorkItemStatus; label: string; color: string }[] = [
    { status: 'backlog', label: 'Backlog & Scripts', color: 'border-slate-500/30' },
    { status: 'in_production', label: 'In Production (Editors/Audio)', color: 'border-blue-500/30' },
    { status: 'review_in_progress', label: 'Review Rounds (L1–L4)', color: 'border-amber-500/30' },
    { status: 'approved', label: 'Approved & Signed Off', color: 'border-emerald-500/30' },
    { status: 'delivered', label: 'Published to Class', color: 'border-purple-500/30' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      
      {/* Top Action Header */}
      <div className="p-4 md:p-6 border-b border-border bg-card/50 backdrop-blur shrink-0 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">Classes & Production Assets</h1>
                <p className="text-xs text-muted-foreground">
                  IXR & EdTech workflow engine: Multi-tier reviews (L1–L4), Frame.io feedback, and dynamic handoffs.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher: Chapters Hierarchy vs Excel Table vs Jira Kanban */}
            <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
              <button
                onClick={() => setViewMode('chapters')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === 'chapters'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FolderTree className="h-3.5 w-3.5 text-primary" />
                Chapter Hierarchy
              </button>
              <button
                onClick={() => setViewMode('excel')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === 'excel'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Table className="h-3.5 w-3.5" />
                Spreadsheet (Excel)
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Kanban className="h-3.5 w-3.5" />
                Pipeline (Jira)
              </button>
            </div>

            {/* Confidential Client Direct Channel (Restricted to Client, Head of IXR, CEO) */}
            {isPrivilegedRole && (
              <button
                onClick={() => setShowClientHub(true)}
                className="px-3.5 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm relative"
                title="Confidential communication channel between Client Representative, Head of IXR, and CEO."
              >
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span>Client Direct Hub</span>
                {clientComms.filter(c => c.status === 'pending').length > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {clientComms.filter(c => c.status === 'pending').length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsCreatingClass(true)}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> New Class / Project
            </button>

            <button
              onClick={handleExportCSV}
              title="Export filtered assets to CSV / Excel spreadsheet"
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => setIsCreatingItem(true)}
              className="px-3.5 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Asset / Task
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-1 text-xs">
          
          {/* Class / Subject Selector */}
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer text-xs"
            >
              <option value="all">📚 All Classes & Batches ({classes.length})</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.code} · {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assets, instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-2 text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </div>

          {/* Asset Type Filter */}
          <div>
            <select
              value={assetTypeFilter}
              onChange={(e) => setAssetTypeFilter(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer text-xs"
            >
              <option value="all">🎨 All Asset Types</option>
              <option value="video">🎬 Videos / 3D Animation</option>
              <option value="audio">🎙️ Voiceover / Audio Tracks</option>
              <option value="quiz">📝 Interactive Quizzes</option>
              <option value="interactive_module">🧪 Interactive Labs</option>
            </select>
          </div>

          {/* Review Tier Filter */}
          <div>
            <select
              value={reviewStageFilter}
              onChange={(e) => setReviewStageFilter(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer text-xs"
            >
              <option value="all">🔍 All Review Tiers</option>
              <option value="L1">L1: Tech Audio/Video</option>
              <option value="L2">L2: Handbook Accuracy</option>
              <option value="L3">L3: Quiz Logic</option>
              <option value="L4">L4: Final Signoff</option>
            </select>
          </div>

          {/* My Role / Queue Filter */}
          <div>
            <select
              value={roleQueueFilter}
              onChange={(e) => setRoleQueueFilter(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3 py-2 text-foreground font-medium focus:outline-none focus:border-primary cursor-pointer text-xs"
            >
              <option value="all">👥 Full Team Queue</option>
              <option value="my_work">💼 Assigned to Me</option>
              <option value="my_reviews">🎯 Pending My Review</option>
            </select>
          </div>
        </div>

        {/* Quick Speed-Filter Pills */}
        <div className="flex items-center gap-2 pt-3 flex-wrap text-xs border-t border-border/50 mt-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>Speed Filter:</span>
          </span>

          <button
            onClick={() => setQuickFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              quickFilter === 'all'
                ? 'bg-foreground text-background shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All ({workItems.length})
          </button>

          <button
            onClick={() => setQuickFilter('blockers')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickFilter === 'blockers'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-card border border-red-500/30 text-red-500 hover:bg-red-500/10'
            }`}
          >
            <span>🚨 Critical Blockers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500/20">{blockersCount}</span>
          </button>

          <button
            onClick={() => setQuickFilter('parallel')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickFilter === 'parallel'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
            }`}
          >
            <span>⚡ Parallel Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20">{parallelCount}</span>
          </button>

          <button
            onClick={() => setQuickFilter('my_queue')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickFilter === 'my_queue'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>👤 My Assigned</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/15 text-primary">{myQueueCount}</span>
          </button>

          <button
            onClick={() => setQuickFilter('review')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickFilter === 'review'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-card border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
            }`}
          >
            <span>⏳ In Review</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/20">{pendingReviewCount}</span>
          </button>

          <button
            onClick={() => setQuickFilter('approved')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              quickFilter === 'approved'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>✓ Approved ({approvedCount})</span>
          </button>

          <div className="ml-auto hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-primary/10 border border-primary/20 text-[11px] text-primary font-semibold">
            <span>⚡ ACID Database Protected</span>
            <span className="text-muted-foreground">•</span>
            <span>Zero Overwrite Risk</span>
          </div>
        </div>
      </div>

      {/* Main Viewport: Excel Table or Jira Kanban */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        
        {/* Batch Action Bar */}
        {selectedItemIds.length > 0 && (
          <div className="bg-foreground text-background rounded-xl p-3 mb-4 shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2">
              <CheckCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold">
                {selectedItemIds.length} asset{selectedItemIds.length > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBatchAdvanceStage}
                className="px-3 py-1.5 rounded-lg bg-background/20 hover:bg-background/30 text-xs font-semibold cursor-pointer transition"
              >
                ⏩ Advance Stage (+1 Tier)
              </button>

              <button
                onClick={handleBatchToggleParallel}
                className="px-3 py-1.5 rounded-lg bg-background/20 hover:bg-background/30 text-xs font-semibold cursor-pointer transition"
              >
                ⚡ Toggle Parallel Mode
              </button>

              <button
                onClick={handleBatchApprove}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold cursor-pointer transition"
              >
                ✓ Bulk Approve
              </button>

              <button
                onClick={() => setSelectedItemIds([])}
                className="px-2.5 py-1.5 text-xs text-background/70 hover:text-background cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* MODE 1: EXCEL SPREADSHEET (Speed, Inline Editing, Frame.io Trigger) */}
        {viewMode === 'excel' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={selectedItemIds.length === filteredItems.length && filteredItems.length > 0}
                        onChange={toggleSelectAll}
                        className="cursor-pointer rounded accent-primary"
                        title="Select all visible assets"
                      />
                    </th>
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3 min-w-[240px]">Work Item / Asset Title</th>
                    <th className="p-3 w-32">Type</th>
                    <th className="p-3 w-36">Status</th>
                    <th className="p-3 w-36">Review Tier</th>
                    <th className="p-3 w-28">Version</th>
                    <th className="p-3 w-40">Assignees</th>
                    <th className="p-3 w-40">Reviewers</th>
                    <th className="p-3 w-28 text-center">Open Remarks</th>
                    <th className="p-3 w-28 text-right">Review Hub</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 font-sans">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-muted-foreground">
                        No assets found matching the selected filters. Click "Add Asset" to start tracking.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item, idx) => {
                      const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;
                      const firstOpenRemark = (item.remarks || []).find(r => r.status === 'open');
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-muted/30 transition-colors group ${
                            selectedItemIds.includes(item.id) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItemIds.includes(item.id)}
                              onChange={() => toggleSelectItem(item.id)}
                              className="cursor-pointer rounded accent-primary"
                            />
                          </td>
                          <td className="p-3 text-center text-muted-foreground font-mono">
                            {idx + 1}
                          </td>

                          {/* Title & Drive Link */}
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setActiveReviewItem(item)}
                                className="font-semibold text-foreground hover:text-primary transition-colors text-left truncate max-w-xs cursor-pointer"
                              >
                                {item.title}
                              </button>
                              {item.drive_folder_url && (
                                <a
                                  href={item.drive_folder_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="Open Drive Folder"
                                  className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate max-w-sm mt-0.5">
                              {item.instruction_text}
                            </p>
                          </td>

                          {/* Type */}
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border text-[11px] font-medium capitalize">
                              {getAssetIcon(item.asset_type)}
                              {item.asset_type.replace(/_/g, ' ')}
                            </span>
                          </td>

                          {/* Inline Status Dropdown */}
                          <td className="p-3">
                            <select
                              value={item.status}
                              onChange={(e) => handleInlineStatusChange(item.id, e.target.value as any)}
                              className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                                item.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                                  : item.status === 'review_in_progress'
                                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                                  : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                              }`}
                            >
                              <option value="backlog">Backlog</option>
                              <option value="in_production">In Production</option>
                              <option value="review_in_progress">Review In Progress</option>
                              <option value="approved">Approved</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          </td>

                          {/* Inline Review Tier Dropdown */}
                          <td className="p-3">
                            <select
                              value={item.current_review_stage}
                              onChange={(e) => handleInlineStageChange(item.id, e.target.value)}
                              className="text-[11px] font-medium bg-muted/60 border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none cursor-pointer"
                            >
                              <option value="L1">L1: Tech Check</option>
                              <option value="L2">L2: HB Accuracy</option>
                              <option value="L3">L3: Quiz Logic</option>
                              <option value="L4">L4: Final Signoff</option>
                            </select>
                          </td>

                          {/* Latest Version */}
                          <td className="p-3">
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              v{item.latest_version_number || 1}
                            </span>
                          </td>

                          {/* Assignees */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {(item.assignee_ids || []).slice(0, 2).map((uid) => (
                                <span
                                  key={uid}
                                  title={getProfileName(uid)}
                                  className="h-6 w-6 rounded-full bg-primary/15 text-primary font-bold text-[10px] flex items-center justify-center border border-border"
                                >
                                  {getProfileName(uid).slice(0, 2).toUpperCase()}
                                </span>
                              ))}
                              <span className="text-[11px] text-muted-foreground truncate">
                                {getProfileName(item.assignee_ids[0])}
                              </span>
                            </div>
                          </td>

                          {/* Reviewers */}
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {(item.reviewer_ids || []).map((uid) => (
                                <span
                                  key={uid}
                                  title={getProfileName(uid)}
                                  className="h-6 w-6 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold text-[10px] flex items-center justify-center border border-border"
                                >
                                  {getProfileName(uid).slice(0, 2).toUpperCase()}
                                </span>
                              ))}
                              {(!item.reviewer_ids || item.reviewer_ids.length === 0) && (
                                <span className="text-[10px] text-muted-foreground">None</span>
                              )}
                            </div>
                          </td>

                          {/* Open Remarks Badge */}
                          <td className="p-3 text-center">
                            {openRemarks > 0 ? (
                              <button
                                onClick={() => setActiveReviewItem(item)}
                                title={firstOpenRemark ? `Latest Remark: ${firstOpenRemark.timestamp_seconds ? `[${Math.floor(firstOpenRemark.timestamp_seconds / 60)}:${String(firstOpenRemark.timestamp_seconds % 60).padStart(2, '0')}] ` : ''}${firstOpenRemark.remark_text}` : `${openRemarks} open remarks`}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all cursor-pointer shadow-sm"
                              >
                                <span>🚨 {openRemarks} Open</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                ✓ Clean
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setActiveReviewItem(item)}
                              className="px-2.5 py-1 bg-primary text-primary-foreground rounded-lg font-semibold text-[11px] hover:bg-primary/90 transition shadow-sm cursor-pointer"
                            >
                              Open Hub
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODE 2: JIRA KANBAN PIPELINE */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-full min-h-[600px]">
            {kanbanColumns.map(col => {
              const colItems = filteredItems.filter(i => i.status === col.status);
              return (
                <div
                  key={col.status}
                  className="bg-card/40 border border-border rounded-2xl p-3 flex flex-col min-h-[400px]"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <h3 className="text-xs font-bold text-foreground truncate pr-2">{col.label}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      {colItems.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {colItems.map(item => {
                      const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setActiveReviewItem(item)}
                          className="p-3.5 bg-card border border-border rounded-xl shadow-xs hover:shadow-md hover:border-primary/50 transition cursor-pointer space-y-2 group"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="flex items-center gap-1 text-muted-foreground font-medium uppercase">
                              {getAssetIcon(item.asset_type)} {item.asset_type}
                            </span>
                            <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                              v{item.latest_version_number}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                            {item.title}
                          </h4>

                          <p className="text-[11px] text-muted-foreground line-clamp-2">
                            {item.instruction_text}
                          </p>

                          <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[10px]">
                            <span className="text-primary font-semibold">
                              Tier: {item.current_review_stage}
                            </span>

                            {openRemarks > 0 ? (
                              <span className="text-red-500 font-bold">
                                {openRemarks} remarks
                              </span>
                            ) : (
                              <span className="text-emerald-500 font-medium">✓ Clean</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODE 3: CHAPTER HIERARCHY MATRIX (Script, Video L1-L4, Audio L1-L2, Quiz Gen/Rev/Impl/Test, HB Review) */}
        {viewMode === 'chapters' && (
          <div className="space-y-6">
            {chapters.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
                <FolderTree className="h-10 w-10 mx-auto mb-3 opacity-40 text-primary" />
                <h3 className="text-sm font-bold text-foreground">No Chapters Found</h3>
                <p className="text-xs mt-1">Select an active class project from the top filter or initialize chapter tracks.</p>
              </div>
            ) : (
              chapters.map(chapter => {
                const chapterItems = workItems.filter(i => i.chapter_id === chapter.id);
                const approvedCount = chapterItems.filter(i => i.status === 'approved' || i.status === 'delivered').length;
                const totalTracks = 12; // 1 Script + 4 Video + 2 Audio + 4 Quiz + 1 HB
                const progressPct = chapterItems.length > 0 ? Math.round((approvedCount / Math.max(chapterItems.length, totalTracks)) * 100) : 0;

                // Track extractors
                const scriptItem = chapterItems.find(i => i.chapter_track === 'script');
                const vidL1 = chapterItems.find(i => i.chapter_track === 'video_l1');
                const vidL2 = chapterItems.find(i => i.chapter_track === 'video_l2');
                const vidL3 = chapterItems.find(i => i.chapter_track === 'video_l3');
                const vidL4 = chapterItems.find(i => i.chapter_track === 'video_l4');
                const audL1 = chapterItems.find(i => i.chapter_track === 'audio_l1');
                const audL2 = chapterItems.find(i => i.chapter_track === 'audio_l2');
                const quizGen = chapterItems.find(i => i.chapter_track === 'quiz_generation');
                const quizRev = chapterItems.find(i => i.chapter_track === 'quiz_review');
                const quizImp = chapterItems.find(i => i.chapter_track === 'quiz_implementation');
                const quizTest = chapterItems.find(i => i.chapter_track === 'quiz_testing');
                const hbItem = chapterItems.find(i => i.chapter_track === 'hb_review');

                // Render track card helper
                const renderTrackNode = (label: string, item?: WorkItem, badgeColor = 'bg-primary/10 text-primary border-primary/20') => {
                  if (!item) {
                    return (
                      <div className="p-3 rounded-xl border border-dashed border-border/80 bg-muted/20 flex flex-col justify-between min-h-[110px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-muted-foreground">{label}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Unscheduled</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground/70 italic mt-2">Awaiting queue instantiation</p>
                      </div>
                    );
                  }

                  const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;
                  const hasBlocker = (item.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'));
                  const hasConfidentialRemark = isPrivilegedRole && (item.remarks || []).some(r => r.is_confidential && r.status === 'open');

                  return (
                    <div
                      onClick={() => setActiveReviewItem(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[115px] group ${
                        item.status === 'approved'
                          ? 'bg-emerald-500/[0.04] border-emerald-500/30 hover:border-emerald-500'
                          : item.status === 'review_in_progress'
                          ? 'bg-purple-500/[0.04] border-purple-500/30 hover:border-purple-500'
                          : 'bg-card border-border hover:border-primary'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                            {label}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            item.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' :
                            item.status === 'review_in_progress' ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400' :
                            'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          }`}>
                            {item.status === 'approved' ? '✓ Approved' : item.current_review_stage || item.status}
                          </span>
                        </div>
                        <h5 className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h5>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] mt-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="h-4.5 w-4.5 rounded-full bg-primary/20 text-primary font-bold text-[8px] flex items-center justify-center shrink-0">
                            {getProfileName(item.assignee_ids[0]).slice(0, 2).toUpperCase()}
                          </span>
                          <span className="truncate text-muted-foreground text-[10px]">
                            {getProfileName(item.assignee_ids[0]).split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {hasConfidentialRemark && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-600 font-bold border border-amber-500/30" title="Confidential Client note exists on this asset">
                              🔒
                            </span>
                          )}
                          {openRemarks > 0 ? (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              hasBlocker ? 'bg-red-500/20 text-red-500' : 'bg-amber-500/20 text-amber-600'
                            }`}>
                              {openRemarks} open
                            </span>
                          ) : (
                            <span className="text-emerald-500 font-bold text-[9px]">v{item.latest_version_number}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                };

                return (
                  <div key={chapter.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                    {/* Chapter Header Banner */}
                    <div className="p-4 md:p-5 bg-muted/30 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-primary text-primary-foreground">
                            Chapter {String(chapter.chapter_number).padStart(2, '0')}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            chapter.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                            chapter.status === 'in_progress' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                            'bg-muted text-muted-foreground border-border'
                          }`}>
                            {chapter.status.toUpperCase()}
                          </span>
                          {chapter.target_date && (
                            <span className="text-xs text-muted-foreground font-medium">
                              Target Delivery: {new Date(chapter.target_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-foreground">{chapter.title}</h3>
                        <p className="text-xs text-muted-foreground max-w-3xl mt-0.5">{chapter.description}</p>
                      </div>

                      {/* Progress Gauge */}
                      <div className="flex flex-col md:items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <span className="text-muted-foreground">Course Milestone Progress:</span>
                          <span className="text-primary">{approvedCount}/{chapterItems.length} Tracks Cleared</span>
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary">{progressPct}%</span>
                        </div>
                        <div className="w-44 h-2 bg-muted rounded-full overflow-hidden border border-border">
                          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Chapter Tracks Matrix */}
                    <div className="p-4 md:p-6 space-y-6">
                      
                      {/* Top Row: Script & HB Review Bookends */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/15 p-3 rounded-xl border border-border/60">
                        <div>
                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5 text-amber-500" />
                            <span>1. Script & Pedagogical Baseline</span>
                          </div>
                          {renderTrackNode('Script Draft', scriptItem, 'bg-amber-500/10 text-amber-600 border-amber-500/30')}
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-indigo-500" />
                            <span>5. HB Review (Final Director Clearance)</span>
                          </div>
                          {renderTrackNode('HB Final Clearance', hbItem, 'bg-indigo-500/10 text-indigo-600 border-indigo-500/30')}
                        </div>
                      </div>

                      {/* Video Production Track: L1 -> L2 -> L3 -> L4 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <Video className="h-3.5 w-3.5 text-blue-500" />
                            <span>2. Video Multi-Level Track (L1 → L2 → L3 → L4)</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">Sequential or parallel review staging</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {renderTrackNode('Video: L1 (Tech QC)', vidL1, 'bg-blue-500/10 text-blue-500 border-blue-500/20')}
                          {renderTrackNode('Video: L2 (3D Motion)', vidL2, 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20')}
                          {renderTrackNode('Video: L3 (Fine Polish)', vidL3, 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20')}
                          {renderTrackNode('Video: L4 (4K Master)', vidL4, 'bg-purple-500/10 text-purple-500 border-purple-500/20')}
                        </div>
                      </div>

                      {/* Audio & Sound Track: L1 -> L2 */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-purple-500" />
                          <span>3. Audio & Voiceover Track (L1 → L2)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {renderTrackNode('Audio: L1 (Voiceover EQ)', audL1, 'bg-purple-500/10 text-purple-500 border-purple-500/20')}
                          {renderTrackNode('Audio: L2 (SFX & Ambience)', audL2, 'bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20')}
                        </div>
                      </div>

                      {/* Interactive Quiz Track: Generation -> Review -> Implementation -> Testing */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                          <CheckSquare className="h-3.5 w-3.5 text-emerald-500" />
                          <span>4. Interactive Quiz Track (Generation → Review → Implementation → Testing)</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          {renderTrackNode('Quiz: Generation', quizGen, 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20')}
                          {renderTrackNode('Quiz: Review', quizRev, 'bg-teal-500/10 text-teal-600 border-teal-500/20')}
                          {renderTrackNode('Quiz: Implementation', quizImp, 'bg-amber-500/10 text-amber-600 border-amber-500/20')}
                          {renderTrackNode('Quiz: Testing QA', quizTest, 'bg-rose-500/10 text-rose-600 border-rose-500/20')}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Frame.io Style Asset Review Drawer Modal */}
      {activeReviewItem && (
        <ReviewDrawer
          item={activeReviewItem}
          onClose={() => setActiveReviewItem(null)}
          onItemUpdated={(updated) => {
            setActiveReviewItem(updated);
            setWorkItems(prev => prev.map(i => i.id === updated.id ? updated : i));
          }}
        />
      )}

      {/* Quick Add Asset Modal */}
      {isCreatingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-primary" /> Create New Production Asset
              </h3>
              <button
                onClick={() => setIsCreatingItem(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkItem} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Class / Module</label>
                <select
                  value={newClassId}
                  onChange={(e) => setNewClassId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.code} · {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Asset Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optics 3D Refraction Simulation"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground mb-1 block">Asset Type</label>
                  <select
                    value={newAssetType}
                    onChange={(e) => setNewAssetType(e.target.value as any)}
                    className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                  >
                    <option value="video">Video / 3D Animation</option>
                    <option value="audio">Voiceover / Audio</option>
                    <option value="quiz">Interactive Quiz</option>
                    <option value="interactive_module">Interactive Module</option>
                    <option value="handbook">Handbook Document</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground mb-1 block">Lead Assignee</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                  >
                    <option value="">Select Assignee...</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.designation || p.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Primary Reviewer</label>
                <select
                  value={newReviewerId}
                  onChange={(e) => setNewReviewerId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                >
                  <option value="">Select Reviewer (HB / Tech / Video)...</option>
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} ({p.designation || p.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Google Drive / Assets URL</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={newDriveUrl}
                  onChange={(e) => setNewDriveUrl(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Production Instructions & Brief</label>
                <textarea
                  rows={3}
                  placeholder="Specific requirements, formulas, storyboard timings, or audio cues..."
                  value={newInstructions}
                  onChange={(e) => setNewInstructions(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingItem(false)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Class Modal */}
      {isCreatingClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" /> Create New Class or Batch
              </h3>
              <button
                onClick={() => setIsCreatingClass(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Class / Module Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 11 - Wave Optics & Interference"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground mb-1 block">Code / Identifier</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C11-OPT"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="font-semibold text-muted-foreground mb-1 block">Category</label>
                  <select
                    value={newClassCategory}
                    onChange={(e) => setNewClassCategory(e.target.value as any)}
                    className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                  >
                    <option value="Class Course">Class Course</option>
                    <option value="Interactive Lab">Interactive Lab</option>
                    <option value="Quiz Bank">Quiz Bank</option>
                    <option value="Special Module">Special Module</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the curriculum module..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingClass(false)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 cursor-pointer"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confidential Client Direct Hub Modal */}
      {showClientHub && isPrivilegedRole && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Lock className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span>Confidential Client Direct Hub</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      Restricted Access
                    </span>
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Private channel between Client Representative, Head of IXR, and CEO. Strictly hidden from production team.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowClientHub(false);
                  setActiveReassignComm(null);
                }}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-border px-4 bg-muted/20 text-xs font-semibold">
              <button
                onClick={() => setActiveCommTab('directives')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeCommTab === 'directives' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Directives & Reassignments ({clientComms.length})
              </button>
              <button
                onClick={() => setActiveCommTab('new_directive')}
                className={`py-2.5 px-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeCommTab === 'new_directive' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                {isClientUser ? 'Issue Direct Client Directive' : 'Log Private Executive Note'}
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              {activeCommTab === 'directives' && (
                <div className="space-y-3">
                  {clientComms.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      No confidential directives logged for this project.
                    </div>
                  ) : (
                    clientComms.map((comm) => {
                      const isPending = comm.status === 'pending';
                      const targetWorkItem = workItems.find(i => i.id === comm.work_item_id) || workItems.find(i => i.chapter_track === comm.target_track);
                      return (
                        <div
                          key={comm.id}
                          className={`p-4 rounded-xl border transition-all ${
                            isPending
                              ? 'bg-card border-amber-500/40 shadow-xs'
                              : 'bg-muted/20 border-border opacity-75'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                comm.type === 'reassignment_request' ? 'bg-red-500/15 text-red-500 border border-red-500/30' :
                                comm.type === 'scope_alert' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30' :
                                'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                              }`}>
                                {comm.type.replace(/_/g, ' ')}
                              </span>
                              <span className="font-semibold text-foreground text-xs">{comm.title}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isPending ? 'bg-amber-500/20 text-amber-600' : 'bg-emerald-500/20 text-emerald-600'
                            }`}>
                              {comm.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground my-2 leading-relaxed bg-muted/40 p-2.5 rounded-lg border border-border/50">
                            "{comm.message}"
                          </p>

                          <div className="flex items-center justify-between text-[11px] text-muted-foreground flex-wrap gap-2 pt-1">
                            <span>From: <strong className="text-foreground">{getProfileName(comm.sender_id)}</strong></span>
                            <span>{new Date(comm.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(comm.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Actioning area for Head of IXR and CEO */}
                          {isPending && !isClientUser && (
                            <div className="mt-3 pt-3 border-t border-border flex items-center justify-end gap-2">
                              {comm.type === 'reassignment_request' && targetWorkItem && (
                                <button
                                  onClick={() => {
                                    setActiveReassignComm(comm);
                                    setReassignTargetItemId(targetWorkItem.id);
                                    setReassignNewAssigneeId(comm.suggested_assignee_id || 'video-ed-1');
                                    setReassignSanitizedBriefing('Priority pacing alignment and chapter milestone timeline balancing.');
                                  }}
                                  className="px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-primary/90 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                  <UserCheck className="h-3.5 w-3.5" />
                                  Discreetly Apply Reassignment
                                </button>
                              )}
                              <button
                                onClick={async () => {
                                  await dbClient.actionClientCommunication(comm.id, 'Acknowledged and integrated into operational plan.');
                                  loadData();
                                }}
                                className="px-3 py-1.5 bg-card border border-border text-foreground text-xs font-semibold rounded-lg hover:bg-muted transition cursor-pointer"
                              >
                                Mark Actioned
                              </button>
                            </div>
                          )}

                          {comm.action_notes && (
                            <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2 rounded border border-emerald-500/20 font-medium">
                              ✓ {comm.action_notes}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 2: SEND CONFIDENTIAL DIRECTIVE FORM */}
              {activeCommTab === 'new_directive' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newCommTitle.trim() || !newCommMessage.trim() || !currentUser) return;
                    setIsSubmittingComm(true);
                    try {
                      await dbClient.createClientCommunication({
                        project_id: selectedClassId !== 'all' ? selectedClassId : 'class-1',
                        chapter_id: chapters[0]?.id || 'chap-10-01',
                        sender_id: currentUser.id,
                        sender_role: currentUser.role === 'client' ? 'client' : 'head',
                        recipient_roles: ['head'],
                        type: newCommType,
                        title: newCommTitle.trim(),
                        message: newCommMessage.trim(),
                        target_track: newCommTargetTrack,
                        suggested_assignee_id: newCommSuggestedAssignee || undefined,
                        is_confidential: true
                      });
                      setNewCommTitle('');
                      setNewCommMessage('');
                      setActiveCommTab('directives');
                      loadData();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsSubmittingComm(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">Directive Type</label>
                    <select
                      value={newCommType}
                      onChange={(e) => setNewCommType(e.target.value as any)}
                      className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                    >
                      <option value="reassignment_request">Direct Team Reassignment Request</option>
                      <option value="private_directive">Confidential Artistic / Pedagogy Directive</option>
                      <option value="scope_alert">Schedule / Scope Acceleration Notice</option>
                      <option value="budget_sla">Commercial / SLA Milestone Requirement</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">Directive Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Reassign Video L2 track for Chapter 1"
                      value={newCommTitle}
                      onChange={(e) => setNewCommTitle(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">Target Chapter Track</label>
                      <select
                        value={newCommTargetTrack}
                        onChange={(e) => setNewCommTargetTrack(e.target.value as any)}
                        className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                      >
                        <option value="script">Script</option>
                        <option value="video_l1">Video L1 (Tech QC)</option>
                        <option value="video_l2">Video L2 (3D Motion)</option>
                        <option value="video_l3">Video L3 (Fine Polish)</option>
                        <option value="video_l4">Video L4 (4K Master)</option>
                        <option value="audio_l1">Audio L1 (Voiceover)</option>
                        <option value="audio_l2">Audio L2 (SFX Mix)</option>
                        <option value="quiz_generation">Quiz Generation</option>
                        <option value="quiz_implementation">Quiz Implementation</option>
                        <option value="quiz_testing">Quiz Testing</option>
                        <option value="hb_review">HB Review</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-muted-foreground mb-1 block">Suggested Replacement (Optional)</label>
                      <select
                        value={newCommSuggestedAssignee}
                        onChange={(e) => setNewCommSuggestedAssignee(e.target.value)}
                        className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                      >
                        <option value="">No preference / Head decision</option>
                        {profiles.filter(p => p.role !== 'client').map(p => (
                          <option key={p.id} value={p.id}>{p.full_name} ({p.designation || p.role})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-muted-foreground mb-1 block">
                      Confidential Directive Message
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain the confidential reasoning (this will strictly stay between Client, Head of IXR, and CEO)..."
                      value={newCommMessage}
                      onChange={(e) => setNewCommMessage(e.target.value)}
                      className="w-full bg-muted border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingComm}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" /> Submit Confidential Directive
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Discreet Reassignment Dialog for Head of IXR */}
      {activeReassignComm && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-card border border-border rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Discreet Role Reassignment</span>
              </h3>
              <button
                onClick={() => setActiveReassignComm(null)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Executing client directive: <strong className="text-foreground">{activeReassignComm.title}</strong>.
              The new assignee will receive a polite, sanitized briefing. The previous specialist will not be exposed to confidential complaints.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">New Assignee Specialist</label>
                <select
                  value={reassignNewAssigneeId}
                  onChange={(e) => setReassignNewAssigneeId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground cursor-pointer"
                >
                  {profiles.filter(p => p.role !== 'client').map(p => (
                    <option key={p.id} value={p.id}>{p.full_name} · {p.designation || p.role}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-muted-foreground mb-1 block">Sanitized Handover Briefing (Visible to Team)</label>
                <textarea
                  rows={2}
                  value={reassignSanitizedBriefing}
                  onChange={(e) => setReassignSanitizedBriefing(e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg p-2 text-foreground focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveReassignComm(null)}
                  className="px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isExecutingReassign}
                  onClick={async () => {
                    setIsExecutingReassign(true);
                    try {
                      await dbClient.discreetReassign(
                        reassignTargetItemId,
                        reassignNewAssigneeId,
                        reassignSanitizedBriefing,
                        activeReassignComm.id
                      );
                      setActiveReassignComm(null);
                      loadData();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setIsExecutingReassign(false);
                    }
                  }}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" /> Execute Reassignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
