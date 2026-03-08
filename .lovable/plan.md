

## Conversation History Sidebar

### Overview
Add a sidebar to the chat page that lets users start new chats and revisit previous conversations. This requires authentication (signup/login), database tables for conversations and messages, and a sidebar UI component.

### Database Schema

**Table: `conversations`**
- `id` (uuid, PK)
- `user_id` (uuid, NOT NULL, references auth.users)
- `title` (text, default 'New Chat')
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Table: `chat_messages`**
- `id` (uuid, PK)
- `conversation_id` (uuid, NOT NULL, references conversations)
- `role` (text, NOT NULL) -- 'user' or 'assistant'
- `content` (text, NOT NULL)
- `created_at` (timestamptz)

**RLS**: Both tables restricted to authenticated users, scoped to their own `user_id` (via join for `chat_messages`).

### Authentication
- Create an `AuthPage` at `/auth` with email/password signup and login forms
- Protect the `/chat` route -- redirect unauthenticated users to `/auth`
- Create an `AuthProvider` context to manage session state across the app
- Email confirmation required (no auto-confirm)

### Sidebar Component
- Built using the existing Shadcn Sidebar component
- Shows list of past conversations sorted by `updated_at` desc
- Each item shows the conversation title (auto-generated from first user message)
- "New Chat" button at the top
- Active conversation highlighted
- Collapsible on mobile

### Chat Page Changes
- Wrap chat area with `SidebarProvider`
- On selecting a conversation, load its messages from `chat_messages`
- On sending the first message in a new chat, create a `conversations` row and set title from the first message (truncated to ~50 chars)
- Each message sent/received is persisted to `chat_messages`
- URL updates to `/chat/:conversationId` for direct linking

### File Changes

| File | Action |
|------|--------|
| `src/pages/AuthPage.tsx` | Create -- signup/login forms |
| `src/components/AuthProvider.tsx` | Create -- session context |
| `src/components/ChatSidebar.tsx` | Create -- conversation list sidebar |
| `src/pages/ChatPage.tsx` | Refactor -- integrate sidebar, persist messages, load history |
| `src/App.tsx` | Add `/auth` route, `/chat/:conversationId?` route, wrap with AuthProvider |
| `src/components/Navbar.tsx` | Add login/logout button |
| Database migration | Create `conversations` and `chat_messages` tables with RLS |

### Routing
- `/auth` -- login/signup page
- `/chat` -- new chat (creates conversation on first message)
- `/chat/:id` -- existing conversation

