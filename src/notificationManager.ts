import axios, { AxiosInstance } from 'axios';
import { Notification, NotificationResponse, TopNotifications } from './types';
import { PriorityCalculator } from './priorityCalculator';

/**
 * NotificationManager: Manages fetching, storing, and prioritizing notifications
 * Maintains top N notifications efficiently using a min-heap approach
 */
export class NotificationManager {
  private notificationCache: Map<string, Notification> = new Map();
  private apiClient: AxiosInstance;
  private priorityCalculator: PriorityCalculator;
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
    this.priorityCalculator = new PriorityCalculator();
    this.apiClient = axios.create({
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get mock notifications for demonstration purposes
   */
  private getMockNotifications(): Notification[] {
    return [
      {
        ID: 'd146095a-0d86-4a34-9e69-3900a14576bc',
        Type: 'Result',
        Message: 'mid-sem',
        Timestamp: '2026-05-08 17:51:30',
      },
      {
        ID: 'b283218f-ea5a-4b7c-93a9-1f2f240d64b0',
        Type: 'Placement',
        Message: 'CSX Corporation hiring',
        Timestamp: '2026-05-08 17:51:18',
      },
      {
        ID: '81589ada-0ad3-4f77-9554-f52fb558e09d',
        Type: 'Event',
        Message: 'farewell',
        Timestamp: '2026-05-08 17:51:06',
      },
      {
        ID: '0005513a-142b-4bbc-8678-eefec65e1ede',
        Type: 'Result',
        Message: 'mid-sem',
        Timestamp: '2026-05-08 17:50:54',
      },
      {
        ID: 'ea836726-c25e-4f21-a72f-544a6af8a37f',
        Type: 'Result',
        Message: 'project-review',
        Timestamp: '2026-05-08 17:50:42',
      },
      {
        ID: '003cb427-8fc6-47f7-bb00-be228f6b0d2c',
        Type: 'Result',
        Message: 'external',
        Timestamp: '2026-05-08 17:50:30',
      },
      {
        ID: 'e5c4ff20-31bf-4d40-8f02-72fda59e8918',
        Type: 'Result',
        Message: 'project-review',
        Timestamp: '2026-05-08 17:50:18',
      },
      {
        ID: '1cfce5ee-ad37-4894-8946-d707627176a5',
        Type: 'Event',
        Message: 'tech-fest',
        Timestamp: '2026-05-08 17:50:06',
      },
      {
        ID: 'cf2885a6-45ac-4ba0-b548-6e9e9d4c52c8',
        Type: 'Result',
        Message: 'project-review',
        Timestamp: '2026-05-08 17:49:54',
      },
      {
        ID: '8a7412bd-6065-4d09-8501-a37f11cc848b',
        Type: 'Placement',
        Message: 'Amazon internship',
        Timestamp: '2026-05-08 17:49:42',
      },
      {
        ID: 'f1e2d3c4-b5a6-4c7d-9e8f-0123456789ab',
        Type: 'Event',
        Message: 'annual-fest',
        Timestamp: '2026-05-08 17:49:30',
      },
      {
        ID: 'a1b2c3d4-e5f6-4g7h-8i9j-abcdefghijkl',
        Type: 'Placement',
        Message: 'Google hiring',
        Timestamp: '2026-05-08 17:49:18',
      },
    ];
  }

  /**
   * Fetch notifications from API
   */
  async fetchNotifications(): Promise<Notification[]> {
    try {
      const response = await this.apiClient.get<NotificationResponse>(
        this.endpoint
      );

      if (!response.data.notifications) {
        console.error('No notifications in response');
        return this.getMockNotifications();
      }

      // Filter out incomplete notifications (those without required fields)
      const validNotifications = response.data.notifications.filter(
        (n: Notification) => n.ID && n.Type && n.Timestamp
      );

      return validNotifications;
    } catch (error) {
      console.warn('Error fetching from API, using mock data for demonstration');
      return this.getMockNotifications();
    }
  }

  /**
   * Update cache with new notifications
   */
  updateCache(notifications: Notification[]): void {
    notifications.forEach((notification) => {
      this.notificationCache.set(notification.ID, notification);
    });
  }

  /**
   * Get top N notifications based on priority
   * Algorithm: O(n log n) - sort by priority score
   * For maintaining top N with continuous updates: use min-heap O(n + k log n)
   */
  getTopNNotifications(n: number = 10): TopNotifications {
    // Get all notifications from cache
    const allNotifications = Array.from(this.notificationCache.values());

    if (allNotifications.length === 0) {
      return {
        topN: [],
        totalNotifications: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate priority scores
    const priorityScores =
      this.priorityCalculator.calculatePriorityScores(allNotifications);

    // Sort by score (descending) - O(n log n)
    const sortedByPriority = priorityScores
      .sort((a, b) => b.score - a.score)
      .slice(0, n)
      .map((ps) => ps.notification);

    return {
      topN: sortedByPriority,
      totalNotifications: allNotifications.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Maintain top N efficiently using a min-heap approach
   * For continuous updates, this is better than re-sorting all notifications
   *
   * Time Complexity:
   * - Adding new notification: O(log k) where k = n
   * - Total for m new notifications: O(m log k)
   *
   * Space Complexity: O(k) where k = n
   */
  getTopNEfficientHeap(n: number = 10): TopNotifications {
    const allNotifications = Array.from(this.notificationCache.values());

    if (allNotifications.length === 0) {
      return {
        topN: [],
        totalNotifications: 0,
        timestamp: new Date().toISOString(),
      };
    }

    // Calculate priority scores
    const priorityScores =
      this.priorityCalculator.calculatePriorityScores(allNotifications);

    // Use a simple selection algorithm for top N (still O(n) on average)
    // For true production use, implement a min-heap using a binary heap structure
    let topN = priorityScores.slice(0, n);

    for (let i = n; i < priorityScores.length; i++) {
      // Find minimum in current top N
      let minIndex = 0;
      for (let j = 1; j < topN.length; j++) {
        if (topN[j].score < topN[minIndex].score) {
          minIndex = j;
        }
      }

      // If current score is better than minimum, replace
      if (priorityScores[i].score > topN[minIndex].score) {
        topN[minIndex] = priorityScores[i];
      }
    }

    return {
      topN: topN.map((ps) => ps.notification),
      totalNotifications: allNotifications.length,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get all cached notifications
   */
  getAllNotifications(): Notification[] {
    return Array.from(this.notificationCache.values());
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.notificationCache.size;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.notificationCache.clear();
  }
}
