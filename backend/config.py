"""Configuration for the Driver Intelligence System."""
import os
from dotenv import load_dotenv

load_dotenv()

# ── Camera ──────────────────────────────────────────────
CAMERA_INDEX = int(os.getenv("CAMERA_INDEX", "0"))
FRAME_WIDTH = 640
FRAME_HEIGHT = 480
JPEG_QUALITY = 70

# ── Detection Thresholds ────────────────────────────────
EAR_THRESHOLD = 0.21          # Below this → eyes closed
MAR_THRESHOLD = 0.6           # Above this → yawning
EAR_CONSEC_FRAMES = 15        # Frames of closure → drowsy
YAWN_DURATION_SEC = 2.0       # Minimum yawn duration
EMOTION_INTERVAL_SEC = 2.0    # Seconds between emotion checks

# ── Risk Engine Weights ─────────────────────────────────
WEIGHT_EAR = 0.35
WEIGHT_MAR = 0.20
WEIGHT_EMOTION = 0.15
WEIGHT_TIME = 0.20
WEIGHT_BASELINE = 0.10

# ── Risk Levels ─────────────────────────────────────────
RISK_SAFE = 30
RISK_WARNING = 60
RISK_ALARM = 80

# ── MongoDB ─────────────────────────────────────────────
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB = os.getenv("MONGO_DB", "driver_ai")

# ── Google Gemini AI ────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# ── Server ──────────────────────────────────────────────
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
