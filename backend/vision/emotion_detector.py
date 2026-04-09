"""
Emotion Detector – DeepFace emotion classification.
Throttled to avoid CPU overload.
"""
import time
import logging
import numpy as np

logger = logging.getLogger(__name__)

# Emotion → risk weight mapping (0 = safe, 1 = dangerous)
EMOTION_RISK_MAP = {
    "angry": 0.8,
    "disgust": 0.5,
    "fear": 0.9,
    "happy": 0.05,
    "sad": 0.4,
    "surprise": 0.3,
    "neutral": 0.1,
}


class EmotionDetector:
    """Wraps DeepFace for throttled emotion detection."""

    def __init__(self, interval_sec: float = 2.0):
        self.interval = interval_sec
        self._last_analysis_time = 0
        self._last_result = {"emotion": "neutral", "confidence": 0.0, "risk_weight": 0.1}
        self._deepface = None
        self._available = True

    def _lazy_load(self):
        """Lazy-load DeepFace to avoid slow startup."""
        if self._deepface is None:
            try:
                from deepface import DeepFace
                self._deepface = DeepFace
                logger.info("DeepFace loaded successfully")
            except Exception as e:
                logger.warning(f"DeepFace not available: {e}. Using fallback.")
                self._available = False

    def analyze(self, frame_bgr: np.ndarray) -> dict:
        """
        Analyze emotion from a BGR frame.
        Returns cached result if called within interval.
        """
        now = time.time()
        if now - self._last_analysis_time < self.interval:
            return self._last_result

        self._lazy_load()
        if not self._available:
            return self._last_result

        self._last_analysis_time = now

        try:
            results = self._deepface.analyze(
                frame_bgr,
                actions=["emotion"],
                enforce_detection=False,
                silent=True,
            )
            if isinstance(results, list):
                results = results[0]

            emotions = results.get("emotion", {})
            dominant = results.get("dominant_emotion", "neutral")
            confidence = emotions.get(dominant, 0.0)

            self._last_result = {
                "emotion": dominant,
                "confidence": round(confidence, 2),
                "risk_weight": EMOTION_RISK_MAP.get(dominant, 0.1),
                "all_emotions": {k: round(v, 2) for k, v in emotions.items()},
            }
        except Exception as e:
            logger.debug(f"Emotion analysis error: {e}")

        return self._last_result
