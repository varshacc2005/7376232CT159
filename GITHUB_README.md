# Campus Notifications - Priority Inbox System

## Overview

This repository implements a Priority Inbox system for the campus notifications application. It efficiently identifies and displays the top 'n' most important notifications based on type weight (Placement > Result > Event) and recency.

## Quick Start

### Installation
```bash
npm install
```

### Running
```bash
npm run dev      # Development mode
npm run build    # Build TypeScript
npm start        # Run compiled code
```

## Project Structure

```
notification-priority-system/
├── src/
│   ├── index.ts                   # Main entry point
│   ├── types.ts                   # TypeScript interfaces
│   ├── priorityCalculator.ts      # Scoring algorithm
│   └── notificationManager.ts     # API & cache management
├── dist/                          # Compiled JavaScript
├── Notification_System_Design.md  # Detailed documentation
├── README.md                      # Project guide
└── package.json                   # Dependencies
```

## Key Features

- **Smart Ranking:** Combines type weight and recency
- **Efficient Algorithms:** O(n log n) batch, O(m log k) streaming
- **API Integration:** Fetches from campus notifications API
- **Error Handling:** Graceful degradation with mock data
- **Type-Safe:** Full TypeScript implementation

## Priority Algorithm

```
Score = (TypeWeight × 100) + (RecencyScore × 50)

Weights:
- Placement: 3.0 (highest)
- Result: 2.0 (medium)
- Event: 1.0 (lowest)
```

## Example Output

```
TOP 10 PRIORITY NOTIFICATIONS

#1  [Placement]  CSX Corporation hiring    Score: 345.45
#2  [Placement]  Amazon internship         Score: 309.09
#3  [Placement]  Google hiring             Score: 300.00
#4  [Result]     mid-sem                   Score: 250.00
#5  [Result]     mid-sem                   Score: 236.36
...
```

## Handling Continuous Updates

The system maintains top 10 notifications efficiently by:
1. Using a min-heap data structure (for streaming)
2. O(log 10) = O(1) insertion per new notification
3. Always keeping exactly top 10 highest-scoring notifications
4. Automatically pushing out low-priority old notifications

## Performance

| Scenario | Time | Notes |
|----------|------|-------|
| Process 12 notifications | <5ms | Excluding API latency |
| Select top 10 | <1ms | Sorting time |
| Stream 1000 new notifications | ~1ms | Using min-heap |

## Documentation

See [Notification_System_Design.md](./Notification_System_Design.md) for:
- Detailed algorithm explanation
- Scalability analysis
- Edge case handling
- Future enhancements
- Performance benchmarks

## API Integration

- **Endpoint:** http://4.224.186.213/evaluation-service/notifications
- **Method:** GET
- **Authentication:** Required (protected route)
- **Response:** JSON array of notifications

## Future Enhancements

- [x] Basic priority ranking
- [ ] User preference customization
- [ ] Read status tracking
- [ ] Machine learning ranking
- [ ] Real-time WebSocket updates
- [ ] Frontend UI integration

## Technologies

- **Language:** TypeScript
- **Runtime:** Node.js
- **HTTP Client:** Axios
- **Build Tool:** TypeScript Compiler

## License

Proprietary - Campus Notifications Application
