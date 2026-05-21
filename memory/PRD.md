# GetSpot — Premium Glassmorphism Social Discovery App

## Product Vision
GetSpot is a premium social discovery platform for Gen Z, blending event discovery, real-world places, social feed, and chat under an Apple-tier light glassmorphism design system.

## Tech Stack
- **Frontend:** React Native (Expo Router 6, SDK 54), `expo-blur`, `expo-linear-gradient`, `lucide-react-native`, `react-native-maps` (native), `react-native-reanimated`
- **Backend:** FastAPI (Python) — in-memory data store (no persistence per user request)
- **No authentication** — single mock user `Budiarti R`
- **No 3rd-party LLM/payment integrations** in v1

## Design System (Light Glassmorphism)
- Palette: `#F5EFE6`, `#E8DFCA`, `#6D94C5`, `#CBDCEB`, gold accent `#C9A24B`
- Tokens centralized in `/app/frontend/src/theme.ts`
- All cards: `BlurView` + soft inner white border + multi-layer shadows
- Floating capsule tab bar with center FAB

## Screens (5-tab + secondaries)
| Tab | Route | Purpose |
|-----|-------|---------|
| Map | `/map` | Real interactive map (Apple-style on native, stylized on web) with floating glass overlays, nearby spots carousel |
| Discover | `/discover` | Greeting + story rings + filter pills + immersive event feed |
| Create | `/create` (modal) | Choose Event / Spot / Story → form |
| Chats | `/chats` | Active-now row + chat list → `/chat/[id]` detail |
| Profile | `/profile` | Avatar, stats glass card, bio, segmented control, post grid |

Secondary: `/spots` (Top Spots search), `/event/[id]` (event detail), `/settings`, `/chat/[id]`.

## Backend Endpoints (in-memory)
- `GET /api/me`
- `GET /api/stories`
- `GET /api/events?category=`
- `GET /api/events/{id}` · `POST /api/events/{id}/going` · `POST /api/events`
- `GET /api/spots?category=`
- `GET /api/posts?user_id=`
- `GET /api/chats` · `GET /api/chats/{id}/messages` · `POST /api/chats/{id}/messages`

## Demo Content (Seeded)
- 6 users (diverse avatars), 5 stories, 5 events, 8 spots, 6 posts, 5 chat threads with messages.
- All imagery from curated Unsplash/Pexels URLs.

## Smart Business Enhancement
- **Premium event tier** — `is_premium` flag on events surfaces a gold "Premium" badge (revenue lever for hosts to promote paid/featured listings later).

## Next Items (post-MVP)
- Real RSVP persistence (Mongo)
- Push notifications, deep links
- User-uploaded images (base64)
- Real-time chat via websockets
