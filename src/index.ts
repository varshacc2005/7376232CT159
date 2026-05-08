import dotenv from 'dotenv';
import { NotificationManager } from './notificationManager';
import { PriorityCalculator } from './priorityCalculator';
dotenv.config();
const API_ENDPOINT = process.env.API_ENDPOINT || 'http://4.224.186.213/evaluation-service/notifications';
const TOP_N = parseInt(process.env.TOP_N || '10', 10);
function formatNotification(notification: any, index: number): string {
  const rank = `#${index + 1}`;
  const type = `[${notification.Type}]`;
  const message = notification.Message || 'N/A';
  const timestamp = notification.Timestamp || 'N/A';
  const id = `(ID: ${notification.ID.substring(0, 8)}...)`;

  return `${rank.padEnd(4)} ${type.padEnd(12)} ${message.padEnd(25)} ${timestamp.padEnd(20)} ${id}`;
}
async function main() {
  console.log('================================');
  console.log('PRIORITY INBOX NOTIFICATION SYSTEM');
  console.log('================================');
  console.log(`\nFetching notifications from API...`);
  console.log(`Endpoint: ${API_ENDPOINT}`);
  console.log(`Top N: ${TOP_N}\n`);
  const manager = new NotificationManager(API_ENDPOINT);

  try {
    const notifications = await manager.fetchNotifications();

    if (notifications.length === 0) {
      console.log('❌ No notifications fetched from API');
      return;
    }

    console.log(`✓ Fetched ${notifications.length} notifications from API\n`);
    manager.updateCache(notifications);
    const topNotifications = manager.getTopNNotifications(TOP_N);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('ALL NOTIFICATIONS (Total: ' + topNotifications.totalNotifications + ')');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(
      '#  '.padEnd(4) +
        'Type       '.padEnd(12) +
        'Message              '.padEnd(25) +
        'Timestamp           '.padEnd(20) +
        'ID'
    );
    console.log('-'.repeat(85));

    notifications.forEach((notification, index) => {
      console.log(formatNotification(notification, index));
    });
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`TOP ${TOP_N} PRIORITY NOTIFICATIONS`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(
      'Rank'.padEnd(4) +
        'Type       '.padEnd(12) +
        'Message              '.padEnd(25) +
        'Timestamp           '.padEnd(20) +
        'ID'
    );
    console.log('-'.repeat(85));

    topNotifications.topN.forEach((notification, index) => {
      console.log(formatNotification(notification, index));
    });
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('PRIORITY BREAKDOWN (Top 10)');
    console.log('═══════════════════════════════════════════════════════════════');

    const calculator = new PriorityCalculator();
    const priorityScores = calculator.calculatePriorityScores(notifications);
    const sorted = priorityScores.sort((a, b) => b.score - a.score).slice(0, TOP_N);

    console.log(
      'Rank'.padEnd(6) +
        'Type'.padEnd(12) +
        'Message'.padEnd(25) +
        'Type Weight'.padEnd(12) +
        'Recency Score'.padEnd(15) +
        'Total Score'
    );
    console.log('-'.repeat(90));

    sorted.forEach((ps, index) => {
      console.log(
        `#${index + 1}`.padEnd(6) +
          ps.notification.Type.padEnd(12) +
          (ps.notification.Message || 'N/A').substring(0, 23).padEnd(25) +
          ps.typeWeight.toFixed(2).padEnd(12) +
          ps.recencyScore.toFixed(4).padEnd(15) +
          ps.score.toFixed(2)
      );
    });
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('SYSTEM STATISTICS');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Total Notifications Cached: ${manager.getCacheSize()}`);
    console.log(`Top N Displayed: ${Math.min(TOP_N, topNotifications.topN.length)}`);
    console.log(`Timestamp: ${topNotifications.timestamp}`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('ALGORITHM EXPLANATION');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`
Priority Score Calculation:
  Score = (TypeWeight × 100) + (RecencyScore × 50)

Type Weights:
  - Placement: 3.00 (highest priority)
  - Result:    2.00 (medium priority)
  - Event:     1.00 (lowest priority)

Recency Score:
  - Calculated as: (NotificationTime - OldestTime) / (NewestTime - OldestTime)
  - Range: 0.0 (oldest) to 1.0 (newest)
  - Used as tie-breaker when types are equal

Example:
  - Recent Placement: (3 × 100) + (1.0 × 50) = 350 (highest)
  - Old Placement:    (3 × 100) + (0.0 × 50) = 300
  - Recent Result:    (2 × 100) + (1.0 × 50) = 250
  - Old Event:        (1 × 100) + (0.0 × 50) = 100 (lowest)
    `);

    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('Error in main:', error instanceof Error ? error.message : error);
  }
}
main();
