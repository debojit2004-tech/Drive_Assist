"""
EAR & MAR Engine – Eye Aspect Ratio & Mouth Aspect Ratio computation.
"""
import numpy as np
from collections import deque
import time


def _dist(p1, p2):
    """Euclidean distance between two 2-D points."""
    return np.linalg.norm(np.array(p1) - np.array(p2))


def calculate_ear(eye_landmarks):
    """
    Eye Aspect Ratio.

    EAR = (|p2-p6| + |p3-p5|) / (2 * |p1-p4|)

    eye_landmarks: array of 6 points [p1..p6]
    """
    p1, p2, p3, p4, p5, p6 = eye_landmarks
    vertical_1 = _dist(p2, p6)
    vertical_2 = _dist(p3, p5)
    horizontal = _dist(p1, p4)
    if horizontal == 0:
        return 0.0
    ear = (vertical_1 + vertical_2) / (2.0 * horizontal)
    return round(ear, 4)


def calculate_mar(mouth_landmarks: dict):
    """
    Mouth Aspect Ratio.

    MAR = (|top_inner_avg - bottom_inner_avg| + |inner_top - inner_bottom|) / (2 * |left - right|)
    """
    left = mouth_landmarks["left"]
    right = mouth_landmarks["right"]
    inner_top = mouth_landmarks["inner_top"]
    inner_bottom = mouth_landmarks["inner_bottom"]
    top_inner = mouth_landmarks["top_inner"]       # array of 2 points
    bottom_inner = mouth_landmarks["bottom_inner"]  # array of 2 points

    # Vertical distances
    v1 = _dist(top_inner[0], bottom_inner[0])
    v2 = _dist(top_inner[1], bottom_inner[1])
    v3 = _dist(inner_top, inner_bottom)

    # Horizontal
    horizontal = _dist(left, right)
    if horizontal == 0:
        return 0.0

    mar = (v1 + v2 + v3) / (3.0 * horizontal)
    return round(mar, 4)


class DrowsinessTracker:
    """Track drowsiness state across frames."""

    def __init__(self, ear_threshold=0.21, mar_threshold=0.6,
                 consec_frames=15, yawn_cooldown=5.0):
        self.ear_threshold = ear_threshold
        self.mar_threshold = mar_threshold
        self.consec_frames = consec_frames
        self.yawn_cooldown = yawn_cooldown

        self._closed_frames = 0
        self._is_drowsy = False
        self._yawn_count = 0
        self._last_yawn_time = 0
        self._is_yawning = False

        # Rolling history
        self.ear_history = deque(maxlen=300)
        self.mar_history = deque(maxlen=300)

    def update(self, ear: float, mar: float):
        """Update tracker with new EAR/MAR values."""
        now = time.time()

        self.ear_history.append(ear)
        self.mar_history.append(mar)

        # ── Eye closure ──
        if ear < self.ear_threshold:
            self._closed_frames += 1
        else:
            self._closed_frames = 0

        self._is_drowsy = self._closed_frames >= self.consec_frames

        # ── Yawning ──
        if mar > self.mar_threshold:
            if not self._is_yawning:
                self._is_yawning = True
                if now - self._last_yawn_time > self.yawn_cooldown:
                    self._yawn_count += 1
                    self._last_yawn_time = now
        else:
            self._is_yawning = False

        return {
            "is_drowsy": self._is_drowsy,
            "is_yawning": self._is_yawning,
            "closed_frames": self._closed_frames,
            "yawn_count": self._yawn_count,
            "ear": ear,
            "mar": mar,
        }

    @property
    def ear_drop_score(self) -> float:
        """0-1 score based on how much EAR has dropped recently."""
        if len(self.ear_history) < 10:
            return 0.0
        recent = list(self.ear_history)[-30:]
        baseline = list(self.ear_history)[:30] if len(self.ear_history) > 60 else recent
        avg_recent = np.mean(recent)
        avg_baseline = np.mean(baseline)
        if avg_baseline == 0:
            return 0.0
        drop = max(0, (avg_baseline - avg_recent) / avg_baseline)
        return min(1.0, drop * 3)  # Amplify small drops

    @property
    def mar_freq_score(self) -> float:
        """0-1 score based on yawning frequency."""
        if self._yawn_count == 0:
            return 0.0
        return min(1.0, self._yawn_count / 5.0)
