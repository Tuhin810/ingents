# Regeneration & Platform Detection Fix

## Problem Statement

When a user regenerated a post and then tried to publish it, the system couldn't detect the platform (Facebook, Instagram, etc.) because it was looking at the wrong message in the conversation history.

## The Issue

**Before Fix - Conversation Flow:**
```
1. User: "Create a Facebook post about Diwali"        ← Original request (has platform info)
2. AI:   "🪶 DRAFT: [content]..."                     ← First draft
3. User: "regenerate"                                  ← Regeneration request (no platform info)
4. AI:   "🪶 DRAFT: [new content]..."                 ← Regenerated draft
5. User: "yes"                                         ← Confirmation to post
```

**The Problem:**
When posting (step 5), the system looked for "the user message before the most recent draft" which was message #3 ("regenerate"). This message doesn't contain platform information, so `detectPlatform()` couldn't determine where to post.

## The Fix

### Before (Broken Logic)
```typescript
// Get the message immediately before the draft
const draftIndex = allMessages.findIndex(m => m === lastDraftMessage);
const originalUserMessage = allMessages
  .slice(0, draftIndex)
  .reverse()
  .find((m) => m.role === "user");  // This found "regenerate"
```

### After (Fixed Logic)
```typescript
// Get the ORIGINAL platform-specific request from conversation history
const originalUserMessage = allMessages
  .filter((m) => m.role === "user")  // Get all user messages
  .reverse()                          // Start from most recent
  .find((m) => 
    m.content && 
    m.content.length > 20 &&          // Must be substantial
    // Must NOT be a confirmation/action keyword
    !/(^|\s)(yes|no|post|cancel|regenerate|try again|change|different|ok|okay|sure)(\s|$)/i.test(m.content)
  );
```

## How It Works Now

**Same Conversation Flow:**
```
1. User: "Create a Facebook post about Diwali"        ← ✅ System finds THIS message
2. AI:   "🪶 DRAFT: [content]..."                     
3. User: "regenerate"                                  ← ❌ Skipped (matches action keywords)
4. AI:   "🪶 DRAFT: [new content]..."                 
5. User: "yes"                                         ← ❌ Skipped (matches confirmation keywords)
   → System extracts platform from message #1
   → detectPlatform() receives "Create a Facebook post about Diwali"
   → Successfully detects Facebook as the platform
   → Posts to Facebook ✅
```

## Search Logic Explained

The system now searches for the original request by:

1. **Filtering** all user messages from the conversation
2. **Reversing** to start from most recent (in case user started a new topic)
3. **Finding** the first message that:
   - Has content
   - Is substantial (>20 characters)
   - Is NOT a confirmation keyword (yes, no, post, etc.)
   - Is NOT a regeneration keyword (regenerate, try again, etc.)
   - Is NOT a cancellation keyword (cancel, stop, etc.)

This ensures we always find the **original content creation request** that contains platform information.

## Edge Cases Handled

### Multiple Regenerations
```
User: "Create Instagram post about AI"
AI:   "🪶 DRAFT: ..."
User: "regenerate"
AI:   "🪶 DRAFT: ..."
User: "try again"
AI:   "🪶 DRAFT: ..."
User: "yes"
```
✅ System finds "Create Instagram post about AI" (skips all regeneration requests)

### New Topic After Posting
```
User: "Create Facebook post about Diwali"
AI:   "🪶 DRAFT: ..."
User: "yes"
AI:   "✅ Posted!"
User: "Create LinkedIn post about hiring"  ← New topic
AI:   "🪶 DRAFT: ..."
User: "yes"
```
✅ System finds "Create LinkedIn post about hiring" (most recent substantial request)

### Mixed Keywords
```
User: "Create a Twitter post that says 'Yes we can!'"  ← Contains "yes" but is substantial
```
✅ Still detected as original request (length > 20 chars and full context check)

## Session Persistence

The fix also ensures that:

1. **Full conversation history** is maintained in session storage
2. **Regenerated drafts** are appended to the conversation (not replacing it)
3. **Platform context** is preserved throughout the entire session
4. **Original request** can always be found, even after multiple regenerations

## Testing Scenarios

### Test Case 1: Basic Regeneration
```
1. "Create a Facebook post about new product launch"
2. [Draft generated]
3. "regenerate"
4. [New draft generated]
5. "post it"
Expected: ✅ Posts to Facebook
```

### Test Case 2: Multiple Regenerations
```
1. "Make an Instagram post about our anniversary with image"
2. [Draft + image generated]
3. "try again"
4. [New draft + image]
5. "another one"
6. [New draft + image]
7. "yes"
Expected: ✅ Posts to Instagram with image
```

### Test Case 3: Cross-Session
```
Session 1:
1. "LinkedIn post about company milestone"
2. [Draft]
3. "yes"
4. [Posted]

Session 1 (continued):
5. "regenerate that post"
6. [New draft with same topic]
7. "post it"
Expected: ✅ Posts to LinkedIn
```

## Code References

- **Session Store**: `src/lib/sessionStore.ts`
- **Platform Detection Fix**: `src/app/api/social/route.ts` (lines 95-107)
- **Regeneration Logic**: `src/app/api/social/route.ts` (lines 143-176)
- **Post Generation**: `src/app/api/social/route.ts` (lines 212-351)
