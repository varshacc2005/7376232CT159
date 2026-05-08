# Notification Priority System

This directory contains the implementation of the Priority Inbox notification system for the campus notifications application.

## Project Structure

```
notification-priority-system/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── types.ts                 # TypeScript type definitions
│   ├── priorityCalculator.ts    # Priority calculation logic
│   └── notificationManager.ts   # Notification fetching and management
├── dist/                        # Compiled JavaScript (generated)
├── package.json                 # Project dependencies
├── tsconfig.json                # TypeScript configuration
├── .env                         # Environment variables
└── README.md                    # This file
```

## Features

- **Priority Calculation**: Notifications are ranked by type weight (Placement > Result > Event) and recency
- **Efficient Top-N Selection**: O(n log n) sorting algorithm with optional heap-based approach
- **API Integration**: Fetches notifications from the provided API endpoint
- **Caching**: Maintains notifications in memory for efficient processing
- **Error Handling**: Robust error handling for network failures and invalid data

## Installation

```bash
npm install
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## Configuration

Edit the `.env` file to configure:

- `API_ENDPOINT`: The notification API endpoint
- `API_TOKEN`: API authentication token (if required)
- `TOP_N`: Number of top notifications to display (default: 10)

## How It Works

1. **Notification Fetching**: Fetches all notifications from the API
2. **Priority Calculation**: Assigns a priority score to each notification based on:
   - Type weight (Placement=3, Result=2, Event=1)
   - Recency score (normalized 0-1)
3. **Ranking**: Sorts notifications by composite score
4. **Display**: Shows top N notifications in priority order

## Algorithm Details

### Priority Score Formula
```
Score = (TypeWeight × 100) + (RecencyScore × 50)
```

### Time Complexity
- **Sorting approach**: O(n log n) - suitable for occasional queries
- **Heap approach**: O(m log k) where m = new notifications, k = n

### Space Complexity
- **Overall**: O(n) for caching all notifications
- **Top-N heap**: O(k) where k = n

## Output Example

The application displays:
1. All fetched notifications in a table format
2. Top N priority notifications in ranked order
3. Detailed priority breakdown with scores
4. System statistics
5. Algorithm explanation
