"""
Driver Profile System – Stores per-driver baselines and session history.
In-memory fallback when MongoDB is unavailable.
"""
import logging
import time
from typing import Optional

logger = logging.getLogger(__name__)


class DriverProfile:
    """Manages driver profiles with baseline EAR/MAR values."""

    def __init__(self):
        self._profiles = {}  # In-memory store
        self._current_id = "default"
        self._mongo_available = False
        self._db = None

    async def init_mongo(self, mongo_uri: str, db_name: str):
        """Try to connect to MongoDB."""
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            client = AsyncIOMotorClient(mongo_uri, serverSelectionTimeoutMS=3000)
            await client.server_info()
            self._db = client[db_name]
            self._mongo_available = True
            logger.info("MongoDB connected for driver profiles")
        except Exception as e:
            logger.warning(f"MongoDB unavailable: {e}. Using in-memory profiles.")
            self._mongo_available = False

    async def get_profile(self, driver_id: str = "default") -> dict:
        """Get or create a driver profile."""
        if self._mongo_available:
            try:
                profile = await self._db.profiles.find_one({"driver_id": driver_id})
                if profile:
                    profile.pop("_id", None)
                    return profile
            except Exception:
                pass

        if driver_id not in self._profiles:
            self._profiles[driver_id] = self._default_profile(driver_id)

        return self._profiles[driver_id]

    async def update_profile(self, driver_id: str, updates: dict):
        """Update a driver profile."""
        if self._mongo_available:
            try:
                await self._db.profiles.update_one(
                    {"driver_id": driver_id},
                    {"$set": updates},
                    upsert=True,
                )
            except Exception as e:
                logger.debug(f"MongoDB update error: {e}")

        if driver_id not in self._profiles:
            self._profiles[driver_id] = self._default_profile(driver_id)
        self._profiles[driver_id].update(updates)

    async def record_session(self, driver_id: str, session_data: dict):
        """Record a driving session summary."""
        session_data["timestamp"] = time.time()

        if self._mongo_available:
            try:
                await self._db.sessions.insert_one({
                    "driver_id": driver_id, **session_data
                })
            except Exception:
                pass

        profile = await self.get_profile(driver_id)
        if "sessions" not in profile:
            profile["sessions"] = []
        profile["sessions"].append(session_data)
        # Keep last 50 sessions
        profile["sessions"] = profile["sessions"][-50:]

    async def calibrate_baseline(self, driver_id: str, ear_values: list, mar_values: list):
        """Set baseline from calibration data."""
        import numpy as np
        baseline_ear = float(np.mean(ear_values)) if ear_values else 0.3
        baseline_mar = float(np.mean(mar_values)) if mar_values else 0.2

        await self.update_profile(driver_id, {
            "baseline_ear": round(baseline_ear, 4),
            "baseline_mar": round(baseline_mar, 4),
            "calibrated": True,
        })
        return baseline_ear, baseline_mar

    @staticmethod
    def _default_profile(driver_id: str) -> dict:
        return {
            "driver_id": driver_id,
            "name": f"Driver {driver_id}",
            "baseline_ear": 0.3,
            "baseline_mar": 0.2,
            "calibrated": False,
            "sessions": [],
            "created_at": time.time(),
        }
