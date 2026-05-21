"""GetSpot backend regression tests - in-memory FastAPI."""
import os
import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://glass-discovery-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


# Health
def test_root(s):
    r = s.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# Me
def test_me_returns_budiarti(s):
    r = s.get(f"{API}/me")
    assert r.status_code == 200
    j = r.json()
    assert j["id"] == "me"
    assert j["name"] == "Budiarti R"
    assert j["verified"] is True


# Stories
def test_stories_returns_five(s):
    r = s.get(f"{API}/stories")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 5
    assert all("avatar" in x and "background" in x for x in data)


# Events list + category filter
def test_events_returns_five(s):
    r = s.get(f"{API}/events")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 5
    assert any(e["id"] == "e1" for e in data)


def test_events_category_filter(s):
    r = s.get(f"{API}/events", params={"category": "Wellness"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(e["category"].lower() == "wellness" for e in data)


def test_event_detail(s):
    r = s.get(f"{API}/events/e1")
    assert r.status_code == 200
    j = r.json()
    assert j["id"] == "e1"
    assert j["title"] == "Sunset Yoga & Chill"


def test_event_not_found(s):
    r = s.get(f"{API}/events/nope")
    assert r.status_code == 404


# Going toggle
def test_event_going_toggle(s):
    # capture initial
    r0 = s.get(f"{API}/events/e2")
    assert r0.status_code == 200
    initial = r0.json()
    initial_going = initial["going"]
    initial_count = initial["member_count"]

    # toggle 1
    r1 = s.post(f"{API}/events/e2/going")
    assert r1.status_code == 200
    j1 = r1.json()
    assert j1["going"] == (not initial_going)
    expected_count = initial_count + (1 if j1["going"] else -1)
    assert j1["member_count"] == max(0, expected_count)

    # toggle back to restore state
    r2 = s.post(f"{API}/events/e2/going")
    assert r2.status_code == 200
    j2 = r2.json()
    assert j2["going"] == initial_going


# Create event
def test_create_event_inserts_at_top(s):
    payload = {
        "title": "TEST_Event_Pytest",
        "location": "Test Location",
        "date": "2026-03-01T18:00:00Z",
        "description": "Created by pytest",
        "category": "Social",
    }
    r = s.post(f"{API}/events", json=payload)
    assert r.status_code == 200
    created = r.json()
    assert created["title"] == payload["title"]
    new_id = created["id"]

    # verify in list
    r2 = s.get(f"{API}/events")
    ids = [e["id"] for e in r2.json()]
    assert new_id in ids
    # inserted at top
    assert ids[0] == new_id


# Spots
def test_spots_returns_eight(s):
    r = s.get(f"{API}/spots")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 8


def test_spots_category_filter(s):
    r = s.get(f"{API}/spots", params={"category": "Bars"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    assert all(sp["category"].lower() == "bars" for sp in data)


# Posts
def test_posts_for_me(s):
    r = s.get(f"{API}/posts", params={"user_id": "me"})
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 6
    assert all(p["user_id"] == "me" for p in data)


# Chats
def test_chats_returns_five(s):
    r = s.get(f"{API}/chats")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 5
    assert data[0]["id"] == "c1"


def test_chat_messages_c1(s):
    r = s.get(f"{API}/chats/c1/messages")
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 5


def test_send_message_updates_preview(s):
    text = "TEST_pytest hello"
    r = s.post(f"{API}/chats/c1/messages", json={"text": text})
    assert r.status_code == 200
    j = r.json()
    assert j["text"] == text
    assert j["sender"] == "me"

    # verify chat preview updated
    rc = s.get(f"{API}/chats")
    chat_c1 = next(c for c in rc.json() if c["id"] == "c1")
    assert chat_c1["last_message"] == text
    assert chat_c1["time"] == "now"

    # verify it persists in messages list
    rm = s.get(f"{API}/chats/c1/messages")
    msgs = rm.json()
    assert any(m["text"] == text and m["sender"] == "me" for m in msgs)
