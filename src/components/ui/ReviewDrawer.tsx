import React, { useState } from 'react';
import type { WorkItem, ReviewSeverity } from '../../types/database';
import { dbClient } from '../../services/dbClient';
import { useAuth } from '../../context/AuthContext';
import {
  X, Clock, MessageSquare, ArrowRight,
  Upload, ExternalLink, ShieldCheck, Sparkles, FileText, Check, Lock, Eye
} from 'lucide-react';

interface ReviewDrawerProps {
  item: WorkItem;
  onClose: () => void;
  onItemUpdated: (updated: WorkItem) => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({ item, onClose, onItemUpdated }) => {
  const { currentUser, profiles } = useAuth();

  const isPrivilegedRole = currentUser?.role === 'client' || currentUser?.role === 'head' || currentUser?.email?.toLowerCase().includes('ashish.garg');

  const [activeTab, setActiveTab] = useState<'review' | 'versions' | 'handoff' | 'instructions'>('review');
  const [selectedVersion, setSelectedVersion] = useState<number>(item.latest_version_number || 1);

  // New Remark form state
  const [remarkText, setRemarkText] = useState('');
  const [targetRef, setTargetRef] = useState('');
  const [timestampMinutes, setTimestampMinutes] = useState('');
  const [timestampSeconds, setTimestampSeconds] = useState('');
  const [severity, setSeverity] = useState<ReviewSeverity>('correction');
  const [reviewStage, setReviewStage] = useState<string>(item.current_review_stage || 'L1');
  const [isConfidentialRemark, setIsConfidentialRemark] = useState<boolean>(currentUser?.role === 'client');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);

  // New Version form state
  const [versionNotes, setVersionNotes] = useState('');
  const [versionPreviewUrl, setVersionPreviewUrl] = useState('');
  const [versionSourceUrl, setVersionSourceUrl] = useState('');
  const [isUploadingVersion, setIsUploadingVersion] = useState(false);

  // Role Handoff form state
  const [handoffToUser, setHandoffToUser] = useState('');
  const [handoffBriefing, setHandoffBriefing] = useState('');
  const [handoffReason, setHandoffReason] = useState('Workload rebalancing');
  const [isHandoffSaving, setIsHandoffSaving] = useState(false);

  const getProfileName = (id: string) => {
    return profiles.find(p => p.id === id)?.full_name || 'Team Member';
  };

  const currentVersionObj = (item.versions || []).find(v => v.version_number === selectedVersion) || (item.versions || [])[0];
  
  // Filter remarks: confidential remarks are strictly hidden from non-privileged team members (editors, testers)
  const remarksForCurrentVer = (item.remarks || [])
    .filter(r => r.version_number === selectedVersion)
    .filter(r => {
      if (r.is_confidential) {
        return isPrivilegedRole;
      }
      return true;
    });

  const openRemarksCount = remarksForCurrentVer.filter(r => r.status === 'open').length;

  // Handle adding a new timestamped / target remark
  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim() || !currentUser) return;

    setIsSubmittingRemark(true);
    try {
      let totalSeconds: number | undefined = undefined;
      if (timestampMinutes || timestampSeconds) {
        const m = parseInt(timestampMinutes || '0', 10);
        const s = parseInt(timestampSeconds || '0', 10);
        totalSeconds = m * 60 + s;
      }

      const newRemark = await dbClient.addReviewRemark(item.id, {
        version_number: selectedVersion,
        review_stage: reviewStage,
        timestamp_seconds: totalSeconds,
        target_ref: targetRef.trim() || undefined,
        remark_text: remarkText.trim(),
        severity,
        status: 'open',
        author_id: currentUser.id,
        is_confidential: isPrivilegedRole ? isConfidentialRemark : false
      });

      const updatedRemarks = [...(item.remarks || []), newRemark];
      const updatedItem = { ...item, remarks: updatedRemarks };
      onItemUpdated(updatedItem);

      // Reset form
      setRemarkText('');
      setTargetRef('');
      setTimestampMinutes('');
      setTimestampSeconds('');
    } catch (err) {
      console.error('Error adding remark:', err);
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  // Convert confidential remark into public team remark (sanitized)
  const handleMakeRemarkPublic = async (remarkId: string) => {
    if (!currentUser) return;
    try {
      const updatedRemarks = (item.remarks || []).map(r => {
        if (r.id === remarkId) {
          return { ...r, is_confidential: false };
        }
        return r;
      });
      const updatedItem = { ...item, remarks: updatedRemarks };
      await dbClient.updateWorkItem(item.id, { remarks: updatedRemarks } as any, currentUser.id);
      onItemUpdated(updatedItem);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle remark resolution
  const handleToggleRemarkStatus = async (remarkId: string, currentStatus: string) => {
    if (!currentUser) return;
    const nextStatus = currentStatus === 'resolved' ? 'open' : 'resolved';
    try {
      await dbClient.updateRemarkStatus(item.id, remarkId, nextStatus, currentUser.id, selectedVersion);
      const updatedRemarks = (item.remarks || []).map(r => {
        if (r.id === remarkId) {
          return {
            ...r,
            status: nextStatus as any,
            resolved_by: nextStatus === 'resolved' ? currentUser.id : undefined,
            resolved_in_version: nextStatus === 'resolved' ? selectedVersion : undefined
          };
        }
        return r;
      });
      onItemUpdated({ ...item, remarks: updatedRemarks });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle uploading version v2, v3...
  const handleUploadVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsUploadingVersion(true);
    try {
      const newVer = await dbClient.uploadAssetVersion(item.id, {
        notes: versionNotes.trim() || `Draft version ${item.latest_version_number + 1}`,
        preview_url: versionPreviewUrl.trim() || undefined,
        source_file_url: versionSourceUrl.trim() || undefined,
        uploaded_by: currentUser.id
      });

      const nextVerNum = item.latest_version_number + 1;
      const updatedItem: WorkItem = {
        ...item,
        latest_version_number: nextVerNum,
        status: 'review_in_progress',
        versions: [...(item.versions || []), newVer]
      };
      setSelectedVersion(nextVerNum);
      onItemUpdated(updatedItem);

      setVersionNotes('');
      setVersionPreviewUrl('');
      setVersionSourceUrl('');
      setActiveTab('review');
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingVersion(false);
    }
  };

  // Handle 1-Click Role Handoff
  const handleExecuteHandoff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !handoffToUser) return;

    setIsHandoffSaving(true);
    try {
      const handover = await dbClient.executeRoleHandoff(
        item.id,
        currentUser.id,
        handoffToUser,
        handoffBriefing.trim() || 'Role reassigned mid-project.',
        handoffReason
      );

      const nextAssignees = Array.from(new Set([...item.assignee_ids.filter(id => id !== currentUser.id), handoffToUser]));
      const updatedItem: WorkItem = {
        ...item,
        assignee_ids: nextAssignees,
        handovers: [handover, ...(item.handovers || [])]
      };
      onItemUpdated(updatedItem);
      setHandoffBriefing('');
      setActiveTab('review');
    } catch (err) {
      console.error(err);
    } finally {
      setIsHandoffSaving(false);
    }
  };

  // Update Review Stage (e.g. L1 -> L2 -> L3 -> Approved)
  const handleStageChange = async (newStage: string) => {
    try {
      let nextStatus = item.status;
      if (newStage === 'Approved' || newStage === 'L4: Final Signoff') {
        nextStatus = 'approved';
      } else {
        nextStatus = 'review_in_progress';
      }
      const updated = await dbClient.updateWorkItem(item.id, {
        current_review_stage: newStage,
        status: nextStatus
      }, currentUser?.id || '');
      onItemUpdated({ ...item, ...updated });
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (sev: ReviewSeverity) => {
    switch (sev) {
      case 'blocker':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/20">BLOCKER</span>;
      case 'correction':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">CORRECTION</span>;
      case 'suggestion':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">SUGGESTION</span>;
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-muted text-muted-foreground">NOTE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-3xl bg-card border-l border-border h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {item.asset_type.toUpperCase()}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' :
                item.status === 'review_in_progress' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' :
                'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
              }`}>
                {item.status.replace(/_/g, ' ').toUpperCase()}
              </span>
              {item.is_parallel_review_allowed ? (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  ⚡ Parallel Review Allowed
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  🔒 Sequential Review Gate
                </span>
              )}
            </div>
            <h2 className="text-base font-bold text-foreground truncate">{item.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stage Stepper Navigation Bar */}
        <div className="px-4 py-2.5 bg-muted/40 border-b border-border flex items-center justify-between gap-2 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-muted-foreground mr-1">Approval Stage:</span>
            {['L1: Tech Check', 'L2: HB Accuracy', 'L3: Quiz Logic', 'Approved'].map((stageName, idx) => {
              const isCurrent = item.current_review_stage?.includes(`L${idx + 1}`) || (stageName === 'Approved' && item.status === 'approved');
              return (
                <button
                  key={stageName}
                  onClick={() => handleStageChange(stageName)}
                  className={`px-2.5 py-1 rounded-md font-medium text-xs transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                  }`}
                >
                  {stageName}
                </button>
              );
            })}
          </div>

          {/* Open Remarks counter */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              openRemarksCount > 0 ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              {openRemarksCount} Open Remarks
            </span>
          </div>
        </div>

        {/* Sub-Tabs: Review, Versions, Handover, Instructions */}
        <div className="flex border-b border-border px-4 bg-card text-xs font-semibold">
          <button
            onClick={() => setActiveTab('review')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'review' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Review & Remarks ({remarksForCurrentVer.length})
          </button>

          <button
            onClick={() => setActiveTab('versions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'versions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Versions ({item.latest_version_number})
          </button>

          <button
            onClick={() => setActiveTab('handoff')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'handoff' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            1-Click Handover ({item.handovers?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'instructions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            Instructions (v{item.instruction_version})
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: FRAME.IO STYLE REVIEW & TIMESTAMPS */}
          {activeTab === 'review' && (
            <div className="space-y-4">
              
              {/* Version Switcher Bar */}
              <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-lg border border-border">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Viewing Version:</span>
                  <div className="flex items-center gap-1">
                    {(item.versions || []).map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVersion(v.version_number)}
                        className={`px-2 py-0.5 text-xs font-bold rounded cursor-pointer ${
                          selectedVersion === v.version_number
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        v{v.version_number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* External link buttons */}
                <div className="flex items-center gap-2 text-xs">
                  {item.drive_folder_url && (
                    <a
                      href={item.drive_folder_url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Drive Assets
                    </a>
                  )}
                </div>
              </div>

              {/* Version Media Preview Container */}
              {currentVersionObj?.preview_url && (
                <div className="rounded-xl overflow-hidden border border-border bg-black/40 relative aspect-video flex items-center justify-center group">
                  <img
                    src={currentVersionObj.preview_url}
                    alt="Asset Draft Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-80 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-[11px] text-white">
                      <span className="bg-black/60 backdrop-blur px-2 py-0.5 rounded font-mono">
                        Draft v{selectedVersion}
                      </span>
                      <span className="text-white/80">Uploaded by {getProfileName(currentVersionObj.uploaded_by)}</span>
                    </div>

                    <div className="text-xs text-white/90 bg-black/60 backdrop-blur p-2 rounded">
                      <p className="line-clamp-2">{currentVersionObj.notes || 'No release notes for this draft.'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Add New Timestamped Remark Form */}
              <form onSubmit={handleAddRemark} className="bg-card border border-border rounded-xl p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> Add Timestamped / Section Remark
                  </span>
                  <div className="flex items-center gap-2">
                    {isPrivilegedRole && (
                      <button
                        type="button"
                        onClick={() => setIsConfidentialRemark(!isConfidentialRemark)}
                        className={`text-[10px] font-bold px-2 py-1 rounded border flex items-center gap-1 cursor-pointer transition-colors ${
                          isConfidentialRemark
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-muted/50 text-muted-foreground border-border hover:text-foreground'
                        }`}
                        title="When enabled, this remark is strictly hidden from production editors and only visible to Client, Head, and CEO."
                      >
                        <Lock className="h-2.5 w-2.5" />
                        {isConfidentialRemark ? '🔒 Client/Leads Only' : '👥 Team Public'}
                      </button>
                    )}

                    <select
                      value={reviewStage}
                      onChange={(e) => setReviewStage(e.target.value)}
                      className="text-xs bg-muted border border-border rounded px-2 py-1 font-medium text-foreground cursor-pointer"
                    >
                      <option value="L1">Tier: L1 (Tech QC)</option>
                      <option value="L2">Tier: L2 (HB Accuracy)</option>
                      <option value="L3">Tier: L3 (Quiz Logic)</option>
                      <option value="L4">Tier: L4 (Final Signoff)</option>
                    </select>
                    
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as any)}
                      className="text-xs bg-muted border border-border rounded px-2 py-1 font-medium text-foreground cursor-pointer"
                    >
                      <option value="correction">Correction</option>
                      <option value="blocker">Blocker 🚨</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="nitpick">Nitpick</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="flex items-center gap-1 bg-muted/40 border border-border rounded px-2 py-1">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="number"
                      placeholder="MM"
                      min="0"
                      value={timestampMinutes}
                      onChange={(e) => setTimestampMinutes(e.target.value)}
                      className="w-10 bg-transparent text-xs text-center focus:outline-none"
                    />
                    <span className="text-muted-foreground font-mono">:</span>
                    <input
                      type="number"
                      placeholder="SS"
                      min="0"
                      max="59"
                      value={timestampSeconds}
                      onChange={(e) => setTimestampSeconds(e.target.value)}
                      className="w-10 bg-transparent text-xs text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-muted-foreground ml-auto">Timestamp</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Ref (e.g. Question 4, Intro VO)"
                    value={targetRef}
                    onChange={(e) => setTargetRef(e.target.value)}
                    className="md:col-span-2 text-xs bg-muted/40 border border-border rounded px-3 py-1 text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <textarea
                  rows={2}
                  placeholder="Describe the revision needed (e.g., 'Lower background music at 01:24, verify formula subscript')..."
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  className="w-full text-xs bg-muted/40 border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingRemark || !remarkText.trim()}
                    className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-3 w-3" /> Post Remark
                  </button>
                </div>
              </form>

              {/* Timeline of Remarks for Current Version */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                  <span>Remarks for Version {selectedVersion} ({remarksForCurrentVer.length})</span>
                  <span>Click checkbox when resolved in next cut</span>
                </div>

                {remarksForCurrentVer.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                    No remarks logged on version {selectedVersion}. Looks clean!
                  </div>
                ) : (
                  remarksForCurrentVer.map((remark) => {
                    const isResolved = remark.status === 'resolved';
                    const mins = remark.timestamp_seconds !== undefined ? Math.floor(remark.timestamp_seconds / 60) : null;
                    const secs = remark.timestamp_seconds !== undefined ? remark.timestamp_seconds % 60 : null;
                    const formattedTime = mins !== null && secs !== null 
                      ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
                      : null;

                    return (
                      <div
                        key={remark.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isResolved
                            ? 'bg-muted/30 border-border/50 opacity-60'
                            : 'bg-card border-border hover:border-primary/40 shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Resolve Checkbox */}
                          <button
                            type="button"
                            onClick={() => handleToggleRemarkStatus(remark.id, remark.status)}
                            className={`mt-0.5 h-4.5 w-4.5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              isResolved
                                ? 'bg-emerald-500 border-emerald-500 text-white'
                                : 'border-muted-foreground/40 hover:border-primary'
                            }`}
                          >
                            {isResolved && <Check className="h-3 w-3" />}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap text-[11px]">
                              <span className="font-bold text-foreground">
                                {getProfileName(remark.author_id)}
                              </span>
                              <span className="text-muted-foreground">·</span>
                              <span className="font-semibold text-primary/90">{remark.review_stage} Review</span>
                              {getSeverityBadge(remark.severity)}

                              {formattedTime && (
                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-bold">
                                  ⏱ {formattedTime}
                                </span>
                              )}

                              {remark.target_ref && (
                                <span className="font-medium text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground border border-border">
                                  📌 {remark.target_ref}
                                </span>
                              )}

                              {remark.is_confidential && (
                                <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                                  <Lock className="h-2.5 w-2.5" /> Confidential
                                </span>
                              )}

                              {isPrivilegedRole && remark.is_confidential && !isResolved && (
                                <button
                                  type="button"
                                  onClick={() => handleMakeRemarkPublic(remark.id)}
                                  className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold ml-auto cursor-pointer"
                                  title="Convert to public team remark so editors can see this note"
                                >
                                  <Eye className="h-2.5 w-2.5" /> Make Team Public
                                </button>
                              )}
                            </div>

                            <p className={`text-xs ${isResolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {remark.remark_text}
                            </p>

                            {isResolved && remark.resolved_in_version && (
                              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                ✓ Resolved in v{remark.resolved_in_version}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 2: VERSIONS UPLOAD & HISTORY */}
          {activeTab === 'versions' && (
            <div className="space-y-4">
              <form onSubmit={handleUploadVersion} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Upload className="h-4 w-4 text-primary" /> Publish Next Draft: Version v{(item.latest_version_number || 1) + 1}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Upload a new version to address pending L1–L4 remarks. Unresolved remarks from previous drafts will automatically carry forward.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                      Preview Image / Embed URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://... (image, video, webgl container)"
                      value={versionPreviewUrl}
                      onChange={(e) => setVersionPreviewUrl(e.target.value)}
                      className="w-full text-xs bg-muted/40 border border-border rounded px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                      Source Project Link (Drive / Dropbox)
                    </label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={versionSourceUrl}
                      onChange={(e) => setVersionSourceUrl(e.target.value)}
                      className="w-full text-xs bg-muted/40 border border-border rounded px-3 py-1.5 text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    Change Summary / Release Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Explain what was fixed in this revision (e.g., 'Fixed Snell law subscript, boosted voiceover at 01:24')..."
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                    className="w-full text-xs bg-muted/40 border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploadingVersion}
                  className="w-full py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 transition cursor-pointer"
                >
                  {isUploadingVersion ? 'Uploading...' : `Publish v${(item.latest_version_number || 1) + 1}`}
                </button>
              </form>

              {/* Version History Cards */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">Version Audit History</span>
                {(item.versions || []).map((ver) => (
                  <div
                    key={ver.id}
                    className="p-3 bg-muted/20 border border-border rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                          v{ver.version_number}
                        </span>
                        <span className="text-muted-foreground">Uploaded by {getProfileName(ver.uploaded_by)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({new Date(ver.created_at).toLocaleDateString()})
                        </span>
                      </div>
                      <p className="text-foreground">{ver.notes || 'Draft cut uploaded.'}</p>
                    </div>

                    {ver.source_file_url && (
                      <a
                        href={ver.source_file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 shrink-0 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" /> Project File
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: 1-CLICK ROLE HANDOFF */}
          {activeTab === 'handoff' && (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                <h4 className="text-xs font-bold text-primary flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="h-4 w-4" /> Zero-Loss Knowledge Transfer
                </h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  When team members rotate, swap shifts, or leave, this feature automatically bundles active draft links, pending reviewer remarks, and custom briefing notes so the incoming teammate can execute instantly without asking questions.
                </p>
              </div>

              <form onSubmit={handleExecuteHandoff} className="bg-card border border-border rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-foreground">Handover Asset to Teammate</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                      Transfer To Teammate
                    </label>
                    <select
                      value={handoffToUser}
                      onChange={(e) => setHandoffToUser(e.target.value)}
                      required
                      className="w-full text-xs bg-muted border border-border rounded px-3 py-1.5 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">Select team member...</option>
                      {profiles
                        .filter(p => p.id !== currentUser?.id)
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.full_name} ({p.designation || p.role})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                      Handover Reason
                    </label>
                    <select
                      value={handoffReason}
                      onChange={(e) => setHandoffReason(e.target.value)}
                      className="w-full text-xs bg-muted border border-border rounded px-3 py-1.5 text-foreground focus:outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="Workload rebalancing">Workload Rebalancing</option>
                      <option value="Shift handover">Shift Handover</option>
                      <option value="Specialist escalation">Specialist Escalation (3D/Physics)</option>
                      <option value="Team turnover">Teammate Rotation / Leave</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground mb-1 block">
                    Handover Briefing Notes & Context
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief the incoming teammate on where source assets are saved, what L2 reviewer requested, and what to finish first..."
                    value={handoffBriefing}
                    onChange={(e) => setHandoffBriefing(e.target.value)}
                    required
                    className="w-full text-xs bg-muted/40 border border-border rounded-lg p-2.5 text-foreground focus:outline-none focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isHandoffSaving || !handoffToUser}
                  className="w-full py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isHandoffSaving ? 'Transferring...' : 'Execute 1-Click Handover'}
                </button>
              </form>

              {/* Handover Logs History */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-foreground">Past Handover Ledger</span>
                {(item.handovers || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No handovers recorded yet for this asset.</p>
                ) : (
                  (item.handovers || []).map((h) => (
                    <div key={h.id} className="p-3 rounded-xl border border-border bg-muted/20 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">
                          {getProfileName(h.from_user_id)} ➔ {getProfileName(h.to_user_id)}
                        </span>
                        <span className="text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-foreground">{h.briefing_notes}</p>
                      <div className="text-[10px] text-muted-foreground flex gap-2">
                        <span>Reason: {h.reason}</span>
                        <span>·</span>
                        <span>State: v{h.current_version} ({h.pending_remarks_count} open remarks)</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: INSTRUCTIONS & BRIEF */}
          {activeTab === 'instructions' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground">Production Script & Brief (v{item.instruction_version})</h3>
                <span className="text-[10px] text-muted-foreground font-mono">Immutable Versioned Brief</span>
              </div>
              <div className="p-4 bg-muted/30 border border-border rounded-xl text-xs text-foreground leading-relaxed whitespace-pre-wrap font-sans">
                {item.instruction_text || 'No special instructions recorded.'}
              </div>

              {item.dependencies && item.dependencies.length > 0 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                  <span className="font-bold">⚠️ Linked Dependencies:</span>
                  <p className="mt-0.5 text-[11px]">
                    This work item depends on output from asset IDs: {item.dependencies.join(', ')}. If timings change, alert downstream quiz and audio creators.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};