// Message Types
export const MessageType = {
  TEXT: 'text',
  SYSTEM: 'system',
  DEPLOYMENT: 'deployment',
  INCIDENT: 'incident',
  AI_RESPONSE: 'ai_response',
  ACTIVITY: 'activity',
  ANNOUNCEMENT: 'announcement',
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

// Metadata Interfaces per Message Type
export interface TextMessageMetadata {
  mentions?: string[];
  replyTo?: string;
}

export interface DeploymentMessageMetadata {
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  environment: string;
  version?: string;
  commit?: string;
  duration?: number;
  service?: string;
  logsUrl?: string;
}

export interface AIMessageMetadata {
  model: string;
  prompt?: string;
  tokens?: number;
  confidence?: number;
  sources?: string[];
}

export interface IncidentMessageMetadata {
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  incidentId?: string;
  affectedServices?: string[];
  estimatedResolution?: string;
}

export interface ActivityMessageMetadata {
  action: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
}

export interface SystemMessageMetadata {
  event: string;
  details?: Record<string, any>;
}

export interface AnnouncementMessageMetadata {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: string;
  targetAudience?: string[];
}

// Discriminated Union for Message Metadata
export type MessageMetadata =
  | { type: typeof MessageType.TEXT; data: TextMessageMetadata }
  | { type: typeof MessageType.DEPLOYMENT; data: DeploymentMessageMetadata }
  | { type: typeof MessageType.AI_RESPONSE; data: AIMessageMetadata }
  | { type: typeof MessageType.INCIDENT; data: IncidentMessageMetadata }
  | { type: typeof MessageType.ACTIVITY; data: ActivityMessageMetadata }
  | { type: typeof MessageType.SYSTEM; data: SystemMessageMetadata }
  | { type: typeof MessageType.ANNOUNCEMENT; data: AnnouncementMessageMetadata };

// Message Interface
export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  parent_message_id?: string;
  type: MessageType;
  content?: string;
  metadata: Record<string, any>;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  // Joined relations
  sender?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
}

// Message Reaction Interface
export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  // Joined relations
  user?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

// Message Attachment Interface
export interface MessageAttachment {
  id: string;
  message_id: string;
  uploaded_by: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  created_at: string;
  // Joined relations
  uploader?: {
    id: string;
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

// Input Types
export interface CreateMessageInput {
  channel_id: string;
  type: MessageType;
  content?: string;
  metadata?: Record<string, any>;
  parent_message_id?: string;
}

export interface UpdateMessageInput {
  content?: string;
  metadata?: Record<string, any>;
}

export interface AddReactionInput {
  message_id: string;
  emoji: string;
}

export interface UploadAttachmentInput {
  message_id: string;
  file: File;
}
