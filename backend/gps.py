"""
GPS Module – Location processing & nearby places via Overpass API (OpenStreetMap).
"""
import httpx
import logging
import math

logger = logging.getLogger(__name__)

# Place categories to search
PLACE_CATEGORIES = {
    "rest_stop": {
        "tags": '["highway"="rest_area"]',
        "icon": "🅿️",
        "label": "Rest Stop",
    },
    "fuel_station": {
        "tags": '["amenity"="fuel"]',
        "icon": "⛽",
        "label": "Fuel Station",
    },
    "hospital": {
        "tags": '["amenity"="hospital"]',
        "icon": "🏥",
        "label": "Hospital",
    },
    "hotel": {
        "tags": '["tourism"="hotel"]',
        "icon": "🏨",
        "label": "Hotel",
    },
    "restaurant": {
        "tags": '["amenity"="restaurant"]',
        "icon": "🍽️",
        "label": "Restaurant",
    },
}

OVERPASS_URL = "https://overpass-api.de/api/interpreter"


class GPSModule:
    """Handles GPS location and nearby place lookups."""

    def __init__(self):
        self.current_lat = None
        self.current_lon = None
        self._cached_places = []
        self._cache_location = (None, None)

    def update_location(self, lat: float, lon: float):
        """Update current GPS coordinates."""
        self.current_lat = lat
        self.current_lon = lon

    async def get_nearby_places(self, lat: float, lon: float,
                                 radius_m: int = 5000) -> list:
        """
        Find nearby places using Overpass API.
        Returns list of place dicts.
        """
        # Check cache (within ~500m of last query)
        if (self._cache_location[0] is not None and
                self._distance_km(lat, lon, *self._cache_location) < 0.5 and
                self._cached_places):
            return self._cached_places

        places = []
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                for cat_id, cat in PLACE_CATEGORIES.items():
                    query = f"""
                    [out:json][timeout:5];
                    (
                      node{cat['tags']}(around:{radius_m},{lat},{lon});
                      way{cat['tags']}(around:{radius_m},{lat},{lon});
                    );
                    out center 5;
                    """
                    try:
                        resp = await client.post(OVERPASS_URL, data={"data": query})
                        if resp.status_code == 200:
                            data = resp.json()
                            for el in data.get("elements", [])[:5]:
                                p_lat = el.get("lat") or el.get("center", {}).get("lat")
                                p_lon = el.get("lon") or el.get("center", {}).get("lon")
                                if p_lat and p_lon:
                                    name = el.get("tags", {}).get("name", cat["label"])
                                    dist = self._distance_km(lat, lon, p_lat, p_lon)
                                    places.append({
                                        "name": name,
                                        "category": cat_id,
                                        "icon": cat["icon"],
                                        "label": cat["label"],
                                        "lat": p_lat,
                                        "lon": p_lon,
                                        "distance_km": round(dist, 2),
                                        "maps_url": f"https://maps.google.com/?q={p_lat},{p_lon}",
                                    })
                    except Exception as e:
                        logger.debug(f"Overpass query error for {cat_id}: {e}")

            places.sort(key=lambda x: x["distance_km"])
            self._cached_places = places[:15]
            self._cache_location = (lat, lon)

        except Exception as e:
            logger.error(f"GPS nearby places error: {e}")

        return self._cached_places

    @staticmethod
    def _distance_km(lat1, lon1, lat2, lon2) -> float:
        """Haversine distance in km."""
        R = 6371
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2) ** 2 +
             math.cos(math.radians(lat1)) *
             math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2) ** 2)
        return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    @staticmethod
    def emergency_message(lat: float, lon: float, driver_name: str = "Driver") -> str:
        """Generate an emergency alert message with location."""
        return (
            f"🚨 EMERGENCY ALERT 🚨\n"
            f"{driver_name} may be in danger!\n"
            f"📍 Location: https://maps.google.com/?q={lat},{lon}\n"
            f"Please check on them immediately."
        )
