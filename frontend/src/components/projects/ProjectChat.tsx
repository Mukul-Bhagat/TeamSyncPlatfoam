import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import {
  Loader2,
  Hash,
  Paperclip,
  Send,
  Smile,
  MessageSquare,
  Trash2,
  Plus,
  Pin,
  Star,
  X,
  FileText,
} from 'lucide-react';
import { useToast } from '@/components/common/Toast';

interface ProjectChatProps {
  projectId: string;
}

export function ProjectChat({ projectId }: ProjectChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Custom channel creation
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [newChannelType, setNewChannelType] = useState('custom');

  // Threading / Replies
  const [activeThreadParent, setActiveThreadParent] = useState<any | null>(null);
  const [threadMessages, setThreadMessages] = useState<any[]>([]);
  const [threadInput, setThreadInput] = useState('');
  
  // Emoji Picker Popup
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Mentions / Members
  const [members, setMembers] = useState<any[]>([]);

  // Typing indicators
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Load Channels
  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const data = await api.get<any[]>(`/projects/${projectId}/channels`);
      setChannels(data || []);
      if (data && data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoadingChannels(false);
    }
  };

  // Load Project Members for Mentions
  const fetchMembers = async () => {
    try {
      const data = await api.get<any[]>(`/projects/${projectId}/members`);
      setMembers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchMembers();
  }, [projectId]);

  // Load Messages
  const fetchMessages = async (channelId: string) => {
    try {
      setLoadingMessages(true);
      const data = await api.get<any>(`/channels/${channelId}/messages`);
      // Backend returns PaginatedResponse, so data is in data.data
      setMessages(data?.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
      setActiveThreadParent(null);
    }
  }, [activeChannel]);

  // Realtime Subscriptions
  useEffect(() => {
    if (!activeChannel) return;

    // Subscribe to project_messages table changes
    const channel = supabase
      .channel(`project_messages:channel_id=eq.${activeChannel.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'project_messages',
          filter: `channel_id=eq.${activeChannel.id}`,
        },
        async (payload) => {
          // Trigger a silent reload of messages to get profile details joined
          const refreshed = await api.get<any>(`/channels/${activeChannel.id}/messages`);
          setMessages(refreshed?.data || []);
          
          if (payload.eventType === 'INSERT') {
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeChannel]);

  // Realtime Typing Indicator
  useEffect(() => {
    if (!activeChannel || !user) return;

    const typingChannel = supabase.channel(`typing:${activeChannel.id}`);

    typingChannel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const typingUser = payload.userEmail;
        if (typingUser === user.email) return;

        setTypingUsers((prev) => {
          if (prev.includes(typingUser)) return prev;
          return [...prev, typingUser];
        });

        // Clear previous timeout
        if (typingTimeoutRef.current[typingUser]) {
          window.clearTimeout(typingTimeoutRef.current[typingUser]);
        }

        // Set timeout to clear typing state after 2.5 seconds
        typingTimeoutRef.current[typingUser] = window.setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== typingUser));
        }, 2500);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [activeChannel, user]);

  const handleTyping = () => {
    if (!activeChannel || !user) return;
    const typingChannel = supabase.channel(`typing:${activeChannel.id}`);
    typingChannel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userEmail: user.email?.split('@')[0] || 'User' },
    });
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollThreadToBottom = () => {
    setTimeout(() => {
      threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeChannel) return;

    try {
      const text = inputText;
      setInputText('');
      
      // Parse mentions from text e.g. @username
      const mentionedUsers: string[] = [];
      members.forEach((m) => {
        const username = m.profiles?.username || m.email.split('@')[0];
        if (text.includes(`@${username}`)) {
          mentionedUsers.push(m.user_id);
        }
      });

      await api.post(`/channels/${activeChannel.id}/messages`, {
        content: text,
        type: 'text',
        project_id: projectId,
        mentioned_users: mentionedUsers,
      });
      
      scrollToBottom();
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message');
    }
  };

  // File Sharing in Chat
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChannel) return;

    try {
      toast.info(`Uploading file ${file.name}...`);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          const uploadedFile = await api.post<any>(`/projects/${projectId}/files`, {
            name: file.name,
            type: file.type,
            size: file.size,
            base64Data,
          });

          // Send message with file attachment metadata
          await api.post(`/channels/${activeChannel.id}/messages`, {
            content: `Shared a file: **${file.name}**`,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            project_id: projectId,
            metadata: {
              file_id: uploadedFile.id,
              file_url: uploadedFile.file_url,
              file_name: uploadedFile.file_name,
            },
          });
          toast.success('File shared in chat!');
          scrollToBottom();
        } catch (err: any) {
          toast.error(err.message || 'Failed to upload attachment');
        }
      };
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    try {
      const slug = newChannelName.trim().toLowerCase().replace(/\s+/g, '-');
      await api.post(`/projects/${projectId}/channels`, {
        name: newChannelName.trim(),
        slug,
        description: newChannelDesc.trim() || null,
        type: newChannelType,
        visibility: 'private',
      });
      toast.success('Channel created!');
      setNewChannelName('');
      setNewChannelDesc('');
      setShowCreateChannel(false);
      fetchChannels();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create channel');
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      await api.post(`/messages/${messageId}/react`, { emoji });
      if (activeChannel) fetchMessages(activeChannel.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.del(`/messages/${messageId}`);
      toast.success('Message deleted');
      if (activeChannel) fetchMessages(activeChannel.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await api.post(`/messages/${messageId}/pin`, {});
      toast.success('Message pin state updated');
      if (activeChannel) fetchMessages(activeChannel.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleStarMessage = async (messageId: string) => {
    try {
      await api.post(`/messages/${messageId}/star`, {});
      toast.success('Message star state updated');
      if (activeChannel) fetchMessages(activeChannel.id);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Open Thread Panel
  const handleOpenThread = async (msg: any) => {
    setActiveThreadParent(msg);
    try {
      // Fetch thread messages (messages with parent_message_id)
      const data = await api.get<any>(`/channels/${activeChannel.id}/messages`, {
        thread_id: msg.id,
      });
      setThreadMessages(data?.data?.filter((m: any) => m.parent_message_id === msg.id) || []);
      scrollThreadToBottom();
    } catch {
      setThreadMessages([]);
    }
  };

  const handleSendThreadReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!threadInput.trim() || !activeThreadParent || !activeChannel) return;

    try {
      const replyText = threadInput;
      setThreadInput('');
      const reply = await api.post<any>(`/channels/${activeChannel.id}/messages`, {
        content: replyText,
        type: 'text',
        project_id: projectId,
        parent_message_id: activeThreadParent.id,
        thread_id: activeThreadParent.id,
      });

      setThreadMessages((prev) => [...prev, reply]);
      scrollThreadToBottom();
      fetchMessages(activeChannel.id); // Refresh main count
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const insertEmoji = (emoji: string) => {
    setInputText((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const popularEmojis = ['👍', '❤️', '🔥', '😂', '🚀', '🙌', '👀', '🎉', '💡', '✅'];

  return (
    <div className="flex h-[600px] border border-glass-border rounded-2xl overflow-hidden bg-card/40 backdrop-blur-sm shadow-elevation-lg">
      {/* Channels List Sidebar */}
      <div className="w-60 bg-background/30 border-r border-glass-border flex flex-col justify-between">
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between border-b border-glass-border/40 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Channels</span>
            <button
              onClick={() => setShowCreateChannel(true)}
              className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-fast"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {loadingChannels ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-1">
              {channels.map((chan) => {
                const isActive = activeChannel?.id === chan.id;
                return (
                  <button
                    key={chan.id}
                    onClick={() => setActiveChannel(chan)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-fast ${
                      isActive ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <Hash className="h-4 w-4 shrink-0" />
                    <span className="truncate">{chan.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Messages Center */}
      <div className="flex-1 flex flex-col justify-between bg-background/10 h-full">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="px-6 py-4 border-b border-glass-border bg-card/20 flex items-center justify-between">
              <div>
                <h3 className="font-heading font-semibold text-foreground flex items-center gap-1">
                  <Hash className="h-4 w-4 text-primary" /> {activeChannel.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{activeChannel.description || 'Channel description'}</p>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user?.id;
                  const senderName = msg.sender?.full_name || 'Teammate';
                  return (
                    <div key={msg.id} className="flex gap-3 items-start group hover:bg-background/20 p-2 rounded-lg transition-all duration-fast">
                      {/* Avatar */}
                      <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-sm text-primary shrink-0">
                        {senderName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{senderName}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          
                          {/* Starred / Pinned badges */}
                          {msg.is_pinned && <Pin className="h-3 w-3 text-primary rotate-45" />}
                          {msg.is_starred && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                        </div>
                        
                        <div className="text-sm text-foreground break-words font-medium">
                          {msg.content}
                        </div>

                        {/* File attachments */}
                        {msg.metadata?.file_url && (
                          <a
                            href={msg.metadata.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 p-2 bg-background/50 border border-glass-border/30 rounded-lg text-xs mt-1 hover:bg-muted/40 transition-colors"
                          >
                            <FileText className="h-4 w-4 text-primary" />
                            <span className="text-foreground font-semibold">{msg.metadata.file_name}</span>
                          </a>
                        )}

                        {/* Reaction badges */}
                        {msg.reaction_count > 0 && (
                          <div className="flex gap-1.5 mt-2">
                            <span className="text-xs bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full text-foreground flex items-center gap-1 font-semibold">
                              👍 {msg.reaction_count}
                            </span>
                          </div>
                        )}

                        {/* Reply count/badges */}
                        {msg.reply_count > 0 && (
                          <button
                            onClick={() => handleOpenThread(msg)}
                            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline mt-2"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            {msg.reply_count} {msg.reply_count === 1 ? 'reply' : 'replies'}
                          </button>
                        )}
                      </div>

                      {/* Hover Actions Menu */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-card border border-glass-border p-1 rounded-lg shadow-elevation-md transition-all duration-fast shrink-0">
                        {popularEmojis.slice(0, 3).map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReact(msg.id, emoji)}
                            className="p-1 hover:bg-muted rounded text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                        <div className="w-px h-4 bg-glass-border/50 mx-1" />
                        <button
                          onClick={() => handleOpenThread(msg)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                          title="Reply in thread"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePinMessage(msg.id)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                          title="Pin message"
                        >
                          <Pin className="h-4 w-4 rotate-45" />
                        </button>
                        <button
                          onClick={() => handleStarMessage(msg.id)}
                          className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                          title="Star message"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                        {isMine && (
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 hover:bg-muted rounded text-danger"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground opacity-60">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p className="text-sm">No messages in this channel.</p>
                  <p className="text-xs mt-1">Start the conversation by typing below.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <div className="px-6 py-1 text-[11px] text-muted-foreground italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Message Input Area */}
            <div className="p-4 border-t border-glass-border bg-card/20">
              <form onSubmit={handleSendMessage} className="relative flex gap-2 items-center bg-background/50 border border-glass-border rounded-xl p-2 focus-within:ring-2 focus-within:ring-ring">
                <label className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 cursor-pointer transition-colors shrink-0">
                  <Paperclip className="h-5 w-5" />
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    handleTyping();
                  }}
                  placeholder={`Message #${activeChannel.name}`}
                  className="flex-1 bg-transparent border-0 px-2 py-2 text-sm text-foreground focus:outline-none focus:ring-0 min-w-0"
                />

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Smile className="h-5 w-5" />
                  </button>

                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-primary-foreground p-2 rounded-lg flex items-center justify-center transition-all duration-fast"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>

                {/* Popular Emojis Shortcut Dropdown */}
                {showEmojiPicker && (
                  <div className="absolute right-4 bottom-16 bg-card border border-glass-border p-2.5 rounded-xl shadow-elevation-xl flex gap-1.5 z-40 animate-fade-in">
                    {popularEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="p-1 hover:bg-muted text-base rounded transition-all duration-fast"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Select or create a channel to begin chat.
          </div>
        )}
      </div>

      {/* Slack Threads Sidebar panel */}
      {activeThreadParent && (
        <div className="w-80 bg-background/20 border-l border-glass-border flex flex-col justify-between h-full animate-slide-in">
          {/* Thread Header */}
          <div className="px-4 py-4 border-b border-glass-border flex items-center justify-between">
            <h4 className="font-heading font-semibold text-sm text-foreground flex items-center gap-1">
              Thread Reply
            </h4>
            <button
              onClick={() => setActiveThreadParent(null)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Parent and replies list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Parent Message */}
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5">
              <p className="text-xs font-semibold text-primary">
                {activeThreadParent.sender?.full_name || 'Teammate'}
              </p>
              <p className="text-sm text-foreground font-medium">{activeThreadParent.content}</p>
            </div>

            <div className="w-full text-center">
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Replies</span>
            </div>

            {/* Thread Replies */}
            <div className="space-y-3">
              {threadMessages.map((reply) => (
                <div key={reply.id} className="p-3 bg-card/60 border border-glass-border/30 rounded-xl space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-foreground">
                      {reply.sender?.full_name || 'Teammate'}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground font-medium">{reply.content}</p>
                </div>
              ))}
              <div ref={threadEndRef} />
            </div>
          </div>

          {/* Thread Reply Input */}
          <form onSubmit={handleSendThreadReply} className="p-4 border-t border-glass-border bg-card/30">
            <div className="flex gap-2 bg-background/60 border border-glass-border rounded-lg p-1">
              <input
                type="text"
                value={threadInput}
                onChange={(e) => setThreadInput(e.target.value)}
                placeholder="Reply in thread..."
                className="flex-1 bg-transparent border-0 px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground px-2.5 py-1 rounded-md text-xs font-semibold"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateChannel}
            className="bg-card border border-glass-border p-6 rounded-2xl max-w-sm w-full space-y-4 shadow-elevation-xl animate-fade-in"
          >
            <h3 className="font-heading font-bold text-lg text-foreground">New Channel</h3>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Channel Name</label>
              <input
                type="text"
                required
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. dev-discussion"
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={newChannelDesc}
                onChange={(e) => setNewChannelDesc(e.target.value)}
                placeholder="What is this channel for?"
                rows={2}
                className="w-full bg-background/50 border border-glass-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Type</label>
              <select
                value={newChannelType}
                onChange={(e) => setNewChannelType(e.target.value)}
                className="w-full bg-background/50 border border-glass-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none"
              >
                <option value="custom">Standard Discussion</option>
                <option value="announcements">Announcements Board</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateChannel(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground border border-glass-border rounded-lg hover:bg-muted transition-colors duration-fast"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-primary-foreground px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-fast"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
