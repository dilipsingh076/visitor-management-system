"""
RBAC tests: verify role enforcement and ownership.
- Resident cannot check-out a visitor (guard only).
- Guard cannot approve an invite (resident only).
- Wrong resident cannot approve someone else's walk-in.
- Admin can perform guard and resident actions.
Run: pytest tests/test_rbac.py -v (from backend dir, with AUTH_DEMO_MODE=true).
"""
import pytest
from uuid import uuid4

from app.main import app
from app.core import dependencies
from app.db.seed import DEMO_USER_ID, RESIDENT_2_ID, RESIDENT_3_ID, DEMO_GUARD_ID


def make_user(user_id, roles: list):
    return {
        "sub": str(user_id),
        "user_id": str(user_id),
        "email": "test@vms.local",
        "preferred_username": "test",
        "realm_access": {"roles": roles},
    }


def override_user(user_dict):
    async def _():
        return user_dict
    app.dependency_overrides[dependencies.get_current_user] = _


@pytest.fixture
def client():
    from fastapi.testclient import TestClient
    return TestClient(app)


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


class TestResidentForbiddenGuardActions:
    """Resident cannot perform guard-only actions."""

    def test_resident_cannot_checkout(self, client):
        override_user(make_user(RESIDENT_2_ID, ["resident"]))
        r = client.post(
            "/api/v1/checkin/checkout",
            json={"visit_id": str(uuid4())},
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 403
        assert "guard" in r.json().get("detail", "").lower() or "authorized" in r.json().get("detail", "").lower()

    def test_resident_cannot_walkin(self, client):
        override_user(make_user(RESIDENT_2_ID, ["resident"]))
        r = client.post(
            "/api/v1/visitors/walkin",
            json={
                "visitor_name": "Stranger",
                "visitor_phone": "9999999999",
                "purpose": "Test",
                "host_id": str(RESIDENT_3_ID),
            },
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 403

    def test_resident_cannot_access_muster(self, client):
        override_user(make_user(RESIDENT_2_ID, ["resident"]))
        r = client.get("/api/v1/dashboard/muster", headers={"Authorization": "Bearer any"})
        assert r.status_code == 403

    def test_resident_cannot_list_residents(self, client):
        override_user(make_user(RESIDENT_2_ID, ["resident"]))
        r = client.get("/api/v1/residents/", headers={"Authorization": "Bearer any"})
        assert r.status_code == 403


class TestGuardForbiddenResidentActions:
    """Guard cannot perform resident-only actions (when ownership would apply)."""

    def test_guard_cannot_invite(self, client):
        override_user(make_user(DEMO_GUARD_ID, ["guard"]))
        r = client.post(
            "/api/v1/visitors/invite",
            json={
                "visitor_name": "Invitee",
                "visitor_phone": "8888888888",
                "purpose": "Meeting",
            },
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 403


class TestOwnership:
    """Wrong resident cannot approve another resident's walk-in."""

    def test_other_resident_cannot_approve_my_visit(self, client):
        override_user(make_user(DEMO_GUARD_ID, ["guard"]))
        w = client.post(
            "/api/v1/visitors/walkin",
            json={
                "visitor_name": "Walkin For Resident2",
                "visitor_phone": "5555555555",
                "purpose": "Test",
                "host_id": str(RESIDENT_2_ID),
            },
            headers={"Authorization": "Bearer any"},
        )
        if w.status_code != 200:
            pytest.skip("Could not create walk-in")
        visit_id = w.json().get("id")
        override_user(make_user(RESIDENT_3_ID, ["resident"]))
        r = client.patch(
            f"/api/v1/visitors/{visit_id}/approve",
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 403
        assert "authorized" in r.json().get("detail", "").lower() or "host" in r.json().get("detail", "").lower()


class TestAdminAllowed:
    """Admin can perform both resident and guard actions."""

    def test_admin_can_access_muster(self, client):
        override_user(make_user(DEMO_USER_ID, ["admin"]))
        r = client.get("/api/v1/dashboard/muster", headers={"Authorization": "Bearer any"})
        assert r.status_code == 200

    def test_admin_can_list_residents(self, client):
        override_user(make_user(DEMO_USER_ID, ["admin"]))
        r = client.get("/api/v1/residents/", headers={"Authorization": "Bearer any"})
        assert r.status_code == 200

    def test_admin_can_invite(self, client):
        override_user(make_user(DEMO_USER_ID, ["admin"]))
        r = client.post(
            "/api/v1/visitors/invite",
            json={
                "visitor_name": "Admin Invitee",
                "visitor_phone": "7777777777",
                "purpose": "Admin meeting",
            },
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 200

    def test_admin_can_walkin(self, client):
        override_user(make_user(DEMO_USER_ID, ["admin"]))
        r = client.post(
            "/api/v1/visitors/walkin",
            json={
                "visitor_name": "Admin Walk-in",
                "visitor_phone": "6666666666",
                "purpose": "Admin",
                "host_id": str(RESIDENT_2_ID),
            },
            headers={"Authorization": "Bearer any"},
        )
        assert r.status_code == 200
