import { Notification, NotificationType, PriorityScore } from './types';

export class PriorityCalculator {
  private readonly typeWeights: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  getTypeWeight(type: NotificationType): number {
    return this.typeWeights[type] || 0;
  }
  calculateRecencyScore(
    timestamp: string,
    oldestTimestamp: string,
    newestTimestamp: string
  ): number {
    const notificationTime = new Date(timestamp).getTime();
    const oldestTime = new Date(oldestTimestamp).getTime();
    const newestTime = new Date(newestTimestamp).getTime();

    if (oldestTime === newestTime) {
      return 1;
    }
    const recencyScore = (notificationTime - oldestTime) / (newestTime - oldestTime);
    return Math.max(0, Math.min(1, recencyScore)); 
  }
  calculateScore(
    notification: Notification,
    oldestTimestamp: string,
    newestTimestamp: string
  ): number {
    const typeWeight = this.getTypeWeight(notification.Type);
    const recencyScore = this.calculateRecencyScore(
      notification.Timestamp,
      oldestTimestamp,
      newestTimestamp
    );
    const score = typeWeight * 100 + recencyScore * 50;
    return score;
  }
  calculatePriorityScores(notifications: Notification[]): PriorityScore[] {
    if (notifications.length === 0) {
      return [];
    }
    const timestamps = notifications.map((n) => new Date(n.Timestamp).getTime());
    const oldestTime = Math.min(...timestamps);
    const newestTime = Math.max(...timestamps);

    const oldestTimestamp = new Date(oldestTime).toISOString();
    const newestTimestamp = new Date(newestTime).toISOString();

    return notifications.map((notification) => {
      const typeWeight = this.getTypeWeight(notification.Type);
      const recencyScore = this.calculateRecencyScore(
        notification.Timestamp,
        oldestTimestamp,
        newestTimestamp
      );
      const score = this.calculateScore(
        notification,
        oldestTimestamp,
        newestTimestamp
      );

      return {
        notification,
        score,
        typeWeight,
        recencyScore,
      };
    });
  }
}
