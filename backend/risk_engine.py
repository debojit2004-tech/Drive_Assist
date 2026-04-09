"""
Adaptive Risk Engine – Weighted scoring from all driver state inputs.
"""
import time
import math
from collections import deque
from config import (
    WEIGHT_EAR, WEIGHT_MAR, WEIGHT_EMOTION,
    WEIGHT_TIME, WEIGHT_BASELINE,
    RISK_SAFE, RISK_WARNING, RISK_ALARM,
)


class RiskEngine:
    """Computes a 0–100 risk score from driver state inputs."""

    def __init__(self):
        self._session_start = time.time()
        self._risk_history = deque(maxlen=600)
        self._baseline_ear = 0.3      # default; updated per driver
        self._baseline_mar = 0.2

    def set_baseline(self, ear: float, mar: float):
        """Set the driver's personal baseline values."""
        self._baseline_ear = ear
        self._baseline_mar = mar

    def compute(self, ear_drop: float, mar_freq: float,
                emotion_risk: float, ear_value: float = 0.3,
                mar_value: float = 0.2) -> dict:
        """
        Compute risk score.

        Args:
            ear_drop: 0-1, how much EAR has dropped from baseline
            mar_freq: 0-1, yawning frequency score
            emotion_risk: 0-1, emotion risk weight
            ear_value: current EAR value (for baseline deviation)
            mar_value: current MAR value

        Returns:
            dict with score, level, action, trend
        """
        # ── Time factor: risk increases with session duration ──
        elapsed_hours = (time.time() - self._session_start) / 3600
        time_factor = min(1.0, elapsed_hours / 4.0)  # Max at 4 hours

        # ── Baseline deviation ──
        ear_dev = max(0, (self._baseline_ear - ear_value) / self._baseline_ear) \
            if self._baseline_ear > 0 else 0
        mar_dev = max(0, (mar_value - self._baseline_mar) / max(self._baseline_mar, 0.01))
        baseline_dev = min(1.0, (ear_dev + mar_dev) / 2)

        # ── Weighted sum ──
        raw = (
            WEIGHT_EAR * ear_drop +
            WEIGHT_MAR * mar_freq +
            WEIGHT_EMOTION * emotion_risk +
            WEIGHT_TIME * time_factor +
            WEIGHT_BASELINE * baseline_dev
        )

        # Normalize to 0–100
        score = round(min(100, max(0, raw * 100)), 1)

        # Determine level and action
        if score < RISK_SAFE:
            level = "safe"
            action = "All clear – drive safely."
        elif score < RISK_WARNING:
            level = "warning"
            action = "Consider taking a short break."
        elif score < RISK_ALARM:
            level = "alarm"
            action = "Pull over soon. You show signs of fatigue!"
        else:
            level = "emergency"
            action = "STOP IMMEDIATELY! Find a safe place to pull over NOW!"

        self._risk_history.append(score)

        # Trend (rising / falling / stable)
        trend = self._compute_trend()

        return {
            "score": score,
            "level": level,
            "action": action,
            "trend": trend,
            "components": {
                "ear_drop": round(ear_drop, 3),
                "mar_freq": round(mar_freq, 3),
                "emotion": round(emotion_risk, 3),
                "time_factor": round(time_factor, 3),
                "baseline_dev": round(baseline_dev, 3),
            },
            "session_minutes": round(elapsed_hours * 60, 1),
        }

    def _compute_trend(self) -> str:
        """Analyze recent risk trend."""
        if len(self._risk_history) < 20:
            return "stable"
        recent = list(self._risk_history)[-10:]
        older = list(self._risk_history)[-20:-10]
        avg_recent = sum(recent) / len(recent)
        avg_older = sum(older) / len(older)
        diff = avg_recent - avg_older
        if diff > 3:
            return "rising"
        elif diff < -3:
            return "falling"
        return "stable"

    @property
    def history(self):
        return list(self._risk_history)

    def reset_session(self):
        """Reset session timer."""
        self._session_start = time.time()
        self._risk_history.clear()
