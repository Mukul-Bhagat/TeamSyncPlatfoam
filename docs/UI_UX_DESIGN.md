# Project Collaboration Module - UI/UX Design

## Overview

This document defines the UI/UX design for the Project Collaboration Module. The design is inspired by modern SaaS products like Slack, ClickUp, Linear, and Notion, with a focus on clean typography, beautiful animations, and professional appearance.

## Design Principles

- **Clean & Minimal**: Reduce visual clutter, focus on content
- **Fast & Responsive**: Sub-1 second load times, smooth animations
- **Accessible**: WCAG 2.1 AA compliant, keyboard navigation
- **Mobile-First**: Responsive design that works on all devices
- **Dark Mode**: First-class dark mode support
- **Consistent**: Unified design language across all components

## Color Palette

### Primary Colors
- **Primary**: `#6366f1` (Indigo 500)
- **Primary Dark**: `#4f46e5` (Indigo 600)
- **Primary Light**: `#818cf8` (Indigo 400)

### Neutral Colors
- **Background Light**: `#ffffff`
- **Background Dark**: `#0f172a` (Slate 900)
- **Surface Light**: `#f8fafc` (Slate 50)
- **Surface Dark**: `#1e293b` (Slate 800)
- **Border Light**: `#e2e8f0` (Slate 200)
- **Border Dark**: `#334155` (Slate 700)

### Text Colors
- **Text Primary Light**: `#0f172a` (Slate 900)
- **Text Primary Dark**: `#f8fafc` (Slate 50)
- **Text Secondary Light**: `#64748b` (Slate 500)
- **Text Secondary Dark**: `#94a3b8` (Slate 400)

### Semantic Colors
- **Success**: `#10b981` (Emerald 500)
- **Warning**: `#f59e0b` (Amber 500)
- **Error**: `#ef4444` (Red 500)
- **Info**: `#3b82f6` (Blue 500)

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (for code)

### Font Sizes
- **H1**: 32px / 40px (leading)
- **H2**: 24px / 32px
- **H3**: 20px / 28px
- **Body**: 16px / 24px
- **Small**: 14px / 20px
- **X-Small**: 12px / 16px

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

## Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (64px)                                               │
│  Logo | Search | Notifications | User Profile               │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  Main Content Area                                 │
│ (240px)  │                                                   │
│          │  ┌─────────────────────────────────────────────┐  │
│ Projects │  │ Channel Header (64px)                       │  │
│          │  │ # general | Search | Settings               │  │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │                                             │  │
│          │  │  Messages Area (flex)                       │  │
│          │  │                                             │  │
│          │  │  ┌───────────────────────────────────────┐  │  │
│          │  │  │ Message 1                            │  │  │
│          │  │  └───────────────────────────────────────┘  │  │
│          │  │  ┌───────────────────────────────────────┐  │  │
│          │  │  │ Message 2                            │  │  │
│          │  │  └───────────────────────────────────────┘  │  │
│          │  │                                             │  │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │  Message Input (80px)                        │  │
│          │  │  [Input] [Attach] [Send]                    │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
│          │  ┌─────────────────────────────────────────────┐  │
│          │  │ Right Sidebar (280px) - Collapsible         │  │
│          │  │ Members | Files | Meeting Details           │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

## Components

### 1. Project Sidebar

**Location**: Left sidebar (240px)

**Features**:
- Project list with avatars
- Project color indicators
- Unread message counts
- Create new project button
- Search projects
- Project settings dropdown

**States**:
- Collapsed (64px): Icons only
- Expanded (240px): Full list

### 2. Channel Sidebar

**Location**: Second sidebar (200px)

**Features**:
- Channel list with icons
- Channel type indicators
- Unread message counts
- Pinned channels section
- Create channel button
- Channel search

**Channel Types**:
- General: `#` icon
- Announcements: `📢` icon
- Files: `📁` icon
- Meetings: `📅` icon
- Activity: `⚡` icon
- Custom: Custom icon

### 3. Message List

**Features**:
- Infinite scroll
- Message grouping by date
- Message reactions
- Message attachments preview
- Thread indicators
- Typing indicators
- Read receipts
- Message hover actions (reply, react, pin, star, delete)

**Message Structure**:
```
┌─────────────────────────────────────────────┐
│ [Avatar] John Doe  10:30 AM                   │
│ ┌─────────────────────────────────────────┐   │
│ │ Message content goes here...            │   │
│ │                                         │   │
│ │ [Attachment preview]                    │   │
│ └─────────────────────────────────────────┘   │
│ 👍 3  💬 2  ⭐  | Reply | More ...          │
└─────────────────────────────────────────────┘
```

### 4. Message Input

**Features**:
- Rich text editor
- File upload button
- Emoji picker
- Mention users (@)
- Mention everyone (@all)
- Code block support
- Preview mode
- Character limit
- Send button (Ctrl+Enter to send)

### 5. Right Sidebar

**Location**: Right sidebar (280px, collapsible)

**Tabs**:
- Members
- Files
- Meeting Details

**Members Tab**:
- Member list with avatars
- Online status indicators
- Role badges
- Add member button

**Files Tab**:
- File list with icons
- File size
- Upload date
- Upload button
- Folder structure

**Meeting Details Tab**:
- Meeting info
- Participant list
- Join button
- Meeting notes
- Recording link

### 6. Project Settings Modal

**Sections**:
- General (name, description, logo, color)
- Members (invite, manage roles)
- Channels (create, manage)
- Permissions (role-based access)
- Notifications (notification preferences)
- Files (storage settings)
- Meetings (meeting provider)
- Danger Zone (archive, delete)

## Screen Designs

### 1. Project Workspace (Main Screen)

```
┌─────────────────────────────────────────────────────────────┐
│  TeamSync  🔍  🔔  👤 John Doe                              │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Projects │  # general                                       │
│          │                                                   │
│ 🟢 Team  │  ┌─────────────────────────────────────────────┐  │
│ 🟢 Design │  │ Welcome to #general!                       │  │
│ 🟢 Dev   │  │                                             │  │
│          │  │ [Avatar] Jane  9:00 AM                      │  │
│ + New    │  │ 👋 Welcome everyone to the project!         │  │
│          │  │                                             │  │
│          │  │ [Avatar] Mike  9:05 AM                      │  │
│          │  │ Thanks Jane! Looking forward to working     │  │
│          │  │ together.                                   │  │
│          │  │                                             │  │
│          │  │ [Avatar] Sarah 9:10 AM                      │  │
│          │  │ 📎 design-mockup.fig                         │  │
│          │  │ Here's the initial design mockup.            │  │
│          │  │                                             │  │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │ [Type a message...] 📎 😊 @                │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
│          │  ┌─────────────────────────────────────────────┐  │
│          │  │ Members (10)  Files (25)  Meetings          │  │
│          │  │                                             │  │
│          │  │ 🟢 Jane Doe (Owner)                        │  │
│          │  │ 🟢 Mike Smith (Admin)                       │  │
│          │  │ ⚪ Sarah Johnson (Member)                    │  │
│          │  │ ⚪ Tom Wilson (Member)                       │  │
│          │  │                                             │  │
│          │  │ + Invite Member                             │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### 2. File Manager Screen

```
┌─────────────────────────────────────────────────────────────┐
│  TeamSync  🔍  🔔  👤 John Doe                              │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Projects │  📁 Files                                        │
│          │                                                   │
│ 🟢 Team  │  ┌─────────────────────────────────────────────┐  │
│ 🟢 Design │  │ 📁 Documents (15)                           │  │
│ 🟢 Dev   │  │ 📁 Images (8)                               │  │
│          │  │ 📁 Videos (2)                                │  │
│ + New    │  │                                             │  │
│          │  │ 📄 project-plan.pdf  2.4 MB  Jan 1          │  │
│          │  │ 📄 design-system.fig  8.1 MB  Jan 2         │  │
│          │  │ 🖼️ hero-image.png     1.2 MB  Jan 3         │  │
│          │  │ 🎬 demo-video.mp4     15.2 MB Jan 4         │  │
│          │  │                                             │  │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │ 📤 Upload File  📁 New Folder               │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

### 3. Meeting Hub Screen

```
┌─────────────────────────────────────────────────────────────┐
│  TeamSync  🔍  🔔  👤 John Doe                              │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Projects │  📅 Meetings                                     │
│          │                                                   │
│ 🟢 Team  │  ┌─────────────────────────────────────────────┐  │
│ 🟢 Design │  │ Live Meetings (1)                           │  │
│ 🟢 Dev   │  │                                             │  │
│          │  │ ┌─────────────────────────────────────────┐ │  │
│          │  │ │ 🔴 Daily Standup  In Progress            │ │  │
│          │  │ │ Organized by Jane Doe                   │ │  │
│          │  │ │ 5 participants  |  Join Meeting          │ │  │
│          │  │ └─────────────────────────────────────────┘ │  │
│          │  │                                             │  │
│          │  │ Scheduled Meetings (3)                      │  │
│          │  │                                             │  │
│          │  │ ┌─────────────────────────────────────────┐ │  │
│          │  │ │ 📅 Weekly Review                        │ │  │
│          │  │ │ Tomorrow, 10:00 AM                      │ │  │
│          │  │ │ Organized by Mike Smith                  │ │  │
│          │  │ │ 8 participants  |  View Details         │ │  │
│          │  │ └─────────────────────────────────────────┘ │  │
│          │  │                                             │  │
│          │  │ ┌─────────────────────────────────────────┐ │  │
│          │  │ │ 📅 Design Review                        │ │  │
│          │  │ │ Friday, 2:00 PM                         │ │  │
│          │  │ │ Organized by Sarah Johnson              │ │  │
│          │  │ │ 6 participants  |  View Details         │ │  │
│          │  │ └─────────────────────────────────────────┘ │  │
│          │  │                                             │  │
│          │  ├─────────────────────────────────────────────┤  │
│          │  │ + Schedule Meeting                           │  │
│          │  └─────────────────────────────────────────────┘  │
│          │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

## Animations

### Message Animation
- Fade in (300ms)
- Slide up (200ms)
- Scale (0.95 → 1.0)

### Sidebar Animation
- Slide in/out (250ms)
- Fade (200ms)

### Hover Effects
- Scale (1.0 → 1.02)
- Brightness (100% → 105%)
- Shadow (0 → 4px)

### Loading States
- Skeleton screens
- Progress indicators
- Spinners

## Responsive Design

### Desktop (≥ 1024px)
- Full layout with all sidebars
- 3-column layout

### Tablet (768px - 1023px)
- Collapsible sidebars
- 2-column layout
- Touch-optimized

### Mobile (< 768px)
- Single column
- Bottom navigation
- Slide-over menus
- Full-screen modals

## Accessibility

### Keyboard Navigation
- Tab navigation
- Arrow keys for lists
- Enter/Space for actions
- Escape to close modals

### Screen Readers
- ARIA labels
- Semantic HTML
- Focus indicators
- Alt text for images

### Color Contrast
- WCAG 2.1 AA compliant
- 4.5:1 contrast ratio for text
- 3:1 contrast ratio for UI components

## Performance

### Load Times
- Initial load: < 1 second
- Message load: < 500ms
- File upload: < 2 seconds
- Search: < 300ms

### Optimization
- Code splitting
- Lazy loading
- Image optimization
- Caching strategy
- CDN for static assets

## Component Library

### Recommended Libraries
- **UI Framework**: React + shadcn/ui
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **State**: Zustand or React Context
- **Real-time**: Supabase Realtime

### Component Structure
```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── collaboration/
│   │   ├── ProjectSidebar.tsx
│   │   ├── ChannelSidebar.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── FileExplorer.tsx
│   │   ├── MeetingHub.tsx
│   │   └── MemberList.tsx
│   └── shared/
│       ├── Avatar.tsx
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Modal.tsx
```

## User Flows

### 1. Create Project
1. Click "+ New Project" in sidebar
2. Enter project name and description
3. Select color and visibility
4. Click "Create Project"
5. Auto-redirect to project workspace
6. Default channels created automatically

### 2. Send Message
1. Select channel from sidebar
2. Type message in input
3. Attach files (optional)
4. Mention users (optional)
5. Click Send or press Ctrl+Enter
6. Message appears in list with animation
7. Real-time update to other users

### 3. Schedule Meeting
1. Navigate to Meetings tab
2. Click "+ Schedule Meeting"
3. Enter meeting details
4. Select date and time
5. Add participants
6. Click "Schedule"
7. Meeting link generated
8. Participants notified

### 4. Upload File
1. Navigate to Files tab
2. Click "Upload File" or drag & drop
3. Select file from device
4. File uploads with progress indicator
5. File appears in list
6. Share link available

### 5. Invite Member
1. Open Project Settings
2. Navigate to Members tab
3. Click "Invite Member"
4. Enter email address
5. Select role
6. Click "Send Invitation"
7. Email sent to invitee
