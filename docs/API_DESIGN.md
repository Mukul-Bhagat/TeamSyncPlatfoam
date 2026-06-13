# Project Collaboration Module - API Design

## Overview

This document defines the complete API design for the Project Collaboration Module. The API follows RESTful principles with consistent patterns for all endpoints.

## Base URL

```
/api/v1
```

## Authentication

All endpoints require authentication via Supabase Auth JWT token in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

Error responses:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

## Pagination

List endpoints support pagination via query parameters:

```
?page=1&limit=50&sort=created_at&order=desc
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 150,
      "total_pages": 3
    }
  }
}
```

---

## Projects API

### Get All Projects

```
GET /api/v1/projects
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `status` (optional): Filter by status (active, archived, completed)
- `team_id` (optional): Filter by team ID
- `search` (optional): Search by name or description

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Project Name",
      "description": "Project description",
      "owner_id": "uuid",
      "team_id": "uuid",
      "status": "active",
      "visibility": "private",
      "logo_url": "https://...",
      "color": "#6366f1",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "member_count": 10,
      "channel_count": 6,
      "message_count": 150
    }
  ],
  "meta": { ... }
}
```

### Get Project by ID

```
GET /api/v1/projects/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Project Name",
    "description": "Project description",
    "owner_id": "uuid",
    "team_id": "uuid",
    "status": "active",
    "visibility": "private",
    "logo_url": "https://...",
    "color": "#6366f1",
    "settings": { ... },
    "permissions": { ... },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "statistics": {
      "total_members": 10,
      "total_channels": 6,
      "total_messages": 150,
      "total_files": 25,
      "total_meetings": 5
    }
  }
}
```

### Create Project

```
POST /api/v1/projects
```

Request Body:
```json
{
  "name": "Project Name",
  "description": "Project description",
  "team_id": "uuid",
  "visibility": "private",
  "color": "#6366f1",
  "logo_url": "https://..."
}
```

Response: Returns created project

### Update Project

```
PUT /api/v1/projects/:id
```

Request Body:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "visibility": "internal",
  "color": "#8b5cf6",
  "logo_url": "https://...",
  "settings": { ... }
}
```

Response: Returns updated project

### Delete Project

```
DELETE /api/v1/projects/:id
```

Response:
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### Archive Project

```
POST /api/v1/projects/:id/archive
```

Response: Returns updated project

### Restore Project

```
POST /api/v1/projects/:id/restore
```

Response: Returns updated project

---

## Project Members API

### Get Project Members

```
GET /api/v1/projects/:id/members
```

Query Parameters:
- `page`, `limit`: Pagination
- `role`: Filter by role
- `status`: Filter by status

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "user_id": "uuid",
      "email": "user@example.com",
      "role": "admin",
      "status": "active",
      "invited_by": "uuid",
      "joined_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### Add Project Member

```
POST /api/v1/projects/:id/members
```

Request Body:
```json
{
  "email": "user@example.com",
  "role": "member"
}
```

Response: Returns created member

### Update Member Role

```
PUT /api/v1/projects/:id/members/:member_id
```

Request Body:
```json
{
  "role": "admin"
}
```

Response: Returns updated member

### Remove Project Member

```
DELETE /api/v1/projects/:id/members/:member_id
```

Response:
```json
{
  "success": true,
  "data": { "removed": true }
}
```

### Invite User to Project

```
POST /api/v1/projects/:id/invitations
```

Request Body:
```json
{
  "email": "user@example.com",
  "role": "member"
}
```

Response: Returns created invitation

### Accept Project Invitation

```
POST /api/v1/projects/invitations/:token/accept
```

Response:
```json
{
  "success": true,
  "data": {
    "project_id": "uuid",
    "role": "member"
  }
}
```

---

## Project Channels API

### Get Project Channels

```
GET /api/v1/projects/:id/channels
```

Query Parameters:
- `type`: Filter by channel type
- `visibility`: Filter by visibility

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "name": "General",
      "slug": "general",
      "description": "General discussion",
      "type": "general",
      "visibility": "public",
      "icon": "#",
      "color": "#6366f1",
      "is_pinned": false,
      "is_muted": false,
      "created_by": "uuid",
      "created_at": "2024-01-01T00:00:00Z",
      "member_count": 10,
      "unread_count": 5
    }
  ]
}
```

### Get Channel by ID

```
GET /api/v1/projects/:id/channels/:channel_id
```

Response: Returns channel with full details

### Create Channel

```
POST /api/v1/projects/:id/channels
```

Request Body:
```json
{
  "name": "New Channel",
  "slug": "new-channel",
  "description": "Channel description",
  "type": "custom",
  "visibility": "public",
  "icon": "#",
  "color": "#8b5cf6"
}
```

Response: Returns created channel

### Update Channel

```
PUT /api/v1/projects/:id/channels/:channel_id
```

Request Body:
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "is_pinned": true,
  "color": "#8b5cf6"
}
```

Response: Returns updated channel

### Delete Channel

```
DELETE /api/v1/projects/:id/channels/:channel_id
```

Response:
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### Get Channel Members

```
GET /api/v1/projects/:id/channels/:channel_id/members
```

Response: Returns list of channel members

### Add Channel Member

```
POST /api/v1/projects/:id/channels/:channel_id/members
```

Request Body:
```json
{
  "user_id": "uuid",
  "role": "member"
}
```

Response: Returns added member

### Update Channel Member

```
PUT /api/v1/projects/:id/channels/:channel_id/members/:member_id
```

Request Body:
```json
{
  "role": "admin",
  "is_muted": true
}
```

Response: Returns updated member

### Remove Channel Member

```
DELETE /api/v1/projects/:id/channels/:channel_id/members/:member_id
```

Response:
```json
{
  "success": true,
  "data": { "removed": true }
}
```

---

## Messages API

### Get Channel Messages

```
GET /api/v1/projects/:id/channels/:channel_id/messages
```

Query Parameters:
- `page`, `limit`: Pagination
- `before`: Get messages before this message ID (for infinite scroll)
- `after`: Get messages after this message ID
- `thread_id`: Filter by thread
- `is_pinned`: Filter pinned messages
- `is_starred`: Filter starred messages

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "channel_id": "uuid",
      "project_id": "uuid",
      "sender_id": "uuid",
      "parent_message_id": null,
      "thread_id": null,
      "type": "text",
      "content": "Hello world",
      "metadata": {},
      "is_pinned": false,
      "is_starred": false,
      "reply_count": 0,
      "reaction_count": 3,
      "mentioned_users": [],
      "mentioned_all": false,
      "edited_at": null,
      "deleted_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "sender": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "reactions": [
        {
          "emoji": "👍",
          "count": 3,
          "users": ["uuid1", "uuid2", "uuid3"]
        }
      ],
      "attachments": []
    }
  ]
}
```

### Get Message by ID

```
GET /api/v1/projects/:id/channels/:channel_id/messages/:message_id
```

Response: Returns message with full details

### Create Message

```
POST /api/v1/projects/:id/channels/:channel_id/messages
```

Request Body:
```json
{
  "type": "text",
  "content": "Hello world",
  "parent_message_id": "uuid",
  "mentioned_users": ["uuid1", "uuid2"],
  "mentioned_all": false,
  "attachments": [
    {
      "file_name": "document.pdf",
      "file_type": "pdf",
      "file_size": 1024000,
      "file_url": "https://...",
      "storage_provider": "supabase"
    }
  ]
}
```

Response: Returns created message

### Update Message

```
PUT /api/v1/projects/:id/channels/:channel_id/messages/:message_id
```

Request Body:
```json
{
  "content": "Updated content"
}
```

Response: Returns updated message

### Delete Message (Soft Delete)

```
DELETE /api/v1/projects/:id/channels/:channel_id/messages/:message_id
```

Response:
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### Pin Message

```
POST /api/v1/projects/:id/channels/:channel_id/messages/:message_id/pin
```

Response: Returns updated message

### Unpin Message

```
DELETE /api/v1/projects/:id/channels/:channel_id/messages/:message_id/pin
```

Response: Returns updated message

### Star Message

```
POST /api/v1/projects/:id/channels/:channel_id/messages/:message_id/star
```

Response: Returns updated message

### Unstar Message

```
DELETE /api/v1/projects/:id/channels/:channel_id/messages/:message_id/star
```

Response: Returns updated message

### Get Message Thread

```
GET /api/v1/projects/:id/channels/:channel_id/messages/:message_id/thread
```

Response: Returns thread replies

### Search Messages

```
GET /api/v1/projects/:id/messages/search
```

Query Parameters:
- `q`: Search query
- `channel_id`: Filter by channel
- `sender_id`: Filter by sender
- `type`: Filter by type
- `before_date`: Filter by date range
- `after_date`: Filter by date range

Response: Returns matching messages

---

## Message Reactions API

### Add Reaction

```
POST /api/v1/projects/:id/channels/:channel_id/messages/:message_id/reactions
```

Request Body:
```json
{
  "emoji": "👍"
}
```

Response: Returns created reaction

### Remove Reaction

```
DELETE /api/v1/projects/:id/channels/:channel_id/messages/:message_id/reactions/:emoji
```

Response:
```json
{
  "success": true,
  "data": { "removed": true }
}
```

---

## Typing Indicators API

### Set Typing Indicator

```
POST /api/v1/projects/:id/channels/:channel_id/typing
```

Request Body:
```json
{
  "is_typing": true
}
```

Response:
```json
{
  "success": true,
  "data": { "typing": true }
}
```

### Get Typing Users

```
GET /api/v1/projects/:id/channels/:channel_id/typing
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "user_id": "uuid",
      "full_name": "John Doe",
      "last_typed_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

## Read Receipts API

### Mark Messages as Read

```
POST /api/v1/projects/:id/channels/:channel_id/read
```

Request Body:
```json
{
  "last_read_message_id": "uuid"
}
```

Response:
```json
{
  "success": true,
  "data": { "marked": true }
}
```

### Get Message Read Status

```
GET /api/v1/projects/:id/channels/:channel_id/messages/:message_id/read-status
```

Response:
```json
{
  "success": true,
  "data": {
    "message_id": "uuid",
    "read_by": [
      {
        "user_id": "uuid",
        "full_name": "John Doe",
        "read_at": "2024-01-01T00:00:00Z"
      }
    ],
    "unread_count": 5
  }
}
```

---

## Files API

### Get Project Files

```
GET /api/v1/projects/:id/files
```

Query Parameters:
- `folder_id`: Filter by folder
- `file_type`: Filter by file type
- `search`: Search by filename

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "folder_id": null,
      "uploaded_by": "uuid",
      "file_name": "document.pdf",
      "file_type": "pdf",
      "file_size": 1024000,
      "file_url": "https://...",
      "storage_provider": "supabase",
      "thumbnail_url": "https://...",
      "version": 1,
      "is_folder": false,
      "download_count": 10,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "uploaded_by_user": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

### Upload File

```
POST /api/v1/projects/:id/files/upload
```

Request: Multipart form data

Response: Returns uploaded file

### Create Folder

```
POST /api/v1/projects/:id/files/folders
```

Request Body:
```json
{
  "name": "New Folder",
  "folder_id": "uuid"
}
```

Response: Returns created folder

### Get File by ID

```
GET /api/v1/projects/:id/files/:file_id
```

Response: Returns file with full details

### Update File

```
PUT /api/v1/projects/:id/files/:file_id
```

Request Body:
```json
{
  "file_name": "New Name",
  "folder_id": "uuid"
}
```

Response: Returns updated file

### Delete File (Soft Delete)

```
DELETE /api/v1/projects/:id/files/:file_id
```

Response:
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### Download File

```
GET /api/v1/projects/:id/files/:file_id/download
```

Response: File download

### Get File Versions

```
GET /api/v1/projects/:id/files/:file_id/versions
```

Response: Returns file versions

### Upload New Version

```
POST /api/v1/projects/:id/files/:file_id/versions
```

Request: Multipart form data with change notes

Response: Returns new version

---

## Meetings API

### Get Project Meetings

```
GET /api/v1/projects/:id/meetings
```

Query Parameters:
- `status`: Filter by status (scheduled, live, ended, cancelled)
- `upcoming`: Get upcoming meetings only

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Weekly Standup",
      "description": "Team standup meeting",
      "meeting_link": "https://meet.google.com/xxx",
      "meeting_provider": "google_meet",
      "provider_meeting_id": "xxx",
      "status": "scheduled",
      "scheduled_start": "2024-01-01T10:00:00Z",
      "scheduled_end": "2024-01-01T10:30:00Z",
      "actual_start": null,
      "actual_end": null,
      "organizer_id": "uuid",
      "agenda": "Agenda items...",
      "notes": null,
      "recording_url": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "organizer": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      },
      "participant_count": 5
    }
  ]
}
```

### Get Meeting by ID

```
GET /api/v1/projects/:id/meetings/:meeting_id
```

Response: Returns meeting with full details

### Create Meeting

```
POST /api/v1/projects/:id/meetings
```

Request Body:
```json
{
  "title": "Weekly Standup",
  "description": "Team standup meeting",
  "meeting_provider": "google_meet",
  "scheduled_start": "2024-01-01T10:00:00Z",
  "scheduled_end": "2024-01-01T10:30:00Z",
  "agenda": "Agenda items..."
}
```

Response: Returns created meeting with generated meeting link

### Update Meeting

```
PUT /api/v1/projects/:id/meetings/:meeting_id
```

Request Body:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "scheduled_start": "2024-01-01T11:00:00Z",
  "scheduled_end": "2024-01-01T11:30:00Z",
  "agenda": "Updated agenda..."
}
```

Response: Returns updated meeting

### Delete Meeting

```
DELETE /api/v1/projects/:id/meetings/:meeting_id
```

Response:
```json
{
  "success": true,
  "data": { "deleted": true }
}
```

### Start Meeting

```
POST /api/v1/projects/:id/meetings/:meeting_id/start
```

Response: Returns updated meeting with live status

### End Meeting

```
POST /api/v1/projects/:id/meetings/:meeting_id/end
```

Response: Returns updated meeting with ended status

### Join Meeting

```
POST /api/v1/projects/:id/meetings/:meeting_id/join
```

Response:
```json
{
  "success": true,
  "data": {
    "meeting_link": "https://meet.google.com/xxx"
  }
}
```

### Get Meeting Participants

```
GET /api/v1/projects/:id/meetings/:meeting_id/participants
```

Response: Returns list of participants

### Add Meeting Participant

```
POST /api/v1/projects/:id/meetings/:meeting_id/participants
```

Request Body:
```json
{
  "user_id": "uuid"
}
```

Response: Returns added participant

### Update Meeting Notes

```
PUT /api/v1/projects/:id/meetings/:meeting_id/notes
```

Request Body:
```json
{
  "notes": "Meeting notes..."
}
```

Response: Returns updated meeting

---

## Activity Logs API

### Get Project Activity Logs

```
GET /api/v1/projects/:id/activity
```

Query Parameters:
- `page`, `limit`: Pagination
- `action`: Filter by action
- `entity_type`: Filter by entity type
- `user_id`: Filter by user
- `before_date`: Filter by date range
- `after_date`: Filter by date range

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "user_id": "uuid",
      "action": "message_created",
      "entity_type": "message",
      "entity_id": "uuid",
      "before_data": {},
      "after_data": {
        "content": "Hello world",
        "type": "text"
      },
      "metadata": {},
      "created_at": "2024-01-01T00:00:00Z",
      "user": {
        "id": "uuid",
        "full_name": "John Doe",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

---

## Project Settings API

### Get Project Settings

```
GET /api/v1/projects/:id/settings
```

Response:
```json
{
  "success": true,
  "data": {
    "permissions": {
      "members_can_create_channels": true,
      "members_can_upload_files": true,
      "members_can_schedule_meetings": true,
      "viewers_can_download": true
    },
    "notifications": {
      "notify_on_new_message": true,
      "notify_on_mention": true,
      "notify_on_file_upload": true,
      "notify_on_meeting_invitation": true
    },
    "file_settings": {
      "max_file_size_mb": 100,
      "allowed_file_types": ["image", "pdf", "document", "audio", "video", "spreadsheet"],
      "enable_versioning": true
    }
  }
}
```

### Update Project Settings

```
PUT /api/v1/projects/:id/settings
```

Request Body:
```json
{
  "permissions": {
    "members_can_create_channels": false
  },
  "notifications": {
    "notify_on_new_message": false
  }
}
```

Response: Returns updated settings

---

## Statistics API

### Get Project Statistics

```
GET /api/v1/projects/:id/statistics
```

Response:
```json
{
  "success": true,
  "data": {
    "total_members": 10,
    "total_channels": 6,
    "total_messages": 150,
    "total_files": 25,
    "total_meetings": 5,
    "active_meetings": 1,
    "activity_summary": [
      {
        "action": "message_created",
        "count": 100
      },
      {
        "action": "file_uploaded",
        "count": 25
      }
    ]
  }
}
```

---

## WebSocket Events

### Connection

Connect to WebSocket endpoint:

```
wss://api.teamsync.com/v1/ws
```

Send authentication message:

```json
{
  "type": "auth",
  "token": "jwt_token"
}
```

### Subscribe to Project

```json
{
  "type": "subscribe",
  "project_id": "uuid"
}
```

### Subscribe to Channel

```json
{
  "type": "subscribe_channel",
  "channel_id": "uuid"
}
```

### Events

#### New Message

```json
{
  "type": "message_created",
  "data": { ...message object... }
}
```

#### Message Updated

```json
{
  "type": "message_updated",
  "data": { ...message object... }
}
```

#### Message Deleted

```json
{
  "type": "message_deleted",
  "data": {
    "message_id": "uuid",
    "channel_id": "uuid"
  }
}
```

#### Typing Indicator

```json
{
  "type": "typing",
  "data": {
    "channel_id": "uuid",
    "user_id": "uuid",
    "is_typing": true
  }
}
```

#### New Reaction

```json
{
  "type": "reaction_added",
  "data": {
    "message_id": "uuid",
    "emoji": "👍",
    "user_id": "uuid"
  }
}
```

#### User Joined Channel

```json
{
  "type": "user_joined_channel",
  "data": {
    "channel_id": "uuid",
    "user": { ...user object... }
  }
}
```

#### User Left Channel

```json
{
  "type": "user_left_channel",
  "data": {
    "channel_id": "uuid",
    "user_id": "uuid"
  }
}
```

#### Meeting Started

```json
{
  "type": "meeting_started",
  "data": { ...meeting object... }
}
```

#### Meeting Ended

```json
{
  "type": "meeting_ended",
  "data": {
    "meeting_id": "uuid",
    "project_id": "uuid"
  }
}
```

#### File Uploaded

```json
{
  "type": "file_uploaded",
  "data": { ...file object... }
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication token |
| `FORBIDDEN` | User does not have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable |

---

## Rate Limiting

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```
