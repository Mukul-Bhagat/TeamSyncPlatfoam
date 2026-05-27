export interface TypingEvent {
  userId: string;
  channelId: string;
  timestamp: number;
}

export interface TypingState {
  [channelId: string]: {
    [userId: string]: number; // timestamp
  };
}
