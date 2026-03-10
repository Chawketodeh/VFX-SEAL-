# Read/Unread Logic - Complete Fix Summary

## Problem Fixed

Before this fix, messages sent from the Contact page appeared as "NEW" (unread) for the studio user who sent them. This was incorrect - senders should never see their own messages as unread.

## Root Cause

The `isUnreadForStudio()` function was checking **only** if `studioReadAt` was null, without verifying who the sender was. This meant:
- A studio user's own message would show `studioReadAt: null` in the list (because only the studio owner marks it as read when they open it)
- But the message appears in their inbox (via the ownership filter)
- So it was marked as unread for them

## Solution Implemented

Updated `isUnreadForStudio()` to check **both**:
1. Message is from ADMIN (`senderType === "ADMIN"`)
2. Studio user hasn't read it (`studioReadAt === null`)

### Files Changed

**Backend**: `backend/routes/contact.js`
```javascript
function isUnreadForStudio(message) {
  // Unread for studio = message from ADMIN where studioReadAt is not yet set
  const senderType = message?.senderType || "STUDIO";
  const isFromAdmin = senderType === "ADMIN";
  return isFromAdmin && isUnsetDate(message.studioReadAt);
}
```

**Frontend**: `frontend/src/pages/MyMessagesPage.jsx`
- Simplified badge logic to use backend's `unreadForStudio` flag as single source of truth
- Simplified mark-as-read condition to only act when `unreadForStudio === true`

## New Unread Rules (Now Consistent Everywhere)

### For Studio Users
**A message is UNREAD only if:**
- Sent BY admin (`senderType === "ADMIN"`)
- AND studio hasn't opened it yet (`studioReadAt === null`)

**Messages that are NEVER unread for studio:**
- Messages they sent themselves ✓
- Messages from other studios ✓
- Already-opened admin messages ✓

### For Admin Users  
**A message is UNREAD only if:**
- Sent BY studio (`senderType === "STUDIO"`)
- AND message is NEW status (`status === "NEW"`)
- AND admin hasn't opened it yet (`adminReadAt === null`)
- AND not sent as OUTBOUND by admin

**Messages that are NEVER unread for admin:**
- Messages they sent themselves ✓
- Already-opened studio messages ✓

## Message Creation Flow - All Entry Points

### Contact Page (Studio User Sends)
```javascript
{
  senderType: "STUDIO",
  direction: "INBOUND",
  adminReadAt: null,        // ← Unread for admin
  studioReadAt: new Date(), // ← NOT unread for sender ✓
}
```

### Admin Send To Studios
```javascript
{
  senderType: "ADMIN",
  direction: "OUTBOUND",
  adminReadAt: new Date(),  // ← NOT unread for sender ✓
  studioReadAt: null,       // ← Unread for studios ✓
}
```

### Admin Reply To Message
```javascript
{
  adminReadAt: new Date(),  // ← NOT unread for sender ✓
  studioReadAt: null,       // ← Unread for studio ✓
}
```

## Verification Checklist

✓ Contact page messages do NOT show as NEW for sender
✓ Contact page messages DO show as unread for admin
✓ Admin messages show as unread in studio's My Messages
✓ Admin's own sent messages do NOT show as unread to them
✓ Unread counter counts only unread-for-current-user messages
✓ Badge shows NEW/READ based on unreadForStudio flag
✓ Same logic applied everywhere (dashboard, notifications, badges, counters)
✓ All message creation flows follow the same pattern

## Expected Behavior After Fix

1. **Studio sends message from Contact page**
   - Appears in their Message history with READ badge ✓
   - Appears in admin Dashboard as NEW ✓
   - Admin sees "1 New Message" badge ✓

2. **Admin sends message to studio**
   - Appears as NEW in studio's My Messages ✓
   - Studio can click to open and mark read ✓
   - Badge changes to READ after opening ✓

3. **Studio opens admin's message**
   - Badge changes from NEW to READ ✓
   - `studioReadAt` timestamp is set ✓
   - Removed from "New Messages" count ✓

