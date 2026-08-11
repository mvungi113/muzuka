# 🎵 Music Platform — Full Product & Development Specification

## 1. Project Overview

Build a modern music streaming platform inspired by premium music applications such as Spotify and the Aura Music App concept.

The platform consists of two main applications:

1. A beautiful Flutter mobile music application for listeners.
2. A separate Next.js admin/management website for managing music content.

Both applications communicate through a central Next.js API/backend and use Supabase as the main database and file-storage infrastructure.

The goal is to create a scalable music platform that can start using free/low-cost infrastructure while allowing the storage and infrastructure to be upgraded later without rebuilding the application.

---

# 2. Core Architecture

The system must follow this architecture:

```
                    ┌─────────────────────────┐
                    │     Flutter Mobile      │
                    │       Music App         │
                    └────────────┬────────────┘
                                 │
                                 │ REST API
                                 ▼
                    ┌─────────────────────────┐
                    │       Next.js API       │
                    │     Backend / Server     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
           ┌─────────────────┐      ┌─────────────────┐
           │ Supabase        │      │ Supabase        │
           │ PostgreSQL      │      │ Storage         │
           │                 │      │                 │
           │ Users           │      │ Music           │
           │ Artists         │      │ Covers          │
           │ Albums          │      │ Artist Images   │
           │ Songs           │      │ Other Media     │
           │ Playlists       │      │                 │
           │ Likes           │      └─────────────────┘
           │ History         │
           │ Downloads       │
           └─────────────────┘

                    ▲
                    │
                    │ API
                    │
           ┌────────┴─────────┐
           │   Next.js Admin  │
           │      Website     │
           └──────────────────┘
```

---

# 3. Applications

The project contains three logical parts.

## 3.1 Flutter Mobile Application

**Purpose:**
- Music discovery
- Music streaming
- Music playback
- Offline downloads
- Playlists
- Likes
- Search
- Artist discovery
- Albums
- Listening history
- Recommendations
- User profile

The mobile app is the primary user-facing application.

---

## 3.2 Next.js Admin Website

**Purpose:**
- Manage songs
- Upload songs
- Manage artists
- Manage albums
- Upload covers
- Manage genres
- Manage moods
- Manage playlists
- Manage users
- Publish/unpublish content
- View statistics

The admin website must be separate from the mobile application's UI. It must have a professional dashboard design.

---

## 3.3 Next.js Backend API

The Next.js application must also provide the backend API. Do NOT create a separate NestJS backend.

**Use:**
- Next.js App Router
- Route Handlers
- Server-side functions where appropriate
- REST API endpoints

The Flutter application must communicate with the backend through the API. The admin website should also use the same backend/API where appropriate.

---

# 4. Technology Stack

## Mobile
- **Framework:** Flutter / Dart
- **Audio Playback:** just_audio
- **Background Audio:** audio_service
- **State Management:** Riverpod (use one system consistently)

## Backend
- **Framework:** Next.js
- **Language:** TypeScript
- **Router:** App Router
- **API:** Route Handlers

## Admin Website
- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Modern component architecture
- **Responsive:** Yes (Desktop, Tablet, Mobile)

## Database
- **Provider:** Supabase PostgreSQL
- **ORM:** Prisma

## Storage
- **Provider:** Supabase Storage

**Buckets:**
- songs
- covers
- artist-images
- album-images
- avatars

---

# 5. Important Architecture Rule

**Never tightly couple application logic to Supabase Storage.**

Create a storage abstraction:

```
StorageService
      |
      ├── upload()
      ├── delete()
      ├── getUrl()
      ├── getSignedUrl()
      └── exists()

Current implementation: SupabaseStorageProvider
Future implementation:  CloudflareR2Provider
```

The rest of the application must not care which storage provider is being used.

---

# 6. Product Vision

Use the Aura Music App concept as UI/UX inspiration:
https://www.behance.net/gallery/251433777/Aura-music-mobile-app

**Aura Music App** by Ivan Olshevskii is an AI-powered music app concept focused on mood, personalization, and effortless discovery. A minimal and emotional music experience built around voice interaction, hum-to-search, and intelligent recommendations.

**Do NOT copy the design exactly.** Use the concept as inspiration for:
- Minimal and emotional interface
- Large artwork with strong visual hierarchy
- Smooth animations and transitions
- Modern typography
- Mood-based discovery
- Personalized music experience
- Immersive now-playing screen
- Clean navigation
- Dark theme as primary experience

**Key design principles from Aura:**
- Mood-centric navigation
- Voice interaction and hum-to-search
- Intelligent recommendations
- Effortless music discovery
- Emotional connection with music

The application must have its own branding and visual identity. Do not use Aura branding or copy exact layouts.

---

# 7. Mobile App Design Philosophy

**The app should feel:** Premium, Modern, Fast, Clean, Smooth, Minimal, Music-focused, Easy to navigate, Emotional

**Use:**
- Large album artwork
- Rounded cards
- Smooth transitions
- Bottom navigation
- Dark mode as primary experience
- Strong visual hierarchy
- Mood-based color accents
- Emotional typography

**Avoid:**
- Overcrowded screens
- Excessive buttons
- Complicated navigation
- Old-fashioned music-player layouts
- Cluttered interfaces

---

# 8. Mobile Navigation

```
Home | Search | Discover | Library
```

The mini-player should remain visible when a song is playing. Tapping the mini-player opens the full Now Playing screen.

---

# 9. Home Screen

The Home screen must be personalized. Content must come dynamically from the API. Do not hard-code songs.

```
Good evening 👋

[Recently Played]
[Made For You]
[Trending Now]
[New Releases]
[Popular Artists]
[Because You Listened To...]
```

---

# 10. Mood-Based Discovery

**Initial moods:**
Happy, Romantic, Chill, Energy, Sad, Party, Workout, Worship, Focus, Relax

Each song can have one or multiple moods. When the user selects a mood, the API returns songs associated with that mood.

---

# 11. Discover Screen

```
Discover

Trending
─────────

New Releases
────────────

Browse by Mood
──────────────

Browse by Genre
───────────────
```

---

# 12. Search

Search must support: Songs, Artists, Albums, Playlists, Genres

**API:** `GET /api/search?q=diamond`

Results should be grouped and support pagination.

---

# 13. Music Player

The Now Playing screen must contain:
- Large album artwork
- Song title & Artist
- Progress bar with current/remaining time
- Play/Pause, Previous, Next
- Shuffle, Repeat
- Like, Download, Add to Playlist

Must support: Play, Pause, Seek, Next, Previous, Queue, Shuffle, Repeat

---

# 14. Audio Streaming

Audio files stored in Supabase Storage. Preferred architecture:

```
Flutter → Next.js API (validate user, return authorized URL) → Supabase Storage → Audio Player
```

**Never expose:** Supabase service role key, Database password, Private API keys

---

# 15. Download / Offline Music

The app must support downloading songs for offline listening.

**Local download database fields:** songId, localPath, downloadedAt, downloadStatus, fileSize

**User actions:** Download, Pause, Resume, Cancel, Delete, View downloaded music

---

# 16. Library

Library should contain:
- Liked Songs
- Playlists
- Downloads
- Recently Played
- Saved Albums
- Followed Artists

---

# 17. Likes

**API:**
- `POST /api/songs/:id/like`
- `DELETE /api/songs/:id/like`

Database must prevent duplicate likes (unique constraint: userId + songId).

---

# 18. Playlists

Users must be able to: Create, Rename, Delete playlists, Add/Remove songs, Reorder songs, Play playlist, Download playlist

---

# 19. Listening History

Record user listening activity with: User, Song, Played at, Playback duration, Completed or not

Use intelligent tracking — only record a play after meaningful listening time.

---

# 20. Song Play Count

Songs should maintain: Total plays, Recent plays, Unique listeners

Trending calculations should use: Plays, Recent plays, Likes, Completion rate (not just lifetime playCount).

---

# 21. Artists

Artist information: Name, Biography, Profile image, Cover image, Genre, Followers, Songs, Albums, Playlists

---

# 22. Albums

Album information: Title, Artist, Cover, Release date, Description, Genre, Songs

---

# 23. Genres

**Initial genres:** Bongo Flava, Afrobeats, Amapiano, Hip Hop, R&B, Gospel, Pop, Dance, Reggae, Acoustic, Electronic

Genres must be database-driven. Do not hard-code them in Flutter UI.

---

# 24. Admin Website

**Admin routes:**
```
/admin
/admin/songs
/admin/artists
/admin/albums
/admin/playlists
/admin/users
/admin/genres
/admin/moods
/admin/analytics
/admin/settings
```

---

# 25. Admin Dashboard

Dashboard statistics: Total songs, artists, albums, users, streams, downloads, Most played songs, Most popular artists, Recent uploads

---

# 26. Admin Song Upload

Upload form: Song Title, Artist, Album, Genre, Mood, Description, Audio File, Cover Image, Release Date, Published

Upload process: Admin → Next.js API → Validate file → Upload to Supabase Storage → Save metadata in PostgreSQL → Song becomes available

---

# 27. Song Validation

Backend must validate: File type, File size, Required metadata, Artist, Album, Genre, Cover image

Backend validation is mandatory — never trust frontend-only validation.

---

# 28. Admin Artist Management

Admin can: Create, Edit, Delete artists, Upload images, Add biography, Assign genres, View songs/albums/statistics

---

# 29. Admin Album Management

Admin can: Create, Edit, Delete albums, Upload covers, Assign artists, Add songs, Change release date, Publish/unpublish

---

# 30. Publishing System

Songs support: `DRAFT`, `PUBLISHED`, `UNPUBLISHED`

Only PUBLISHED songs appear in the mobile application.

---

# 31. Admin Authentication

Roles: `USER`, `ADMIN`, `SUPER_ADMIN`

Initial implementation: USER and ADMIN. Database architecture should support future roles.

---

# 32. API Design

**Authentication:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

**Songs:**
- `GET    /api/songs`
- `GET    /api/songs/:id`
- `POST   /api/admin/songs`
- `PATCH  /api/admin/songs/:id`
- `DELETE /api/admin/songs/:id`

**Artists:**
- `GET    /api/artists`
- `GET    /api/artists/:id`
- `POST   /api/admin/artists`
- `PATCH  /api/admin/artists/:id`
- `DELETE /api/admin/artists/:id`

**Albums:**
- `GET    /api/albums`
- `GET    /api/albums/:id`
- `POST   /api/admin/albums`
- `PATCH  /api/admin/albums/:id`
- `DELETE /api/admin/albums/:id`

**Playlists:**
- `GET    /api/playlists`
- `POST   /api/playlists`
- `PATCH  /api/playlists/:id`
- `DELETE /api/playlists/:id`

**Search:** `GET /api/search?q=`

**Streaming:** `GET /api/songs/:id/stream`

**Likes:**
- `POST   /api/songs/:id/like`
- `DELETE /api/songs/:id/like`

**History:**
- `POST /api/history`
- `GET  /api/history`

---

# 33. Database Design

**Core models:**
User, Artist, Album, Song, Genre, Mood, Playlist, PlaylistSong, SongLike, ListeningHistory, Download, ArtistFollower, AlbumLike, RecentlyPlayed

---

# 34. User Model

**Fields:** id, name, email, passwordHash OR authProviderId, avatarUrl, role, createdAt, updatedAt

Never store plain-text passwords.

---

# 35. Song Model

**Fields:** id, title, slug, description, artistId, albumId, audioPath, coverPath, duration, genreId, releaseDate, status, playCount, createdAt, updatedAt

Use storage paths rather than hard-coded public URLs.

---

# 36. Artist Model

**Fields:** id, name, slug, biography, imagePath, coverPath, createdAt, updatedAt

---

# 37. Album Model

**Fields:** id, title, slug, artistId, description, coverPath, releaseDate, status, createdAt, updatedAt

---

# 38. Playlist Model

**Fields:** id, name, description, coverPath, userId, isPublic, createdAt, updatedAt

---

# 39. PlaylistSong

**Fields:** id, playlistId, songId, position, addedAt

Use position to support song ordering.

---

# 40. SongLike

**Fields:** id, userId, songId, createdAt

**Unique constraint:** userId + songId

---

# 41. ListeningHistory

**Fields:** id, userId, songId, playedAt, durationPlayed, completed

---

# 42. Download

**Fields:** id, userId, songId, downloadedAt, size

The actual offline file path is managed locally on the device.

---

# 43. Mood Relationship

A song can have multiple moods. Use a `SongMood` junction table.

---

# 44. Security

**Never expose:** Database passwords, Supabase service role key, Admin secrets, Private storage credentials

**Environment variables:**
```
DATABASE_URL=
DIRECT_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
```

Only server-side code can access `SUPABASE_SERVICE_ROLE_KEY`. Never put it in `NEXT_PUBLIC_*`.

---

# 45. Authorization

Every admin API must verify:
1. User is authenticated
2. User has admin privileges
3. User is allowed to perform the operation

Authorization must happen on the server, not just frontend button hiding.

---

# 46. API Error Format

**Error:**
```json
{
  "success": false,
  "message": "Song not found",
  "code": "SONG_NOT_FOUND"
}
```

**Success:**
```json
{
  "success": true,
  "data": {}
}
```

---

# 47. Pagination

**Example:** `GET /api/songs?page=1&limit=20`

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "totalPages": 13
  }
}
```

---

# 48. Performance

Use: Database indexes, Pagination, Caching, Image optimization, Lazy loading, Efficient API queries, Background processing

---

# 49. Image Optimization

Use WebP/AVIF where appropriate, Multiple image sizes, Lazy loading.

---

# 50. Audio Requirements

**Initially prioritize:** MP3

**Future formats:** AAC, M4A, FLAC

Store in database: File format, Bitrate, Duration, File size

---

# 51. Recommendations

First recommendation engine does NOT need AI. Use rules: Recently played, Most played, Liked songs, Same genre, Same mood, Same artist, Popular in recent period.

---

# 52. Trending Algorithm

```
Trending Score = recent plays + recent likes + completion rate + engagement
```

Do not simply use total playCount.

---

# 53. Notifications

Architecture should support notifications later: New release, New artist, Playlist update, Recommended song, Followed artist released music

---

# 54. Analytics

Admin should eventually see: Daily/Weekly/Monthly streams, Top songs, Top artists, Most active users, Downloads, Likes, Completion rates

---

# 55. Project Structure

```
music-platform/
│
├── mobile/              # Flutter application
│
├── web/                 # Next.js admin + API
│   ├── app/
│   │   ├── admin/
│   │   ├── api/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── prisma/
│
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
└── README.md
```

---

# 56. Development Phases

**Do NOT build everything simultaneously. Implement in phases.**

## Phase 1 — Project Foundation
- Repository, Flutter app, Next.js app, Supabase project, PostgreSQL connection, Prisma, Environment configuration

## Phase 2 — Database
- User, Artist, Album, Song, Genre, Mood, Playlist, PlaylistSong, SongLike, ListeningHistory, Download

## Phase 3 — Authentication
- Registration, Login, Logout, Current user, Protected routes, Admin authentication, Roles

## Phase 4 — Admin Dashboard
- Admin login, Dashboard, Song/Artist/Album/Genre/Mood management

## Phase 5 — Storage
- Create Supabase buckets, Audio/Cover/Artist image upload, StorageService abstraction

## Phase 6 — Song Management
- Create artist → Create album → Upload cover → Upload song → Add metadata → Publish

## Phase 7 — Flutter Foundation
- API client, Authentication, Navigation, Theme, Models, State management, Error handling

## Phase 8 — Home
- Recently played, Trending, New releases, Popular artists, Recommended songs

## Phase 9 — Music Player
- Play, Pause, Seek, Next, Previous, Queue, Shuffle, Repeat, Background playback

## Phase 10 — Search
- Song/Artist/Album/Playlist/Genre search

## Phase 11 — Library
- Likes, Playlists, Recently played, Downloads

## Phase 12 — Offline Downloads
- Download, Progress, Pause, Resume, Cancel, Delete, Offline playback

## Phase 13 — Recommendations
- Rule-based recommendations

## Phase 14 — Analytics
- Streams, Downloads, Likes, Popular songs/artists

## Phase 15 — UI Polish
- Animations, Transitions, Loading/Empty/Error states, Player animations, Micro-interactions

---

# 57. UI Requirements

Every screen must have:
- **Loading state:** Skeleton UI
- **Empty state:** "No songs found"
- **Error state:** "Something went wrong" + [Try Again]

---

# 58. Responsive Admin Website

Must work on: Desktop, Tablet, Mobile

---

# 59. Mobile UI

Bottom navigation, Gesture-friendly controls, Large touch targets, Smooth scrolling, Animated player, Optimized images, Dark theme

---

# 60. Branding

Do not use Spotify or Aura branding. Create an original: App name, Logo, Color palette, Typography, Iconography

---

# 61. Music Rights

Only music that the platform has the legal right to distribute should be uploaded. Do not scrape music from other platforms.

---

# 62. Future Artist Platform

Architecture should allow artists to register with role `ARTIST` and have their own dashboard for uploads, songs, albums, streams, followers, analytics.

---

# 63. Future Monetization

Architecture should allow: Premium subscription, Advertising, Artist revenue sharing, Paid downloads, Sponsored playlists

---

# 64. Environment Variables

Never commit secrets. Create `.env.example`. Never commit `.env.local`.

---

# 65. Git Requirements

**Branches:** main, develop, feature/...

**Commit messages:** `feat: add song upload`, `fix: resolve playlist ordering`, `refactor: improve storage service`

---

# 66. Testing

**Backend:** API tests, Authentication tests, Authorization tests, Database tests

**Flutter:** Unit tests, Widget tests, Important player tests

---

# 67. Documentation

Maintain: `docs/architecture.md`, `docs/database.md`, `docs/api.md`, `docs/storage.md`, `docs/authentication.md`, `docs/deployment.md`

---

# 68. Agent Development Rules

1. Do not randomly change the architecture
2. Do not introduce another backend framework (use Next.js)
3. Use TypeScript for Next.js
4. Use Dart for Flutter
5. Use PostgreSQL through Supabase
6. Use Supabase Storage initially
7. Do not expose private credentials
8. Do not hard-code songs in Flutter
9. All music in Flutter must come from the API
10. Admin uploads must go through the backend/storage system
11. Do not put admin functionality in the listener app
12. Do not build all features at once — follow development phases
13. Before changing code, understand the current architecture
14. Do not delete working functionality without reason
15. Do not create duplicate services/components
16. Keep business logic out of UI components
17. Use reusable components
18. Handle errors properly
19. Use loading and empty states
20. Keep the application scalable

---

# 69. Agent Workflow

For every development task:
1. Read README.md
2. Inspect existing project structure
3. Identify affected modules
4. Check database schema
5. Check existing API
6. Implement the smallest correct change
7. Run formatting
8. Run type checking
9. Run tests
10. Fix errors
11. Verify the feature
12. Update documentation if necessary

---

# 70. Definition of Done

A feature is complete when: Frontend works, Backend works, Database works, Auth/Authorization respected, Error handling exists, Loading/Empty states exist, Mobile UI works, API responses correct, Tests pass, Documentation updated.

---

# 71. MVP Definition

## Mobile
Authentication, Home, Search, Discover, Library, Song/Artist/Album details, Music player, Streaming, Likes, Playlists, Recently played, Downloads, Offline playback

## Admin
Login, Dashboard, Upload song, Manage songs/artists/albums/genres/moods, Publish/unpublish

## Backend
Authentication, Authorization, Songs/Artists/Albums/Playlists API, Search API, Streaming API, Likes/History API, Download support, Admin APIs

## Infrastructure
Supabase PostgreSQL, Supabase Storage, Prisma, Next.js, Flutter

---

# 72. Final Product Goal

The final product should feel like a real commercial music platform.

```
User Flow:
Register → Home → Discover → Search → Play → Like → Playlist → Download → Offline

Admin Flow:
Login → Upload Artist → Create Album → Upload Cover → Upload Song → Add Genre/Mood → Publish → Appears in Mobile App

Data Flow:
Admin Website → Next.js API → Supabase → Flutter App
```

---

# 73. Long-Term Vision

The platform should eventually support: Independent artists, Artist profiles/uploads/analytics, Followers, Personalized recommendations, Mood-based playlists, AI recommendations, Social features, Push notifications, Premium subscriptions, Advertising, Artist monetization, Multiple audio qualities, CDN, Large-scale streaming

Start with: Flutter + Next.js + Supabase PostgreSQL + Supabase Storage. Scale individual components when the platform requires it.

---

# END OF SPECIFICATION
