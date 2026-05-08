
export type NotificationType = 'Placement' | 'Result' | 'Event';

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
  read?: boolean;
}

export interface NotificationResponse {
  notifications: Notification[];
}

export interface PriorityScore {
  notification: Notification;
  score: number;
  typeWeight: number;
  recencyScore: number;
}

export interface TopNotifications {
  topN: Notification[];
  totalNotifications: number;
  timestamp: string;
}
