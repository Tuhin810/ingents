# Session Management for AI Chat

## Overview

The AI chat system now maintains conversation history across requests using server-side session storage. This allows users to reference previous messages, regenerate posts, and maintain context even after posting.

## How It Works

### 1. Session Store (`src/lib/sessionStore.ts`)

- **In-memory storage**: Stores conversation history on the server
- **Automatic cleanup**: Sessions expire after 30 minutes of inactivity
- **Singleton pattern**: Single instance shared across all requests

### 2. Session Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. First request (no sessionId)
       ↓
┌─────────────────────────────────┐
│  API Route                      │
│  - Generate new sessionId       │
│  - Store conversation           │
│  - Return sessionId + response  │
└─────────────┬───────────────────┘
              │
              │ 2. Response with sessionId
              ↓
       ┌──────────────┐
       │   Client     │
       │ (saves ID)   │
       └──────┬───────┘
              │
              │ 3. Next request (with sessionId)
              ↓
       ┌─────────────────────────────┐
       │  API Route                  │
       │  - Load session history     │
       │  - Process new message      │
       │  - Update session           │
       │  - Return response          │
       └─────────────────────────────┘
```

### 3. Key Features

#### Persistent Conversation
- After posting, the draft and success message remain in session
- User can say "regenerate the previous post" and system finds it
- Context is maintained throughout the entire conversation

#### Automatic Session ID
- First request generates: `session_[timestamp]_[random]`
- Client stores and sends it with subsequent requests
- Server looks up conversation history automatically

#### Session Expiration
- Sessions timeout after 30 minutes of inactivity
- Expired sessions are cleaned up every 5 minutes
- New session starts if expired session is referenced

## API Changes

### Request Format
```typescript
{
  messages: Message[],
  context?: string,
  sessionId?: string  // NEW: optional session ID
}
```

### Response Format
```typescript
{
  reply: string,
  imageUrl?: string,
  sessionId: string   // NEW: always returned
}
```

## Frontend Changes

### `AiSidebar.tsx`
- Added `sessionId` state
- Sends `sessionId` with every request
- Updates `sessionId` when received from server
- Maintains conversation history in client state

## Production Considerations

### Current Implementation (Development)
- ✅ In-memory Map storage
- ✅ Fast and simple
- ⚠️ Lost on server restart
- ⚠️ Not suitable for multiple server instances

### Recommended for Production

#### Option 1: Redis
```typescript
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const sessionStore = {
  async getSession(id: string) {
    const data = await redis.get(`session:${id}`);
    return data ? JSON.parse(data) : [];
  },
  
  async updateSession(id: string, messages: Message[]) {
    await redis.set(`session:${id}`, JSON.stringify(messages), 'EX', 1800);
  }
};
```

#### Option 2: Database (PostgreSQL/MongoDB)
```typescript
// Store sessions in database table
CREATE TABLE sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  messages JSONB,
  last_activity TIMESTAMP,
  user_id VARCHAR(100)
);
```

#### Option 3: Vercel KV (if using Vercel)
```typescript
import { kv } from '@vercel/kv';

export const sessionStore = {
  async getSession(id: string) {
    return await kv.get(`session:${id}`) || [];
  },
  
  async updateSession(id: string, messages: Message[]) {
    await kv.set(`session:${id}`, messages, { ex: 1800 });
  }
};
```

## Usage Examples

### User Flow Example
```
User: "Create a Facebook post about Diwali with image"
AI: [Generates draft] "Would you like to post this, regenerate, or cancel?"

User: "yes"
AI: "✅ Your post has been published successfully!"

User: "regenerate the previous post"
AI: [Generates new draft based on original request]
```

### Session Lifecycle
1. **Start**: User sends first message → Server creates session
2. **Continue**: User sends more messages → Server loads & updates session
3. **Expire**: 30 min inactivity → Session deleted
4. **Restart**: User sends message with expired ID → New session created

## Monitoring

### Check Active Sessions
```typescript
import { sessionStore } from '@/lib/sessionStore';

console.log('Active sessions:', sessionStore.getSessionCount());
```

### Manual Cleanup
```typescript
sessionStore.cleanupExpiredSessions();
```

### Clear Specific Session
```typescript
sessionStore.clearSession('session_123456');
```

## Security Notes

- Session IDs are random and unpredictable
- No sensitive data stored in sessions (only conversation history)
- Consider adding user authentication to tie sessions to users
- Implement rate limiting to prevent session abuse
- Add encryption if storing sensitive company information

## Future Enhancements

1. **User Authentication**: Tie sessions to authenticated users
2. **Session Persistence**: Move to Redis/Database for production
3. **Session History**: Allow users to view/restore old conversations
4. **Export Conversations**: Download conversation history as JSON/PDF
5. **Multi-device Sync**: Share sessions across devices (requires DB)
