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
  Check, ChevronDown, SlidersHorizontal, ArrowRight
} from 'lucide-react';

interface ClassesViewProps {
  onNavigate?: (view: string) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onNavigate: _onNavigate }) => {
  const { currentUser, profiles } = useAuth();

  const isPrivilegedRole = currentUser?.role === 'client' || currentUser?.role === 'head' || currentUser?.email?.toLowerCase().includes('ashish.garg');
  const isClientUser = currentUser?.role === 'client';

  const [primaryMode, setPrimaryMode] = useState<'focus' | 'studio'>('studio');
  const [selectedChapterTab, setSelectedChapterTab] = useState<string>('all');
  const [collapsedChapters, setCollapsedChapters] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [tableDensity, setTableDensity] = useState<'comfortable' | 'compact'>('comfortable');

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

  // Focus queue items for active persona
  const myAssignedDeliverables = workItems.filter(i => currentUser && i.assignee_ids?.includes(currentUser.id));
  const myPendingReviews = workItems.filter(i => currentUser && i.reviewer_ids?.includes(currentUser.id) && i.status === 'review_in_progress');
  const criticalBlockerItems = workItems.filter(i => (i.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction')));

  const toggleChapterCollapse = (chapterId: string) => {
    setCollapsedChapters(prev =>
      prev.includes(chapterId) ? prev.filter(id => id !== chapterId) : [...prev, chapterId]
    );
  };

  const toggleAllChapters = () => {
    if (collapsedChapters.length === chapters.length) {
      setCollapsedChapters([]);
    } else {
      setCollapsedChapters(chapters.map(c => c.id));
    }
  };

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
      {/* Top Action Header */}
      <div className="p-4 md:p-5 border-b border-border bg-card/50 backdrop-blur shrink-0 space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Left: Branding & Primary Mode Switcher (Focus vs Studio) */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <Layers className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-lg font-bold text-foreground tracking-tight leading-tight">Classes & Production Assets</h1>
                <p className="text-[11px] text-muted-foreground">
                  Multi-tier reviews (L1–L4), Frame.io feedback, and dynamic handoffs.
                </p>
              </div>
            </div>

            {/* Primary Mode Toggle: My Focus vs Studio Overview */}
            <div className="flex items-center bg-muted/70 p-1 rounded-xl border border-border shrink-0 ml-0 sm:ml-2">
              <button
                onClick={() => setPrimaryMode('focus')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  primaryMode === 'focus'
                    ? 'bg-card text-primary shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>🎯 My Focus</span>
                {myAssignedDeliverables.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary/15 text-primary font-bold">
                    {myAssignedDeliverables.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setPrimaryMode('studio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                  primaryMode === 'studio'
                    ? 'bg-card text-foreground shadow-xs border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>📁 Studio Overview</span>
              </button>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {primaryMode === 'studio' && (
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
                <button
                  onClick={() => setViewMode('chapters')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    viewMode === 'chapters'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <FolderTree className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Chapter Hierarchy</span>
                  <span className="sm:hidden">Chapters</span>
                </button>
                <button
                  onClick={() => setViewMode('excel')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    viewMode === 'excel'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Table className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Spreadsheet</span>
                  <span className="sm:hidden">Excel</span>
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    viewMode === 'kanban'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Kanban className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Pipeline</span>
                  <span className="sm:hidden">Jira</span>
                </button>
              </div>
            )}

            {/* Confidential Client Direct Channel (Restricted to Client, Head of IXR, CEO) */}
            {isPrivilegedRole && (
              <button
                onClick={() => setShowClientHub(true)}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm relative"
                title="Confidential communication channel between Client Representative, Head of IXR, and CEO."
              >
                <Lock className="h-3.5 w-3.5 text-amber-600" />
                <span className="hidden sm:inline">Client Direct Hub</span>
                <span className="sm:hidden">Client Hub</span>
                {clientComms.filter(c => c.status === 'pending').length > 0 && (
                  <span className="h-4 min-w-[16px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {clientComms.filter(c => c.status === 'pending').length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={handleExportCSV}
              title="Export filtered assets to CSV / Excel spreadsheet"
              className="px-2.5 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Download className="h-3.5 w-3.5 text-primary" />
              <span className="hidden md:inline">Export CSV</span>
            </button>

            <button
              onClick={() => setIsCreatingItem(true)}
              className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Asset</span>
            </button>
          </div>
        </div>

        {/* TOOLBAR FOR STUDIO MODE */}
        {primaryMode === 'studio' ? (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              {/* Search bar */}
              <div className="relative flex-1 min-w-[200px] max-w-md">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets, instructions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary"
                />
              </div>

              {/* Speed filter pills */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setQuickFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    quickFilter === 'all'
                      ? 'bg-foreground text-background shadow-xs'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  All ({workItems.length})
                </button>
                <button
                  onClick={() => setQuickFilter('my_queue')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    quickFilter === 'my_queue'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>🎯 My Queue</span>
                  <span className="px-1 py-0.2 rounded-full text-[10px] bg-primary/20">{myQueueCount}</span>
                </button>
                <button
                  onClick={() => setQuickFilter('blockers')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    quickFilter === 'blockers'
                      ? 'bg-red-500 text-white shadow-xs'
                      : 'bg-card border border-red-500/30 text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  <span>🚨 Blockers</span>
                  <span className="px-1 py-0.2 rounded-full text-[10px] bg-red-500/20">{blockersCount}</span>
                </button>
                <button
                  onClick={() => setQuickFilter('parallel')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    quickFilter === 'parallel'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-card border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                  }`}
                >
                  <span>⚡ Parallel</span>
                  <span className="px-1 py-0.2 rounded-full text-[10px] bg-emerald-500/20">{parallelCount}</span>
                </button>
                <button
                  onClick={() => setQuickFilter('review')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    quickFilter === 'review'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-card border border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10'
                  }`}
                >
                  <span>⏳ In Review</span>
                  <span className="px-1 py-0.2 rounded-full text-[10px] bg-purple-500/20">{pendingReviewCount}</span>
                </button>
                <button
                  onClick={() => setQuickFilter('approved')}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    quickFilter === 'approved'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>✓ Approved ({approvedCount})</span>
                </button>
              </div>

              {/* Advanced Filters Toggle Button */}
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`ml-auto px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  showAdvancedFilters
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <SlidersHorizontal className="h-3 w-3" />
                <span>Filters</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>

              {/* Table Density Switch (for Excel mode) */}
              {viewMode === 'excel' && (
                <button
                  onClick={() => setTableDensity(prev => prev === 'comfortable' ? 'compact' : 'comfortable')}
                  className="px-2.5 py-1 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-medium transition cursor-pointer"
                  title="Toggle table row height"
                >
                  {tableDensity === 'comfortable' ? 'Dense View' : 'Comfort View'}
                </button>
              )}
            </div>

            {/* Collapsible Advanced Filters Drawer */}
            {showAdvancedFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 p-3 bg-muted/40 border border-border rounded-xl animate-in slide-in-from-top-1 duration-150">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Class / Subject</label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => setSelectedClassId(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Classes & Batches ({classes.length})</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.code} · {c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Asset Type</label>
                  <select
                    value={assetTypeFilter}
                    onChange={(e) => setAssetTypeFilter(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Asset Types</option>
                    <option value="video">Videos / 3D Animation</option>
                    <option value="audio">Voiceover / Audio Tracks</option>
                    <option value="quiz">Interactive Quizzes</option>
                    <option value="interactive_module">Interactive Labs</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Review Tier</label>
                  <select
                    value={reviewStageFilter}
                    onChange={(e) => setReviewStageFilter(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">All Review Tiers</option>
                    <option value="L1">L1: Tech Audio/Video</option>
                    <option value="L2">L2: Handbook Accuracy</option>
                    <option value="L3">L3: Quiz Logic</option>
                    <option value="L4">L4: Final Signoff</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1">Role Scope</label>
                  <select
                    value={roleQueueFilter}
                    onChange={(e) => setRoleQueueFilter(e.target.value)}
                    className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground text-xs focus:outline-none focus:border-primary cursor-pointer"
                  >
                    <option value="all">Full Team Queue</option>
                    <option value="my_work">Assigned to Me</option>
                    <option value="my_reviews">Pending My Review</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* FOCUS MODE HEADER BANNER */
          <div className="flex items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-foreground">Focus Deck for {currentUser?.full_name}</span>
                <span className="text-muted-foreground ml-1.5">({currentUser?.designation})</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                ⚡ Focused Action View
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Viewport: Focus Deck OR Studio Modes (Excel Table / Jira Kanban / Chapter Hierarchy) */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        
        {primaryMode === 'focus' ? (
          /* FOCUS MODE COCKPIT */
          <div className="space-y-6 max-w-7xl mx-auto">
            
            {/* Focus Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.04] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Assigned to Me</p>
                  <p className="text-2xl font-black text-primary mt-0.5">{myAssignedDeliverables.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  ⚡
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Awaiting My Review</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-0.5">{myPendingReviews.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  🎯
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/[0.04] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Blockers</p>
                  <p className="text-2xl font-black text-red-500 mt-0.5">{criticalBlockerItems.length}</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                  🚨
                </div>
              </div>
            </div>

            {/* Section 1: My Active Deliverables */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <CheckSquare className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    1. My Active Deliverables ({myAssignedDeliverables.length})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">Assets assigned to you in production or rework</span>
              </div>

              {myAssignedDeliverables.length === 0 ? (
                <div className="p-6 rounded-2xl border border-border bg-card/60 text-center text-xs text-muted-foreground">
                  <Check className="h-8 w-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-foreground">No active deliverables in your queue</p>
                  <p className="text-[11px] mt-0.5">You have cleared all your assigned production tasks.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {myAssignedDeliverables.map(item => {
                    const firstRemark = (item.remarks || []).find(r => r.status === 'open');
                    const chap = chapters.find(c => c.id === item.chapter_id);

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl border border-border bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              {chap ? `Ch. ${chap.chapter_number}` : 'Project'} · {item.chapter_track?.replace('_', ' ').toUpperCase() || item.asset_type}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.status === 'approved' ? 'bg-emerald-500/15 text-emerald-600' :
                              item.status === 'review_in_progress' ? 'bg-purple-500/15 text-purple-600' :
                              'bg-blue-500/15 text-blue-600'
                            }`}>
                              v{item.latest_version_number || 1} · {item.current_review_stage || item.status}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                            {item.instruction_text}
                          </p>

                          {firstRemark && (
                            <div className="mt-2.5 p-2 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-[11px] text-red-600 dark:text-red-400">
                              <span className="font-bold">Open Remark: </span>
                              <span className="truncate block">{firstRemark.remark_text}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-2">
                          <button
                            onClick={() => setActiveReviewItem(item)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                          >
                            <span>Review Drawer</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>

                          {item.status !== 'review_in_progress' && item.status !== 'approved' && (
                            <button
                              onClick={() => handleInlineStatusChange(item.id, 'review_in_progress')}
                              className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
                              title="Mark draft ready for reviewer QC"
                            >
                              Ready for QC
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Awaiting My Review Sign-off */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600">
                    <Video className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    2. Awaiting My Review Sign-Off ({myPendingReviews.length})
                  </h3>
                </div>
                <span className="text-xs text-muted-foreground">Deliverables where your review gate is required</span>
              </div>

              {myPendingReviews.length === 0 ? (
                <div className="p-6 rounded-2xl border border-border bg-card/60 text-center text-xs text-muted-foreground">
                  <Check className="h-8 w-8 text-emerald-500 mx-auto mb-1.5" />
                  <p className="font-bold text-foreground">No deliverables pending your review</p>
                  <p className="text-[11px] mt-0.5">All items submitted to your queue have been signed off.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {myPendingReviews.map(item => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-purple-500/30 bg-card shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-600">
                            Tier: {item.current_review_stage}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-muted-foreground">
                            v{item.latest_version_number || 1}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground line-clamp-1">{item.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          Assigned to: <span className="font-medium text-foreground">{getProfileName(item.assignee_ids[0])}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveReviewItem(item)}
                        className="w-full px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>Inspect & Sign Off</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Critical Blockers */}
            {criticalBlockerItems.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    3. Project Critical Blockers ({criticalBlockerItems.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {criticalBlockerItems.map(item => {
                    const blocker = (item.remarks || []).find(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'));
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveReviewItem(item)}
                        className="p-3.5 rounded-2xl border border-red-500/30 bg-red-500/[0.03] hover:border-red-500 transition cursor-pointer flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-500 text-white">
                              BLOCKER
                            </span>
                            <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                          </div>
                          <p className="text-[11px] text-red-600 dark:text-red-400 truncate">
                            {blocker ? `[${blocker.review_stage}] ${blocker.remark_text}` : 'Pending revision required'}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-red-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* STUDIO OVERVIEW (Batch Bar, Excel, Kanban, Chapter Hierarchy) */
          <>
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
              <>
                {/* Chapter Selector Tabs & Expand/Collapse All */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-2.5 rounded-2xl border border-border/80">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    <button
                      onClick={() => setSelectedChapterTab('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                        selectedChapterTab === 'all'
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      All Chapters ({chapters.length})
                    </button>
                    {chapters.map(chapter => {
                      const chapterItems = workItems.filter(i => i.chapter_id === chapter.id);
                      const cleared = chapterItems.filter(i => i.status === 'approved' || i.status === 'delivered').length;
                      const pct = chapterItems.length > 0 ? Math.round((cleared / Math.max(chapterItems.length, 12)) * 100) : 0;
                      return (
                        <button
                          key={chapter.id}
                          onClick={() => setSelectedChapterTab(chapter.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                            selectedChapterTab === chapter.id
                              ? 'bg-primary text-primary-foreground shadow-xs'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <span>Ch. {chapter.chapter_number}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            selectedChapterTab === chapter.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                          }`}>
                            {pct}%
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={toggleAllChapters}
                      className="px-2.5 py-1.5 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{collapsedChapters.length === chapters.length ? 'Expand All' : 'Collapse All'}</span>
                    </button>
                  </div>
                </div>

                {/* Filtered Chapter Cards */}
                {chapters
                  .filter(c => selectedChapterTab === 'all' || c.id === selectedChapterTab)
                  .map(chapter => {
                    const chapterItems = workItems.filter(i => i.chapter_id === chapter.id);
                    const approvedCount = chapterItems.filter(i => i.status === 'approved' || i.status === 'delivered').length;
                    const totalTracks = 12; // 1 Script + 4 Video + 2 Audio + 4 Quiz + 1 HB
                    const progressPct = chapterItems.length > 0 ? Math.round((approvedCount / Math.max(chapterItems.length, totalTracks)) * 100) : 0;
                    const isCollapsed = collapsedChapters.includes(chapter.id);

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

                    // Department Cleared Counts
                    const videoCleared = [vidL1, vidL2, vidL3, vidL4].filter(i => i && (i.status === 'approved' || i.status === 'delivered')).length;
                    const audioCleared = [audL1, audL2].filter(i => i && (i.status === 'approved' || i.status === 'delivered')).length;
                    const quizCleared = [quizGen, quizRev, quizImp, quizTest].filter(i => i && (i.status === 'approved' || i.status === 'delivered')).length;

                    // Render track card helper with clear semantic status & stepper identity
                    const renderTrackNode = (stepCode: string, stageTitle: string, item?: WorkItem) => {
                      if (!item) {
                        return (
                          <div className="p-4 rounded-2xl border border-dashed border-border/80 bg-muted/15 flex flex-col justify-between min-h-[135px]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                                  {stepCode}
                                </span>
                                <span className="text-xs font-semibold text-muted-foreground">{stageTitle}</span>
                              </div>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted/80 text-muted-foreground">Unscheduled</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground/60 italic mt-3">Awaiting pipeline queue instantiation</p>
                          </div>
                        );
                      }

                      const isApproved = item.status === 'approved' || item.status === 'delivered';
                      const openRemarks = (item.remarks || []).filter(r => r.status === 'open').length;
                      const hasBlocker = (item.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'));
                      const hasConfidentialRemark = isPrivilegedRole && (item.remarks || []).some(r => r.is_confidential && r.status === 'open');

                      // Unified Semantic Status Styling (Clean & high-contrast)
                      let statusBadge: React.ReactNode;
                      let cardBorder = 'border-border/80 hover:border-foreground/30';
                      let cardBg = 'bg-card';

                      if (isApproved) {
                        cardBorder = 'border-emerald-500/40 hover:border-emerald-500';
                        cardBg = 'bg-card hover:bg-emerald-500/[0.02]';
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <Check className="h-3 w-3" /> Approved
                          </span>
                        );
                      } else if (hasBlocker || openRemarks > 0) {
                        cardBorder = hasBlocker ? 'border-rose-500/50 hover:border-rose-500' : 'border-amber-500/50 hover:border-amber-500';
                        cardBg = hasBlocker ? 'bg-rose-500/[0.02] hover:bg-rose-500/[0.04]' : 'bg-card';
                        statusBadge = (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            hasBlocker
                              ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${hasBlocker ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                            {openRemarks} {hasBlocker ? 'Blocker' : 'Remark'}{openRemarks > 1 ? 's' : ''}
                          </span>
                        );
                      } else if (item.status === 'review_in_progress') {
                        cardBorder = 'border-primary/40 hover:border-primary';
                        cardBg = 'bg-card hover:bg-primary/[0.02]';
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Tier: {item.current_review_stage || 'In Review'}
                          </span>
                        );
                      } else {
                        // Draft in progress
                        cardBorder = 'border-border/80 hover:border-foreground/30';
                        cardBg = 'bg-card';
                        statusBadge = (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                            In Production
                          </span>
                        );
                      }

                      return (
                        <div
                          onClick={() => setActiveReviewItem(item)}
                          className={`p-4 rounded-2xl border ${cardBorder} ${cardBg} transition-all cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px] group relative select-none`}
                        >
                          <div>
                            {/* Step Indicator and Status Pill */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted border border-border text-foreground shrink-0">
                                  {stepCode}
                                </span>
                                <span className="text-[11px] font-semibold text-muted-foreground truncate">
                                  {stageTitle}
                                </span>
                              </div>

                              <div className="shrink-0">
                                {statusBadge}
                              </div>
                            </div>

                            {/* Deliverable Title */}
                            <h5 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {item.title}
                            </h5>
                          </div>

                          {/* Footer Info: Assignee, Version, Client Direct flag */}
                          <div className="pt-2.5 mt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-5 w-5 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-[9px] shrink-0">
                                {getProfileName(item.assignee_ids[0]).slice(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate text-muted-foreground text-[11px]">
                                {getProfileName(item.assignee_ids[0]).split(' ')[0]}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {hasConfidentialRemark && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/30" title="Confidential Client note exists">
                                  🔒 Direct
                                </span>
                              )}
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                                v{item.latest_version_number || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    };

                    return (
                      <div key={chapter.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                        {/* Chapter Header Banner (Clickable Accordion) */}
                        <div
                          onClick={() => toggleChapterCollapse(chapter.id)}
                          className="p-4 md:p-5 bg-muted/30 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-muted/50 transition select-none"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-1.5 rounded-lg bg-card border border-border text-muted-foreground transition-transform duration-200 shrink-0 ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                              <ChevronDown className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
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
                              <h3 className="text-base font-bold text-foreground truncate">{chapter.title}</h3>
                              {!isCollapsed && (
                                <p className="text-xs text-muted-foreground max-w-3xl mt-0.5 line-clamp-1">{chapter.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Progress Gauge and Collapsed Quick Summary */}
                          <div className="flex items-center gap-4 shrink-0 self-end md:self-auto">
                            {isCollapsed && (
                              <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                <span className="px-2 py-0.5 rounded bg-muted">Video {videoCleared}/4</span>
                                <span className="px-2 py-0.5 rounded bg-muted">Audio {audioCleared}/2</span>
                                <span className="px-2 py-0.5 rounded bg-muted">Quiz {quizCleared}/4</span>
                              </div>
                            )}

                            <div className="flex flex-col md:items-end gap-1.5 shrink-0">
                              <div className="flex items-center gap-2 text-xs font-bold">
                                <span className="text-primary font-mono">{approvedCount}/{chapterItems.length} Cleared</span>
                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">{progressPct}%</span>
                              </div>
                              <div className="w-36 md:w-44 h-2 bg-muted rounded-full overflow-hidden border border-border">
                                <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Chapter Tracks Matrix (Expandable) */}
                        {!isCollapsed && (
                          <div className="p-4 md:p-6 space-y-6">
                            
                            {/* Pod 1: Script & Editorial Foundation */}
                            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                                    <FileText className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground">
                                      Pod 1 · Editorial & Narrative Direction
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      Foundational pedagogical script & final executive handbook clearance (HB Review)
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted border border-border text-foreground self-start sm:self-auto shrink-0">
                                  {[scriptItem, hbItem].filter(i => i && (i.status === 'approved' || i.status === 'delivered')).length}/2 Cleared
                                </span>
                              </div>

                              <div className="p-4 md:p-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {renderTrackNode('Script', 'Script Draft & Storyboard', scriptItem)}
                                  {renderTrackNode('HB', 'HB Final Director Clearance', hbItem)}
                                </div>
                              </div>
                            </div>

                            {/* Pod 2: Video Production Pipeline (L1 -> L4) */}
                            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
                                    <Video className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground">
                                      Pod 2 · Video Multi-Level Production Pipeline
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      L1 Tech QC ➔ L2 3D Motion & VFX ➔ L3 Visual Polish ➔ L4 4K Master Grading
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 self-start sm:self-auto shrink-0">
                                  {videoCleared}/4 Cleared
                                </span>
                              </div>

                              <div className="p-4 md:p-5 space-y-4">
                                {/* Horizontal Pipeline Stepper */}
                                <div className="hidden sm:flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs font-semibold text-muted-foreground">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground shrink-0">Workflow Stage:</span>
                                  <div className="flex items-center gap-2 flex-1 max-w-xl justify-between">
                                    <span className={`flex items-center gap-1 ${vidL1?.status === 'approved' ? 'text-emerald-600 font-bold' : vidL1 ? 'text-primary font-bold' : ''}`}>
                                      {vidL1?.status === 'approved' ? '✓' : '1.'} Tech QC
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${vidL2?.status === 'approved' ? 'text-emerald-600 font-bold' : vidL2 ? 'text-primary font-bold' : ''}`}>
                                      {vidL2?.status === 'approved' ? '✓' : '2.'} 3D Motion
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${vidL3?.status === 'approved' ? 'text-emerald-600 font-bold' : vidL3 ? 'text-primary font-bold' : ''}`}>
                                      {vidL3?.status === 'approved' ? '✓' : '3.'} Visual Polish
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${vidL4?.status === 'approved' ? 'text-emerald-600 font-bold' : vidL4 ? 'text-primary font-bold' : ''}`}>
                                      {vidL4?.status === 'approved' ? '✓' : '4.'} 4K Master
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                  {renderTrackNode('L1', 'Tech QC Rough Cut', vidL1)}
                                  {renderTrackNode('L2', '3D Motion & VFX', vidL2)}
                                  {renderTrackNode('L3', 'Visual Polish & Sync', vidL3)}
                                  {renderTrackNode('L4', '4K Master Grade', vidL4)}
                                </div>
                              </div>
                            </div>

                            {/* Pod 3: Audio & Sound Pipeline (L1 -> L2) */}
                            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                                    <Mic className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground">
                                      Pod 3 · Audio & Voiceover Pipeline
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      L1 Voiceover Recording & EQ ➔ L2 SFX & Ambience Spatial Mix
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 self-start sm:self-auto shrink-0">
                                  {audioCleared}/2 Cleared
                                </span>
                              </div>

                              <div className="p-4 md:p-5 space-y-4">
                                {/* Audio Stepper */}
                                <div className="hidden sm:flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs font-semibold text-muted-foreground">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground shrink-0">Audio Mix Flow:</span>
                                  <div className="flex items-center gap-3 flex-1 max-w-sm justify-between">
                                    <span className={`flex items-center gap-1 ${audL1?.status === 'approved' ? 'text-emerald-600 font-bold' : audL1 ? 'text-primary font-bold' : ''}`}>
                                      {audL1?.status === 'approved' ? '✓' : '1.'} Voiceover EQ
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${audL2?.status === 'approved' ? 'text-emerald-600 font-bold' : audL2 ? 'text-primary font-bold' : ''}`}>
                                      {audL2?.status === 'approved' ? '✓' : '2.'} SFX & Ambience Mix
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                  {renderTrackNode('L1', 'Voiceover & Dialogue EQ', audL1)}
                                  {renderTrackNode('L2', 'Sound Design & Ambience', audL2)}
                                </div>
                              </div>
                            </div>

                            {/* Pod 4: Interactive Quiz & Pedagogical QA */}
                            <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
                              <div className="p-4 bg-muted/30 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                    <CheckSquare className="h-4 w-4" />
                                  </span>
                                  <div>
                                    <h4 className="text-sm font-bold text-foreground">
                                      Pod 4 · Interactive Quiz & Pedagogical Assessment
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                      Question Generation ➔ Subject SME Review ➔ Interactive Engine Code ➔ QA Validation
                                    </p>
                                  </div>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto shrink-0">
                                  {quizCleared}/4 Cleared
                                </span>
                              </div>

                              <div className="p-4 md:p-5 space-y-4">
                                {/* Quiz Stepper */}
                                <div className="hidden sm:flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs font-semibold text-muted-foreground">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground shrink-0">Pedagogy Flow:</span>
                                  <div className="flex items-center gap-2 flex-1 max-w-xl justify-between">
                                    <span className={`flex items-center gap-1 ${quizGen?.status === 'approved' ? 'text-emerald-600 font-bold' : quizGen ? 'text-primary font-bold' : ''}`}>
                                      {quizGen?.status === 'approved' ? '✓' : '1.'} Generation
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${quizRev?.status === 'approved' ? 'text-emerald-600 font-bold' : quizRev ? 'text-primary font-bold' : ''}`}>
                                      {quizRev?.status === 'approved' ? '✓' : '2.'} SME Review
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${quizImp?.status === 'approved' ? 'text-emerald-600 font-bold' : quizImp ? 'text-primary font-bold' : ''}`}>
                                      {quizImp?.status === 'approved' ? '✓' : '3.'} Implementation
                                    </span>
                                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                                    <span className={`flex items-center gap-1 ${quizTest?.status === 'approved' ? 'text-emerald-600 font-bold' : quizTest ? 'text-primary font-bold' : ''}`}>
                                      {quizTest?.status === 'approved' ? '✓' : '4.'} Testing QA
                                    </span>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                                  {renderTrackNode('Gen', 'Question Design (SME)', quizGen)}
                                  {renderTrackNode('Rev', 'Pedagogical Review', quizRev)}
                                  {renderTrackNode('Impl', 'Interactive Engine Dev', quizImp)}
                                  {renderTrackNode('QA', 'Edge-Case & QA Test', quizTest)}
                                </div>
                              </div>
                            </div>

                          </div>
                        )}
                      </div>
                    );
                  })}
              </>
            )}
          </div>
        )}
      </>
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
