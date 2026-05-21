"""GetSpot backend - in-memory FastAPI for social discovery MVP."""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import logging

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI(title="GetSpot API")
api_router = APIRouter(prefix="/api")

# ---------- Demo image pools ----------
EVENT_HEROES = [
    "https://images.unsplash.com/photo-1554499299-d3ec6385c514?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    "https://images.pexels.com/photos/10578910/pexels-photo-10578910.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/6968861/pexels-photo-6968861.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.unsplash.com/photo-1563902242731-bcde8ffa1d36?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    "https://images.unsplash.com/photo-1717231856724-5e52b126a6d1?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
    "https://images.unsplash.com/photo-1717231855727-06fa2b4c431c?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80",
]

SPOT_IMAGES = [
    "https://images.unsplash.com/photo-1648808694138-6706c5efc80a?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
    "https://images.pexels.com/photos/34624845/pexels-photo-34624845.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "https://images.pexels.com/photos/32704881/pexels-photo-32704881.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "https://images.unsplash.com/photo-1638882267964-0d9764607947?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
    "https://images.pexels.com/photos/30301206/pexels-photo-30301206.png?auto=compress&cs=tinysrgb&w=1000",
    "https://images.unsplash.com/photo-1493246318656-5bfd4cfb29b8?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
    "https://images.pexels.com/photos/29751758/pexels-photo-29751758.jpeg?auto=compress&cs=tinysrgb&w=1000",
    "https://images.unsplash.com/photo-1613066697301-d7dccfc86bb5?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80",
]

AVATARS = [
    "https://images.unsplash.com/photo-1758600435913-c45b319745ca?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.unsplash.com/photo-1758874384842-7e79ce77ed1a?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.unsplash.com/photo-1737599819881-df2553a821ad?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.unsplash.com/photo-1613678786967-46a6dd2f5c21?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.pexels.com/photos/7312381/pexels-photo-7312381.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.pexels.com/photos/5325913/pexels-photo-5325913.jpeg?auto=compress&cs=tinysrgb&w=400",
]

STORY_BGS = [
    "https://images.unsplash.com/photo-1658563309427-6e703a70203c?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.unsplash.com/photo-1644243019151-0bb97ce1af84?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.pexels.com/photos/8770442/pexels-photo-8770442.jpeg?auto=compress&cs=tinysrgb&w=400",
    "https://images.unsplash.com/photo-1661952731149-8954c691096f?crop=entropy&cs=srgb&fm=jpg&w=400&q=80",
    "https://images.pexels.com/photos/997314/pexels-photo-997314.jpeg?auto=compress&cs=tinysrgb&w=400",
]


# ---------- Models ----------
class User(BaseModel):
    id: str
    name: str
    username: str
    avatar: str
    verified: bool = False
    bio: Optional[str] = None
    followers: int = 0
    following: int = 0


class Story(BaseModel):
    id: str
    user_id: str
    user_name: str
    avatar: str
    background: str
    viewed: bool = False


class Event(BaseModel):
    id: str
    title: str
    host_id: str
    host_name: str
    host_avatar: str
    image: str
    location: str
    city: str = "San Francisco"
    distance_km: int = 0
    latitude: float
    longitude: float
    date: str  # ISO
    description: str
    category: str
    event_type: str = "informal"  # cultural | activity | informal | professional | creative | health
    attendees: List[str] = []  # avatar urls
    member_count: int = 0
    capacity: int = 500  # 0 = open (no cap)
    is_premium: bool = False
    going: bool = False


class Spot(BaseModel):
    id: str
    name: str
    address: str
    image: str
    rating: float
    category: str
    latitude: float
    longitude: float
    description: Optional[str] = None


class Post(BaseModel):
    id: str
    user_id: str
    user_name: str
    user_avatar: str
    image: str
    caption: str
    likes: int = 0
    comments: int = 0
    created_at: str


class ChatPreview(BaseModel):
    id: str
    user_id: str
    name: str
    avatar: str
    last_message: str
    time: str
    unread: int = 0
    online: bool = False


class Message(BaseModel):
    id: str
    chat_id: str
    sender: str  # 'me' or user_id
    text: str
    time: str


class CreateEventReq(BaseModel):
    title: str
    location: str
    date: str
    description: str
    category: str = "Social"
    event_type: str = "informal"
    capacity: int = 50
    image: Optional[str] = None


# ---------- Seed Data ----------
ME = User(
    id="me",
    name="Budiarti R",
    username="budiarti",
    avatar=AVATARS[0],
    verified=True,
    bio="✨ Curating moments | 🌿 Wellness explorer | 📍 San Francisco",
    followers=10250,
    following=142,
)

USERS = [
    ME,
    User(id="u1", name="Rafael Maetimo", username="rafael.m", avatar=AVATARS[1], verified=True, followers=2400, following=180),
    User(id="u2", name="Samantha William", username="sam.w", avatar=AVATARS[2], verified=False, followers=1300, following=290),
    User(id="u3", name="Michael Franz", username="m.franz", avatar=AVATARS[3], verified=True, followers=8800, following=120),
    User(id="u4", name="Camelia Rose", username="camelia", avatar=AVATARS[4], verified=False, followers=550, following=420),
    User(id="u5", name="Jackson Kim", username="jackson_k", avatar=AVATARS[5], verified=True, followers=15600, following=98),
]

STORIES = [
    Story(id=f"s{i}", user_id=u.id, user_name=u.name.split(" ")[0], avatar=u.avatar, background=STORY_BGS[i % len(STORY_BGS)], viewed=(i > 2))
    for i, u in enumerate(USERS[1:])
]

EVENTS = [
    Event(
        id="e1",
        title="Sunset Yoga & Chill",
        host_id="u1",
        host_name="Rafael Maetimo",
        host_avatar=AVATARS[1],
        image=EVENT_HEROES[0],
        location="Skyline Rooftop, LA",
        city="Los Angeles",
        distance_km=127,
        latitude=37.7849,
        longitude=-122.4094,
        date="2026-06-08T18:00:00Z",
        description="Wind down with a guided sunset yoga flow followed by herbal tea and ambient music. Perfect way to reset midweek.",
        category="Wellness",
        event_type="health",
        attendees=[AVATARS[2], AVATARS[3], AVATARS[4], AVATARS[5]],
        member_count=15,
        capacity=500,
    ),
    Event(
        id="e2",
        title="Beachside Picnic",
        host_id="u2",
        host_name="Samantha William",
        host_avatar=AVATARS[2],
        image=EVENT_HEROES[1],
        location="The Boardwalk, Santa Cruz",
        city="Santa Cruz",
        distance_km=68,
        latitude=36.9626,
        longitude=-122.0181,
        date="2026-06-12T14:00:00Z",
        description="Bring your favorite snacks and a blanket — golden hour picnic by the waves. Acoustic guitar guaranteed.",
        category="Social",
        event_type="informal",
        attendees=[AVATARS[1], AVATARS[3], AVATARS[5]],
        member_count=22,
        capacity=500,
        is_premium=True,
    ),
    Event(
        id="e3",
        title="Rooftop Jazz Night",
        host_id="u3",
        host_name="Michael Franz",
        host_avatar=AVATARS[3],
        image=EVENT_HEROES[2],
        location="The Marble Table, NYC",
        city="New York",
        distance_km=512,
        latitude=40.7411,
        longitude=-74.0017,
        date="2026-06-18T20:00:00Z",
        description="Live jazz quartet, craft cocktails, and the best skyline view in Manhattan.",
        category="Music",
        event_type="cultural",
        attendees=[AVATARS[1], AVATARS[2], AVATARS[4]],
        member_count=48,
        capacity=500,
    ),
    Event(
        id="e4",
        title="Morning Hike & Coffee",
        host_id="u4",
        host_name="Camelia Rose",
        host_avatar=AVATARS[4],
        image=EVENT_HEROES[3],
        location="Marin Headlands",
        city="Sausalito",
        distance_km=12,
        latitude=37.8260,
        longitude=-122.4990,
        date="2026-05-28T07:00:00Z",
        description="Easy 3-mile loop with bay views, ending at a hidden cafe for pour-over.",
        category="Outdoors",
        event_type="activity",
        attendees=[AVATARS[1], AVATARS[5]],
        member_count=8,
        capacity=10,
    ),
    Event(
        id="e5",
        title="Art Walk: Mission District",
        host_id="u5",
        host_name="Jackson Kim",
        host_avatar=AVATARS[5],
        image=EVENT_HEROES[4],
        location="Mission District, SF",
        city="San Francisco",
        distance_km=4,
        latitude=37.7599,
        longitude=-122.4148,
        date="2026-06-02T16:00:00Z",
        description="Self-guided mural tour with local artists. Ends with tacos and natural wine.",
        category="Culture",
        event_type="creative",
        attendees=[AVATARS[2], AVATARS[3], AVATARS[4]],
        member_count=14,
        capacity=30,
    ),
    Event(
        id="e6",
        title="Founder Coffee Roundtable",
        host_id="me",
        host_name="Budiarti R",
        host_avatar=AVATARS[0],
        image=EVENT_HEROES[5],
        location="Sightglass Coffee, SF",
        city="San Francisco",
        distance_km=3,
        latitude=37.7720,
        longitude=-122.4108,
        date="2026-03-04T09:00:00Z",
        description="Casual coffee chat with early-stage founders. Bring one win and one challenge.",
        category="Business",
        event_type="professional",
        attendees=[AVATARS[1], AVATARS[3]],
        member_count=6,
        capacity=12,
    ),
    Event(
        id="e7",
        title="Vinyl Listening Session",
        host_id="me",
        host_name="Budiarti R",
        host_avatar=AVATARS[0],
        image=EVENT_HEROES[1],
        location="The Garage, Oakland",
        city="Oakland",
        distance_km=14,
        latitude=37.8044,
        longitude=-122.2712,
        date="2025-12-20T19:00:00Z",
        description="Bring one record. We listen, talk, repeat. BYOB.",
        category="Music",
        event_type="cultural",
        attendees=[AVATARS[2], AVATARS[4], AVATARS[5]],
        member_count=11,
        capacity=15,
    ),
    Event(
        id="e8",
        title="Sunrise Run Club",
        host_id="u2",
        host_name="Samantha William",
        host_avatar=AVATARS[2],
        image=EVENT_HEROES[3],
        location="Crissy Field",
        city="San Francisco",
        distance_km=5,
        latitude=37.8030,
        longitude=-122.4660,
        date="2025-11-30T06:30:00Z",
        description="5k along the bay. All paces welcome. Coffee after.",
        category="Outdoors",
        event_type="activity",
        attendees=[AVATARS[0], AVATARS[3]],
        member_count=18,
        capacity=0,  # open
        going=True,
    ),
]

SPOTS = [
    Spot(id="sp1", name="Ember & Oak", address="55 Grove Street, Brooklyn, NY", image=SPOT_IMAGES[0], rating=4.5, category="Restaurants", latitude=37.7849, longitude=-122.4194),
    Spot(id="sp2", name="Luna Bistro", address="410 Sunset Blvd, Los Angeles, CA", image=SPOT_IMAGES[1], rating=4.6, category="Restaurants", latitude=37.7799, longitude=-122.4144),
    Spot(id="sp3", name="Saffron Soul", address="89 Curry Lane, San Francisco, CA", image=SPOT_IMAGES[2], rating=4.7, category="Restaurants", latitude=37.7749, longitude=-122.4094),
    Spot(id="sp4", name="The Marble Table", address="14 West 22nd St, New York, NY", image=SPOT_IMAGES[3], rating=4.4, category="Bars", latitude=37.7699, longitude=-122.4044),
    Spot(id="sp5", name="Komorebi Kitchen", address="22 Willow St, Seattle, WA", image=SPOT_IMAGES[4], rating=4.8, category="Cafe", latitude=37.7649, longitude=-122.3994),
    Spot(id="sp6", name="Skybar 88", address="88 High Tower, San Francisco, CA", image=SPOT_IMAGES[5], rating=4.6, category="Rooftop", latitude=37.7949, longitude=-122.4244),
    Spot(id="sp7", name="Verdant Park", address="Golden Gate, San Francisco, CA", image=SPOT_IMAGES[6], rating=4.9, category="Parks", latitude=37.7699, longitude=-122.4844),
    Spot(id="sp8", name="Velvet Lounge", address="Mission St, San Francisco, CA", image=SPOT_IMAGES[7], rating=4.3, category="Bars", latitude=37.7599, longitude=-122.4194),
]

POSTS = [
    Post(id="p1", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=EVENT_HEROES[5], caption="Golden hour magic ✨ #CityVibes", likes=234, comments=12, created_at="2026-02-10T15:00:00Z"),
    Post(id="p2", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=SPOT_IMAGES[5], caption="Best rooftop in the city 🌇", likes=189, comments=8, created_at="2026-02-08T19:30:00Z"),
    Post(id="p3", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=EVENT_HEROES[0], caption="Sunset yoga reset 🧘", likes=412, comments=23, created_at="2026-02-05T18:00:00Z"),
    Post(id="p4", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=SPOT_IMAGES[2], caption="Hidden gem in the Mission 🌶️", likes=156, comments=6, created_at="2026-02-02T13:00:00Z"),
    Post(id="p5", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=EVENT_HEROES[3], caption="Morning trail therapy 🌲", likes=298, comments=15, created_at="2026-01-30T08:00:00Z"),
    Post(id="p6", user_id="me", user_name="Budiarti R", user_avatar=AVATARS[0], image=SPOT_IMAGES[7], caption="Late night jazz vibes 🎷", likes=178, comments=9, created_at="2026-01-28T22:00:00Z"),
]

CHATS = [
    ChatPreview(id="c1", user_id="u1", name="Rafael Maetimo", avatar=AVATARS[1], last_message="See you at the rooftop! 🌅", time="2m", unread=2, online=True),
    ChatPreview(id="c2", user_id="u2", name="Samantha William", avatar=AVATARS[2], last_message="That picnic was unreal 🧺", time="1h", unread=0, online=True),
    ChatPreview(id="c3", user_id="u3", name="Michael Franz", avatar=AVATARS[3], last_message="Sent you the playlist", time="3h", unread=1, online=False),
    ChatPreview(id="c4", user_id="u4", name="Camelia Rose", avatar=AVATARS[4], last_message="Coffee tomorrow?", time="1d", unread=0, online=False),
    ChatPreview(id="c5", user_id="u5", name="Jackson Kim", avatar=AVATARS[5], last_message="🔥🔥🔥", time="2d", unread=0, online=True),
]

MESSAGES = {
    "c1": [
        Message(id="m1", chat_id="c1", sender="u1", text="Hey! Are you coming to sunset yoga tonight?", time="6:12 PM"),
        Message(id="m2", chat_id="c1", sender="me", text="Yes! Wouldn't miss it 🧘‍♀️", time="6:14 PM"),
        Message(id="m3", chat_id="c1", sender="u1", text="Bring a friend if you want, free for first timers", time="6:15 PM"),
        Message(id="m4", chat_id="c1", sender="me", text="Amazing, I'll bring Sam", time="6:16 PM"),
        Message(id="m5", chat_id="c1", sender="u1", text="See you at the rooftop! 🌅", time="6:18 PM"),
    ],
    "c2": [
        Message(id="m6", chat_id="c2", sender="u2", text="That picnic was unreal 🧺", time="5:02 PM"),
    ],
    "c3": [
        Message(id="m7", chat_id="c3", sender="u3", text="Sent you the playlist", time="3:30 PM"),
    ],
    "c4": [
        Message(id="m8", chat_id="c4", sender="u4", text="Coffee tomorrow?", time="Yesterday"),
    ],
    "c5": [
        Message(id="m9", chat_id="c5", sender="u5", text="🔥🔥🔥", time="2d ago"),
    ],
}


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"name": "GetSpot API", "status": "ok"}


@api_router.get("/me", response_model=User)
async def get_me():
    return ME


@api_router.get("/stories", response_model=List[Story])
async def get_stories():
    return STORIES


@api_router.get("/events", response_model=List[Event])
async def get_events(tab: Optional[str] = None, event_type: Optional[str] = None, category: Optional[str] = None):
    from datetime import datetime as _dt, timezone as _tz
    now = _dt.now(_tz.utc)
    items = list(EVENTS)

    if tab:
        t = tab.lower()
        if t == "joined":
            items = [e for e in items if e.going]
        elif t == "past":
            items = [e for e in items if _dt.fromisoformat(e.date.replace("Z", "+00:00")) < now]
        elif t == "mine" or t == "my":
            items = [e for e in items if e.host_id == "me"]
        elif t == "overview":
            items = [e for e in items if _dt.fromisoformat(e.date.replace("Z", "+00:00")) >= now]

    if event_type and event_type.lower() != "all":
        items = [e for e in items if e.event_type.lower() == event_type.lower()]

    if category and category.lower() not in ("all", "upcoming", "past", "trending"):
        items = [e for e in items if e.category.lower() == category.lower()]

    return items


@api_router.get("/events/{event_id}", response_model=Event)
async def get_event(event_id: str):
    for e in EVENTS:
        if e.id == event_id:
            return e
    raise HTTPException(404, "Event not found")


@api_router.post("/events/{event_id}/going")
async def toggle_going(event_id: str):
    for e in EVENTS:
        if e.id == event_id:
            e.going = not e.going
            if e.going:
                e.member_count += 1
            else:
                e.member_count = max(0, e.member_count - 1)
            return {"going": e.going, "member_count": e.member_count}
    raise HTTPException(404, "Event not found")


@api_router.post("/events", response_model=Event)
async def create_event(req: CreateEventReq):
    new_event = Event(
        id=f"e{uuid.uuid4().hex[:6]}",
        title=req.title,
        host_id="me",
        host_name=ME.name,
        host_avatar=ME.avatar,
        image=req.image or EVENT_HEROES[len(EVENTS) % len(EVENT_HEROES)],
        location=req.location,
        city="San Francisco",
        distance_km=2,
        latitude=37.7749 + (len(EVENTS) * 0.005),
        longitude=-122.4194 + (len(EVENTS) * 0.005),
        date=req.date,
        description=req.description,
        category=req.category,
        event_type=req.event_type,
        capacity=req.capacity,
        attendees=[AVATARS[1], AVATARS[2]],
        member_count=1,
    )
    EVENTS.insert(0, new_event)
    return new_event


@api_router.get("/spots", response_model=List[Spot])
async def get_spots(category: Optional[str] = None):
    if category and category.lower() != "all":
        return [s for s in SPOTS if s.category.lower() == category.lower()]
    return SPOTS


@api_router.get("/spots/{spot_id}", response_model=Spot)
async def get_spot(spot_id: str):
    for s in SPOTS:
        if s.id == spot_id:
            return s
    raise HTTPException(404, "Spot not found")


@api_router.get("/posts", response_model=List[Post])
async def get_posts(user_id: Optional[str] = None):
    if user_id:
        return [p for p in POSTS if p.user_id == user_id]
    return POSTS


@api_router.get("/chats", response_model=List[ChatPreview])
async def get_chats():
    return CHATS


@api_router.get("/chats/{chat_id}/messages", response_model=List[Message])
async def get_messages(chat_id: str):
    return MESSAGES.get(chat_id, [])


class SendMessageReq(BaseModel):
    text: str


@api_router.post("/chats/{chat_id}/messages", response_model=Message)
async def send_message(chat_id: str, req: SendMessageReq):
    new_msg = Message(
        id=f"m{uuid.uuid4().hex[:6]}",
        chat_id=chat_id,
        sender="me",
        text=req.text,
        time=datetime.now(timezone.utc).strftime("%-I:%M %p"),
    )
    MESSAGES.setdefault(chat_id, []).append(new_msg)
    for c in CHATS:
        if c.id == chat_id:
            c.last_message = req.text
            c.time = "now"
            c.unread = 0
    return new_msg


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)
