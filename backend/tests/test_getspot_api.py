"""GetSpot backend tests — covers Discover tab/event_type filters + regression for chats/spots/me."""
import os
from datetime import datetime, timezone

import pytest
import requests

BASE_URL = os.environ.get("EXPO_PUBLIC_BACKEND_URL", "https://glass-discovery-1.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# -------- Basic health / regression --------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"

    def test_me(self, client):
        r = client.get(f"{API}/me")
        assert r.status_code == 200
        data = r.json()
        assert data["id"] == "me"
        assert data["name"] == "Budiarti R"

    def test_spots(self, client):
        r = client.get(f"{API}/spots")
        assert r.status_code == 200
        assert len(r.json()) >= 5

    def test_chats(self, client):
        r = client.get(f"{API}/chats")
        assert r.status_code == 200
        assert len(r.json()) == 5

    def test_messages(self, client):
        r = client.get(f"{API}/chats/c1/messages")
        assert r.status_code == 200
        assert len(r.json()) >= 1


# -------- Discover tabs --------
class TestEventsTabs:
    def test_overview_excludes_past_and_mine(self, client):
        r = client.get(f"{API}/events", params={"tab": "overview"})
        assert r.status_code == 200
        items = r.json()
        now = datetime.now(timezone.utc)
        ids = {e["id"] for e in items}
        # past events e7 (2025-12-20) and e8 (2025-11-30) must NOT appear
        assert "e7" not in ids, "Overview should exclude past event e7"
        assert "e8" not in ids, "Overview should exclude past event e8"
        # All returned should be future
        for e in items:
            d = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
            assert d >= now, f"Event {e['id']} in overview is in past"

    def test_joined_returns_only_going(self, client):
        r = client.get(f"{API}/events", params={"tab": "joined"})
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        for e in items:
            assert e["going"] is True
        ids = {e["id"] for e in items}
        assert "e8" in ids, "e8 Sunrise Run Club (going=true) should be in joined"

    def test_past_returns_only_past(self, client):
        r = client.get(f"{API}/events", params={"tab": "past"})
        assert r.status_code == 200
        items = r.json()
        now = datetime.now(timezone.utc)
        assert len(items) >= 1
        for e in items:
            d = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
            assert d < now, f"Event {e['id']} marked past but is future"

    def test_mine_returns_only_me_hosted(self, client):
        r = client.get(f"{API}/events", params={"tab": "mine"})
        assert r.status_code == 200
        items = r.json()
        ids = {e["id"] for e in items}
        assert "e6" in ids
        assert "e7" in ids
        for e in items:
            assert e["host_id"] == "me"


# -------- Event type filter --------
class TestEventTypeFilter:
    def test_cultural_filter(self, client):
        r = client.get(f"{API}/events", params={"event_type": "cultural"})
        assert r.status_code == 200
        items = r.json()
        ids = {e["id"] for e in items}
        assert ids == {"e3", "e7"}, f"Expected cultural events e3,e7 got {ids}"

    def test_activity_filter(self, client):
        r = client.get(f"{API}/events", params={"event_type": "activity"})
        assert r.status_code == 200
        for e in r.json():
            assert e["event_type"] == "activity"

    def test_all_returns_everything(self, client):
        r = client.get(f"{API}/events", params={"event_type": "all"})
        assert r.status_code == 200
        assert len(r.json()) >= 8

    def test_combined_overview_activity(self, client):
        r = client.get(f"{API}/events", params={"tab": "overview", "event_type": "activity"})
        assert r.status_code == 200
        items = r.json()
        now = datetime.now(timezone.utc)
        for e in items:
            assert e["event_type"] == "activity"
            d = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
            assert d >= now
        ids = {e["id"] for e in items}
        # e8 is activity but past -> excluded; e4 is activity & future -> included
        assert "e8" not in ids
        assert "e4" in ids


# -------- Event detail + going toggle --------
class TestEventDetail:
    def test_get_event(self, client):
        r = client.get(f"{API}/events/e1")
        assert r.status_code == 200
        assert r.json()["title"] == "Sunset Yoga & Chill"

    def test_event_not_found(self, client):
        r = client.get(f"{API}/events/nope")
        assert r.status_code == 404
