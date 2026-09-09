import React, { useState, useEffect, useRef } from 'react';
import { dbClient } from '../../services/dbClient';
import { useAuth } from '../../context/AuthContext';
import type { Message, Channel, WorkItem } from '../../types/database';
import {
  Hash, Lock, Send, Search, Sparkles, Loader2,
  Megaphone, Video, Mic, CheckSquare, Layers, Plus,
  ExternalLink, Users, MessageSquare
} from 'lucide-react';
import { ReviewDrawer } from '../../components/ui/ReviewDrawer';

const ROLE_BADGE_MAP: Record<string, { label: string; color: string }> = {
  client: { label: 'Client Director', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  head: { label: 'Head of IXR', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30' },
  hb_reviewer: { label: 'HB Reviewer', color: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  video_reviewer: { label: 'Video QC Lead', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  video_editor: { label: 'Video Editor', color: 'bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/30' },
  audio_generator: { label: 'Audio / VO', color: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  quiz_implementer: { label: 'Quiz Dev', color: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
  quiz_generator: { label: 'Subject SME', color: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30' },
  growth_specialist: { label: 'Operations', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30' }
};

export const MessagingView: React.FC = () => {
  const { currentUser, profiles } = useAuth();

  const isPrivilegedRole =
    currentUser?.role === 'client' ||
    currentUser?.role === 'head' ||
    currentUser?.designation?.toLowerCase().includes('ceo') ||
    currentUser?.email?.toLowerCase().includes('ashish.garg');

  // Channels and selection state
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-announcements');
  const [activeDMUserId, setActiveDMUserId] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Deliverables / Work Items for Asset Tagging
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [activeReviewItem, setActiveReviewItem] = useState<WorkItem | null>(null);

  // New Channel Dialog State
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanPrivate, setNewChanPrivate] = useState(false);

  // Mobile drawer toggle
  const [showMobileList, setShowMobileList] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Channels and Work Items
  const loadInitialData = async () => {
    try {
      const [chans, items] = await Promise.all([
        dbClient.getChannels(),
        dbClient.getWorkItems()
      ]);
      setChannels(chans);
      setWorkItems(items);

      if (chans.length > 0 && !activeDMUserId) {
        // If current activeChannelId doesn't exist in loaded channels, select first
        if (!chans.some(c => c.id === activeChannelId)) {
          setActiveChannelId(chans[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading channels or work items:', err);
    }
  };

  // Load Messages for Active View (Channel or DM)
  const loadMessages = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      if (activeDMUserId) {
        const msgs = await dbClient.getMessages(undefined, activeDMUserId);
        setMessages(msgs);
        await dbClient.markMessagesAsRead(undefined, activeDMUserId);
      } else if (activeChannelId) {
        const msgs = await dbClient.getMessages(activeChannelId);
        setMessages(msgs);
        await dbClient.markMessagesAsRead(activeChannelId, undefined);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  useEffect(() => {
    loadMessages();
  }, [activeChannelId, activeDMUserId]);

  // Real-time updates subscription
  useEffect(() => {
    const unsub = dbClient.subscribe((table) => {
      if (table === 'messages') {
        loadMessages();
      } else if (table === 'channels') {
        dbClient.getChannels().then(setChannels).catch(console.error);
      } else if (table === 'work_items') {
        dbClient.getWorkItems().then(setWorkItems).catch(console.error);
      }
    });
    return () => unsub();
  }, [activeChannelId, activeDMUserId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !currentUser) return;

    const content = messageInput.trim();
    setMessageInput('');

    try {
      if (activeDMUserId) {
        await dbClient.sendMessage(undefined, activeDMUserId, content, [], currentUser.id);
      } else {
        await dbClient.sendMessage(activeChannelId, undefined, content, [], currentUser.id);
      }
      loadMessages();
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Create Channel
  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim() || !currentUser) return;

    try {
      const created = await dbClient.createChannel(
        newChanName.trim(),
        newChanDesc.trim(),
        newChanPrivate
      );
      setChannels(prev => [...prev, created]);
      setActiveChannelId(created.id);
      setActiveDMUserId(null);
      setIsCreatingChannel(false);
      setNewChanName('');
      setNewChanDesc('');
      setNewChanPrivate(false);
    } catch (err) {
      console.error('Error creating channel:', err);
    }
  };

  // Add Reaction
  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await dbClient.toggleMessageReaction(messageId, emoji);
      loadMessages();
    } catch (err) {
      console.error('Error toggling reaction:', err);
    }
  };

  // Tag Asset into message
  const handleInsertAssetTag = (item: WorkItem) => {
    const tag = `[asset:${item.id}]`;
    setMessageInput(prev => prev ? `${prev} ${tag} ` : `${tag} `);
    setShowAssetSelector(false);
    textareaRef.current?.focus();
  };

  // Helper to render channel icon
  const getChannelIcon = (name: string, isPrivate: boolean) => {
    if (isPrivate) return <Lock className="h-3.5 w-3.5 text-amber-500 shrink-0" />;
    if (name.includes('announcement')) return <Megaphone className="h-3.5 w-3.5 text-primary shrink-0" />;
    if (name.includes('video') || name.includes('animation')) return <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />;
    if (name.includes('audio') || name.includes('sound')) return <Mic className="h-3.5 w-3.5 text-purple-500 shrink-0" />;
    if (name.includes('quiz') || name.includes('pedagogy')) return <CheckSquare className="h-3.5 w-3.5 text-emerald-500 shrink-0" />;
    return <Hash className="h-3.5 w-3.5 text-muted-foreground shrink-0" />;
  };

  // Helper to get active context info
  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeDMUser = activeDMUserId ? profiles.find(p => p.id === activeDMUserId) : null;

  // Filter messages by search if user is typing search query
  const displayedMessages = messages.filter(m => {
    if (!searchQuery.trim()) return true;
    return m.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter channels based on privacy / role
  const visibleChannels = channels.filter(chan => {
    if (!chan.is_private) return true;
    if (isPrivilegedRole) return true;
    return chan.member_ids?.includes(currentUser?.id || '');
  });

  // Direct message teammates (everyone except current user)
  const dmTeammates = profiles.filter(p => p.id !== currentUser?.id);

  // Parser for message content to render interactive Deliverable Asset Cards
  const renderMessageContent = (content: string) => {
    const assetTagRegex = /\[asset:([^\]]+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = assetTagRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const assetId = match[1];
      const matchedItem = workItems.find(i => i.id === assetId);

      if (matchedItem) {
        const openRemarks = (matchedItem.remarks || []).filter(r => r.status === 'open').length;
        const hasBlocker = (matchedItem.remarks || []).some(r => r.status === 'open' && (r.severity === 'blocker' || r.severity === 'correction'));

        parts.push(
          <div
            key={`asset-tag-${assetId}-${match.index}`}
            className="my-2.5 p-3 rounded-xl border border-primary/25 bg-card/80 shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0 mt-0.5">
                {matchedItem.asset_type === 'video' && <Video className="h-4 w-4" />}
                {matchedItem.asset_type === 'audio' && <Mic className="h-4 w-4" />}
                {matchedItem.asset_type === 'quiz' && <CheckSquare className="h-4 w-4" />}
                {matchedItem.asset_type === 'interactive_module' && <Layers className="h-4 w-4" />}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-foreground text-xs truncate group-hover:text-primary transition-colors">
                    {matchedItem.title}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-primary/15 text-primary">
                    v{matchedItem.latest_version_number || 1}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-muted border border-border text-muted-foreground uppercase">
                    {matchedItem.current_review_stage || matchedItem.status}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">
                  {matchedItem.instruction_text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {openRemarks > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  hasBlocker ? 'bg-red-500/20 text-red-600' : 'bg-amber-500/20 text-amber-600'
                }`}>
                  {openRemarks} open remark{openRemarks > 1 ? 's' : ''}
                </span>
              )}
              <button
                onClick={() => setActiveReviewItem(matchedItem)}
                className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <span>Open Review Drawer</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        );
      } else {
        parts.push(
          <span key={`asset-missing-${assetId}`} className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
            [Deliverable #{assetId}]
          </span>
        );
      }

      lastIndex = assetTagRegex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return (
      <div className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm text-foreground/90">
        {parts.map((p, i) => (
          <React.Fragment key={i}>{p}</React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 flex h-full bg-background overflow-hidden relative">

      {/* LEFT RAIL: Channels & Direct Messages */}
      <div className={`w-72 md:w-80 border-r border-border bg-card/40 flex flex-col shrink-0 h-full ${
        showMobileList ? 'absolute inset-0 z-30 bg-card' : 'hidden md:flex'
      }`}>
        
        {/* Workspace Brand Header */}
        <div className="p-4 border-b border-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-foreground">Team Threads</h2>
              <p className="text-[10px] text-muted-foreground">IXR Studio Communications</p>
            </div>
          </div>

          <button
            onClick={() => setIsCreatingChannel(true)}
            title="Create new channel"
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Channel & Team Search */}
        <div className="p-3 border-b border-border/50">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search threads & channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 border border-border/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Channel List Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 text-xs">
          
          {/* Section: Production Channels */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3 w-3" />
                <span>Production Channels</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {visibleChannels.filter(c => !c.is_private).length}
              </span>
            </div>

            <div className="space-y-0.5">
              {visibleChannels.filter(c => !c.is_private).map(chan => {
                const isActive = !activeDMUserId && activeChannelId === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => {
                      setActiveChannelId(chan.id);
                      setActiveDMUserId(null);
                      setShowMobileList(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={isActive ? 'text-primary-foreground' : ''}>
                        {getChannelIcon(chan.name, chan.is_private)}
                      </span>
                      <span className="truncate text-xs">#{chan.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Confidential Client Direct Channel (Privileged Only) */}
          {isPrivilegedRole && (
            <div>
              <div className="flex items-center justify-between px-2 mb-1.5">
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Confidential Directives</span>
                </span>
                <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-600 font-black">
                  RESTRICTED
                </span>
              </div>

              <div className="space-y-0.5">
                {visibleChannels.filter(c => c.is_private).map(chan => {
                  const isActive = !activeDMUserId && activeChannelId === chan.id;
                  return (
                    <button
                      key={chan.id}
                      onClick={() => {
                        setActiveChannelId(chan.id);
                        setActiveDMUserId(null);
                        setShowMobileList(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer ${
                        isActive
                          ? 'bg-amber-600 text-white font-bold shadow-xs'
                          : 'bg-amber-500/[0.06] border border-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500/15 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Lock className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-white' : 'text-amber-500'}`} />
                        <span className="truncate text-xs">#{chan.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section: Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Direct Messages</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">{dmTeammates.length}</span>
            </div>

            <div className="space-y-0.5">
              {dmTeammates.map(teammate => {
                const isActive = activeDMUserId === teammate.id;
                const roleBadge = ROLE_BADGE_MAP[teammate.role] || { label: teammate.role, color: 'bg-muted' };

                return (
                  <button
                    key={teammate.id}
                    onClick={() => {
                      setActiveDMUserId(teammate.id);
                      setShowMobileList(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition cursor-pointer group ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                        : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isActive ? 'bg-background/20 text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          {teammate.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background ${
                          teammate.presence === 'online' ? 'bg-emerald-500' :
                          teammate.presence === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-xs leading-none">{teammate.full_name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {roleBadge.label}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Current Active Persona Snapshot at bottom */}
        {currentUser && (
          <div className="p-3 border-t border-border bg-muted/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser.full_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground truncate">{currentUser.full_name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{currentUser.designation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CENTER & MAIN: Conversation Stream */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        
        {/* Stream Top Header */}
        <div className="p-3.5 md:p-4 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setShowMobileList(true)}
              className="md:hidden p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
            >
              <Users className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              {activeDMUser ? (
                <>
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                    {activeDMUser.full_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate flex items-center gap-2">
                      <span>{activeDMUser.full_name}</span>
                      <span className="text-[10px] font-normal px-2 py-0.5 rounded-full border bg-muted text-muted-foreground">
                        {ROLE_BADGE_MAP[activeDMUser.role]?.label || activeDMUser.role}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{activeDMUser.email}</p>
                  </div>
                </>
              ) : activeChannel ? (
                <>
                  <span className={`p-2 rounded-xl ${activeChannel.is_private ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
                    {getChannelIcon(activeChannel.name, activeChannel.is_private)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-foreground truncate flex items-center gap-2">
                      <span>#{activeChannel.name}</span>
                      {activeChannel.is_private && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          🔒 Leadership Only
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{activeChannel.description}</p>
                  </div>
                </>
              ) : (
                <h3 className="font-bold text-sm text-foreground">Select a conversation</h3>
              )}
            </div>
          </div>

          {/* Quick Info & Tag Asset Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAssetSelector(!showAssetSelector)}
              className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-muted text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Insert a live deliverable reference card into this discussion"
            >
              <Layers className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Tag Asset</span>
            </button>
          </div>
        </div>

        {/* Asset Selector Dropdown Drawer */}
        {showAssetSelector && (
          <div className="p-3 bg-muted/40 border-b border-border animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Select Deliverable to Reference in Thread:</span>
              </span>
              <button
                onClick={() => setShowAssetSelector(false)}
                className="text-muted-foreground hover:text-foreground text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {workItems.slice(0, 9).map(item => (
                <button
                  key={item.id}
                  onClick={() => handleInsertAssetTag(item)}
                  className="p-2.5 rounded-xl border border-border bg-card hover:border-primary text-left transition cursor-pointer flex items-center justify-between gap-2 shadow-xs group"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase">
                      {item.asset_type} · {item.current_review_stage || item.status}
                    </p>
                  </div>
                  <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-xs">Loading thread...</span>
            </div>
          ) : displayedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground p-6">
              <div className="p-3 rounded-2xl bg-muted/50 mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-bold text-foreground">No messages in this thread yet</h4>
              <p className="text-xs max-w-sm mt-1">
                Start the conversation or reference an asset to align with the production team.
              </p>
            </div>
          ) : (
            displayedMessages.map((msg) => {
              const sender = profiles.find(p => p.id === msg.sender_id);
              const isMe = msg.sender_id === currentUser?.id;
              const roleBadge = sender ? (ROLE_BADGE_MAP[sender.role] || { label: sender.role, color: 'bg-muted text-muted-foreground' }) : null;

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 group transition-colors rounded-2xl p-2.5 ${
                    isMe ? 'bg-primary/[0.03]' : 'hover:bg-muted/20'
                  }`}
                >
                  {/* Sender Avatar */}
                  <div className="h-8 w-8 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {sender ? sender.full_name.slice(0, 2).toUpperCase() : '??'}
                  </div>

                  {/* Message Bubble Container */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-xs text-foreground">
                        {sender ? sender.full_name : 'Unknown Specialist'}
                      </span>
                      {roleBadge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Rich Content (text + parsed asset tag cards) */}
                    {renderMessageContent(msg.content)}

                    {/* Reactions & Quick Emoji Bar */}
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      {(msg.reactions || []).map((reaction, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleAddReaction(msg.id, reaction.emoji)}
                          className={`px-2 py-0.5 rounded-full text-xs border flex items-center gap-1 transition cursor-pointer ${
                            currentUser && reaction.user_ids.includes(currentUser.id)
                              ? 'bg-primary/15 border-primary text-primary font-bold'
                              : 'bg-card border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          <span>{reaction.emoji}</span>
                          <span className="text-[10px] font-mono">{reaction.user_ids.length}</span>
                        </button>
                      ))}

                      {/* Quick Reaction Triggers on Hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ml-2">
                        {['👍', '🔥', '👀', '✅'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="p-1 rounded hover:bg-muted text-xs cursor-pointer"
                            title={`React with ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Composer */}
        <div className="p-3 md:p-4 border-t border-border bg-card/60 backdrop-blur">
          <form onSubmit={handleSendMessage} className="relative">
            <textarea
              ref={textareaRef}
              rows={2}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={`Message ${activeDMUser ? activeDMUser.full_name : `#${activeChannel?.name || 'channel'}`}... (Press Enter to send, Shift+Enter for newline)`}
              className="w-full bg-background border border-border rounded-2xl p-3 pr-24 text-xs md:text-sm text-foreground focus:outline-none focus:border-primary resize-none shadow-xs"
            />

            <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowAssetSelector(!showAssetSelector)}
                title="Tag an asset"
                className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <Layers className="h-4 w-4" />
              </button>
              <button
                type="submit"
                disabled={!messageInput.trim()}
                className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 transition cursor-pointer shadow-sm"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Review Drawer Modal (Launched when user clicks an Asset Tag in any thread) */}
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

      {/* Create New Channel Dialog */}
      {isCreatingChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <h3 className="text-base font-bold text-foreground mb-1">Create New Production Channel</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Organize discussions around a specific Chapter, track, or department.
            </p>

            <form onSubmit={handleCreateChannel} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground block mb-1">Channel Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ch03-magnetism-vfx"
                    value={newChanName}
                    onChange={(e) => setNewChanName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl pl-7 pr-3 py-2 text-foreground focus:outline-none focus:border-primary font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Description</label>
                <input
                  type="text"
                  placeholder="e.g. 3D simulation and animation reviews for Magnetism."
                  value={newChanDesc}
                  onChange={(e) => setNewChanDesc(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {isPrivilegedRole && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newChanPrivate}
                    onChange={(e) => setNewChanPrivate(e.target.checked)}
                    className="cursor-pointer rounded accent-primary"
                  />
                  <label htmlFor="isPrivate" className="font-semibold text-foreground cursor-pointer flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Confidential (Restricted to Client & Leadership only)</span>
                  </label>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreatingChannel(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold transition cursor-pointer shadow-sm"
                >
                  Create Channel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
