import { Notification, NotificationType, PriorityScore } from './types';

/**
 * PriorityCalculator: Calculates priority scores for notifications
 * Priority is determined by:
 * 1. Type Weight (Placement > Result > Event)
 * 2. Recency (newer notifications get higher scores)
 */
export class PriorityCalculator {
  // Type weights: Placement (3) > Result (2) > Event (1)
  private readonly typeWeights: Record<NotificationType, number> = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  /**
   * Get weight for a notification type
   */
  getTypeWeight(type: NotificationType): number {
    return this.typeWeights[type] || 0;
  }

  /**
   * Calculate recency score based on timestamp
   * More recent notifications get higher scores
   * Normalized to 0-1 range relative to the oldest notification
   */
  calculateRecencyScore(
    timestamp: string,
    oldestTimestamp: string,
    newestTimestamp: string
  ): number {
    const notificationTime = new Date(timestamp).getTime();
    const oldestTime = new Date(oldestTimestamp).getTime();
    const newestTime = new Date(newestTimestamp).getTime();

    if (oldestTime === newestTime) {
      return 1; // All notifications are at the same time
    }

    // Normalize to 0-1 range (0 = oldest, 1 = newest)
    const recencyScore = (notificationTime - oldestTime) / (newestTime - oldestTime);
    return Math.max(0, Math.min(1, recencyScore)); // Ensure it's between 0 and 1
  }

  /**
   * Calculate composite priority score
   * Score = (typeWeight * 100) + (recencyScore * 50)
   * This ensures type weight is primary factor, recency is secondary
   */
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

    // Composite score: type weight dominates, recency is tie-breaker
    const score = typeWeight * 100 + recencyScore * 50;
    return score;
  }

  /**
   * Calculate priority scores for all notifications
   */
  calculatePriorityScores(notifications: Notification[]): PriorityScore[] {
    if (notifications.length === 0) {
      return [];
    }

    // Find oldest and newest timestamps
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
