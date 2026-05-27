import type { Message } from '@/features/messages/types/message.types';
import { MessageType } from '@/features/messages/types/message.types';
import { TextMessageRenderer } from './renderers/TextMessageRenderer';
import { DeploymentMessageRenderer } from './renderers/DeploymentMessageRenderer';
import { AIMessageRenderer } from './renderers/AIMessageRenderer';
import { IncidentMessageRenderer } from './renderers/IncidentMessageRenderer';
import { SystemMessageRenderer } from './renderers/SystemMessageRenderer';
import { ActivityMessageRenderer } from './renderers/ActivityMessageRenderer';
import { AnnouncementMessageRenderer } from './renderers/AnnouncementMessageRenderer';

interface MessageRendererProps {
  message: Message;
  onReplyInThread?: (messageId: string) => void;
}

export function MessageRenderer({ message, onReplyInThread }: MessageRendererProps) {
  switch (message.type) {
    case MessageType.TEXT:
      return <TextMessageRenderer message={message} onReplyInThread={onReplyInThread} />;
    
    case MessageType.DEPLOYMENT:
      return <DeploymentMessageRenderer message={message} />;
    
    case MessageType.AI_RESPONSE:
      return <AIMessageRenderer message={message} />;
    
    case MessageType.INCIDENT:
      return <IncidentMessageRenderer message={message} />;
    
    case MessageType.SYSTEM:
      return <SystemMessageRenderer message={message} />;
    
    case MessageType.ACTIVITY:
      return <ActivityMessageRenderer message={message} />;
    
    case MessageType.ANNOUNCEMENT:
      return <AnnouncementMessageRenderer message={message} />;
    
    default:
      return <TextMessageRenderer message={message} onReplyInThread={onReplyInThread} />;
  }
}
