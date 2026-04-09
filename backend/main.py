"""
Driver Intelligence & Safety System – FastAPI Backend
Real-time WebSocket streaming + REST APIs
"""
import asyncio
import json
import time
import logging
import base64
import numpy as np
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import config
from vision.camera import Camera
from vision.face_detector import FaceDetector
from vision.ear_mar import calculate_ear, calculate_mar, DrowsinessTracker
from vision.emotion_detector import EmotionDetector
from risk_engine import RiskEngine
from gps import GPSModule
from chatbot import ChatBot
from driver_profile import DriverProfile

# ── Logging ──
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ── Global instances ──
camera = Camera(index=config.CAMERA_INDEX, width=config.FRAME_WIDTH, height=config.FRAME_HEIGHT)
face_detector = FaceDetector()
drowsiness_tracker = DrowsinessTracker(
    ear_threshold=config.EAR_THRESHOLD,
    mar_threshold=config.MAR_THRESHOLD,
    consec_frames=config.EAR_CONSEC_FRAMES,
)
emotion_detector = EmotionDetector(interval_sec=config.EMOTION_INTERVAL_SEC)
risk_engine = RiskEngine()
gps_module = GPSModule()
chatbot = ChatBot()
driver_profile = DriverProfile()

# Track connected WebSocket clients
ws_clients: set = set()


# ── Lifecycle ──
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / Shutdown."""
    logger.info("🚗 Starting Driver Intelligence System...")

    # Open camera (graceful fallback to demo mode)
    camera.open()

    # Try MongoDB — graceful fallback to in-memory
    try:
        await driver_profile.init_mongo(config.MONGO_URI, config.MONGO_DB)
    except Exception as e:
        logger.warning(f"MongoDB init failed: {e}. Using in-memory profiles.")

    # Load driver profile — graceful fallback
    try:
        profile = await driver_profile.get_profile("default")
        risk_engine.set_baseline(profile["baseline_ear"], profile["baseline_mar"])
    except Exception as e:
        logger.warning(f"Profile load failed: {e}. Using default baselines.")
        risk_engine.set_baseline(0.3, 0.2)

    logger.info(f"  Camera: {'DEMO' if camera.is_demo else 'LIVE'}")
    logger.info("  System ready ✅")
    yield

    camera.release()
    face_detector.close()
    logger.info("🛑 System shut down.")


# ── App ──
app = FastAPI(
    title="Driver Intelligence & Safety System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ──
class LocationUpdate(BaseModel):
    lat: float
    lon: float


class ChatMessage(BaseModel):
    message: str
    driver_id: str = "default"


class BrowserFrame(BaseModel):
    frame: str  # base64-encoded JPEG


# ── REST Endpoints ──
@app.get("/")
async def root():
    return {
        "system": "Driver Intelligence & Safety System",
        "status": "running",
        "camera_mode": "demo" if camera.is_demo else "live",
    }


@app.post("/location")
async def update_location(loc: LocationUpdate):
    """Update driver GPS location and get nearby places."""
    gps_module.update_location(loc.lat, loc.lon)
    places = await gps_module.get_nearby_places(loc.lat, loc.lon)
    return {"status": "ok", "nearby_places": places}


@app.get("/nearby-places")
async def get_nearby_places(lat: float, lon: float, radius: int = 5000):
    """Get nearby places for a given location."""
    places = await gps_module.get_nearby_places(lat, lon, radius)
    return {"places": places}


@app.post("/chat")
async def chat_endpoint(msg: ChatMessage):
    """Chatbot endpoint."""
    context = _build_context()
    response = await chatbot.get_response(msg.message, context)
    return {"response": response}


@app.get("/driver-profile/{driver_id}")
async def get_driver_profile(driver_id: str):
    """Get driver profile."""
    profile = await driver_profile.get_profile(driver_id)
    return profile


@app.get("/system-status")
async def system_status():
    """Get full system status."""
    return {
        "camera": "demo" if camera.is_demo else "live",
        "risk_history_length": len(risk_engine.history),
        "gps": {
            "lat": gps_module.current_lat,
            "lon": gps_module.current_lon,
        },
        "websocket_clients": len(ws_clients),
    }


@app.post("/analyze-frame")
async def analyze_browser_frame(data: BrowserFrame):
    """
    Analyze a frame sent from the browser camera.
    Returns face detection, EAR, MAR, emotion, risk analysis.
    """
    try:
        # Decode base64 JPEG to numpy array
        frame = camera.decode_browser_frame(data.frame)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid frame data")

        frame_rgb = frame[:, :, ::-1]  # BGR to RGB

        # Face detection
        ear_val = 0.3
        mar_val = 0.2
        face_detected = False

        landmarks = face_detector.process(frame_rgb)
        if landmarks is not None:
            face_detected = True
            coords = face_detector.get_landmarks_array(landmarks, frame.shape)

            left_eye, right_eye = face_detector.get_eye_landmarks(coords)
            ear_left = calculate_ear(left_eye)
            ear_right = calculate_ear(right_eye)
            ear_val = (ear_left + ear_right) / 2.0

            mouth = face_detector.get_mouth_landmarks(coords)
            mar_val = calculate_mar(mouth)

        # Drowsiness tracking
        drowsy_state = drowsiness_tracker.update(ear_val, mar_val)

        # Emotion
        emotion_result = emotion_detector.analyze(frame)

        # Risk
        risk = risk_engine.compute(
            ear_drop=drowsiness_tracker.ear_drop_score,
            mar_freq=drowsiness_tracker.mar_freq_score,
            emotion_risk=emotion_result.get("risk_weight", 0.1),
            ear_value=ear_val,
            mar_value=mar_val,
        )

        return {
            "face_detected": face_detected,
            "ear": round(ear_val, 4),
            "mar": round(mar_val, 4),
            "drowsiness": drowsy_state,
            "emotion": emotion_result,
            "risk": risk,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Frame analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── WebSocket ──
@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    """
    Real-time WebSocket streaming.
    Sends JSON frames with: image, ear, mar, emotion, risk, drowsiness state.
    """
    await ws.accept()
    ws_clients.add(ws)
    logger.info(f"WebSocket client connected ({len(ws_clients)} total)")

    try:
        while True:
            # Read frame
            success, frame = camera.read()
            if not success:
                await asyncio.sleep(0.1)
                continue

            frame_rgb = frame[:, :, ::-1] if not camera.is_demo else frame

            # ── Face detection ──
            ear_val = 0.3
            mar_val = 0.2
            face_detected = False

            if not camera.is_demo:
                landmarks = face_detector.process(frame_rgb)
                if landmarks is not None:
                    face_detected = True
                    coords = face_detector.get_landmarks_array(landmarks, frame.shape)

                    # EAR
                    left_eye, right_eye = face_detector.get_eye_landmarks(coords)
                    ear_left = calculate_ear(left_eye)
                    ear_right = calculate_ear(right_eye)
                    ear_val = (ear_left + ear_right) / 2.0

                    # MAR
                    mouth = face_detector.get_mouth_landmarks(coords)
                    mar_val = calculate_mar(mouth)
            else:
                face_detected = True
                # Generate demo EAR/MAR with some variation
                t = time.time()
                ear_val = 0.28 + 0.05 * np.sin(t * 0.3) + np.random.normal(0, 0.01)
                mar_val = 0.15 + 0.1 * max(0, np.sin(t * 0.15)) + np.random.normal(0, 0.005)
                ear_val = max(0.05, min(0.4, ear_val))
                mar_val = max(0.05, min(0.9, mar_val))

            # ── Drowsiness tracking ──
            drowsy_state = drowsiness_tracker.update(ear_val, mar_val)

            # ── Emotion ──
            if not camera.is_demo:
                emotion_result = emotion_detector.analyze(frame)
            else:
                # Demo emotion cycling
                demo_emotions = ["neutral", "neutral", "neutral", "happy", "sad", "neutral", "neutral"]
                idx = int(time.time() / 5) % len(demo_emotions)
                emotion_result = {
                    "emotion": demo_emotions[idx],
                    "confidence": 75 + np.random.randint(-5, 6),
                    "risk_weight": 0.1,
                }

            # ── Risk ──
            risk = risk_engine.compute(
                ear_drop=drowsiness_tracker.ear_drop_score,
                mar_freq=drowsiness_tracker.mar_freq_score,
                emotion_risk=emotion_result.get("risk_weight", 0.1),
                ear_value=ear_val,
                mar_value=mar_val,
            )

            # ── Encode frame ──
            frame_b64 = camera.encode_frame(frame, config.JPEG_QUALITY)

            # ── Build payload ──
            payload = {
                "type": "frame",
                "timestamp": time.time(),
                "frame": frame_b64,
                "face_detected": face_detected,
                "ear": round(ear_val, 4),
                "mar": round(mar_val, 4),
                "drowsiness": drowsy_state,
                "emotion": emotion_result,
                "risk": risk,
                "demo_mode": camera.is_demo,
            }

            await ws.send_json(payload)

            # ~15 FPS
            await asyncio.sleep(0.066)

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        ws_clients.discard(ws)
        logger.info(f"WebSocket client disconnected ({len(ws_clients)} total)")


def _build_context() -> dict:
    """Build current system context for chatbot."""
    ctx = {
        "ear": drowsiness_tracker.ear_history[-1] if drowsiness_tracker.ear_history else 0.3,
        "mar": drowsiness_tracker.mar_history[-1] if drowsiness_tracker.mar_history else 0.2,
        "is_drowsy": drowsiness_tracker._is_drowsy,
        "is_yawning": drowsiness_tracker._is_yawning,
        "yawn_count": drowsiness_tracker._yawn_count,
    }

    if risk_engine.history:
        ctx["risk_score"] = risk_engine.history[-1]

    ctx["emotion"] = emotion_detector._last_result.get("emotion", "neutral")

    if gps_module.current_lat:
        ctx["lat"] = gps_module.current_lat
        ctx["lon"] = gps_module.current_lon
        ctx["nearby_places"] = gps_module._cached_places

    return ctx


# ── Run ──
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
        log_level="info",
    )
