"""
Camera Manager – OpenCV VideoCapture with JPEG base64 streaming.
Falls back to synthetic demo data when no camera is available.
"""
import cv2
import base64
import numpy as np
import logging
import time
import math
import sys

logger = logging.getLogger(__name__)


class Camera:
    """Manages webcam capture and frame encoding."""

    def __init__(self, index: int = 0, width: int = 640, height: int = 480):
        self.index = index
        self.width = width
        self.height = height
        self.cap = None
        self._demo_mode = False
        self._frame_count = 0

    def open(self) -> bool:
        """Open the camera. Tries multiple backends on Windows. Returns True if successful."""
        backends = []
        if sys.platform == 'win32':
            backends = [
                (cv2.CAP_DSHOW, "DirectShow"),
                (cv2.CAP_MSMF, "Media Foundation"),
                (cv2.CAP_ANY, "Auto"),
            ]
        else:
            backends = [
                (cv2.CAP_V4L2, "V4L2"),
                (cv2.CAP_ANY, "Auto"),
            ]

        for backend, name in backends:
            try:
                logger.info(f"Trying camera {self.index} with {name} backend...")
                self.cap = cv2.VideoCapture(self.index, backend)
                if self.cap.isOpened():
                    self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
                    self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)
                    # Test read a frame
                    ret, _ = self.cap.read()
                    if ret:
                        logger.info(f"✅ Camera {self.index} opened with {name} ({self.width}x{self.height})")
                        self._demo_mode = False
                        return True
                    else:
                        self.cap.release()
                        logger.warning(f"Camera opened with {name} but couldn't read frame")
                else:
                    logger.warning(f"Camera {name} backend failed to open")
            except Exception as e:
                logger.warning(f"Camera {name} error: {e}")

        logger.warning("⚠️ No camera available. Switching to DEMO mode.")
        self._demo_mode = True
        return False

    @property
    def is_demo(self) -> bool:
        return self._demo_mode

    def read(self):
        """Read a frame. Returns (success, frame_bgr)."""
        if self._demo_mode:
            return True, self._generate_demo_frame()

        if self.cap is None or not self.cap.isOpened():
            return False, None

        ret, frame = self.cap.read()
        if not ret:
            return False, None
        return True, frame

    def _generate_demo_frame(self) -> np.ndarray:
        """Generate a synthetic demo frame with animated elements."""
        self._frame_count += 1
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)

        # Dark gradient background
        for y in range(self.height):
            shade = int(20 + 15 * (y / self.height))
            frame[y, :] = (shade, shade + 5, shade + 10)

        # Simulated face oval
        cx, cy = self.width // 2, self.height // 2
        cv2.ellipse(frame, (cx, cy), (100, 130), 0, 0, 360, (60, 80, 100), 2)

        # Animated "eyes"
        t = self._frame_count * 0.05
        blink = abs(math.sin(t * 2))
        eye_h = max(2, int(12 * blink))
        cv2.ellipse(frame, (cx - 40, cy - 20), (18, eye_h), 0, 0, 360, (0, 200, 120), -1)
        cv2.ellipse(frame, (cx + 40, cy - 20), (18, eye_h), 0, 0, 360, (0, 200, 120), -1)

        # Animated "mouth"
        mouth_open = abs(math.sin(t * 0.5)) * 15
        cv2.ellipse(frame, (cx, cy + 50), (30, int(8 + mouth_open)), 0, 0, 360, (0, 150, 200), 2)

        # Label
        cv2.putText(frame, "DEMO MODE", (self.width // 2 - 80, 30),
                     cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        cv2.putText(frame, "No camera detected", (self.width // 2 - 100, 60),
                     cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 100, 100), 1)

        return frame

    @staticmethod
    def encode_frame(frame: np.ndarray, quality: int = 70) -> str:
        """Encode frame to base64 JPEG string."""
        encode_params = [cv2.IMWRITE_JPEG_QUALITY, quality]
        _, buffer = cv2.imencode('.jpg', frame, encode_params)
        return base64.b64encode(buffer).decode('utf-8')

    @staticmethod
    def decode_browser_frame(frame_b64: str) -> np.ndarray:
        """Decode a base64 JPEG frame from the browser into a numpy array."""
        try:
            # Remove data URL prefix if present
            if ',' in frame_b64:
                frame_b64 = frame_b64.split(',', 1)[1]
            img_bytes = base64.b64decode(frame_b64)
            nparr = np.frombuffer(img_bytes, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return frame
        except Exception as e:
            logger.error(f"Failed to decode browser frame: {e}")
            return None

    def release(self):
        """Release the camera."""
        if self.cap is not None:
            self.cap.release()
            logger.info("Camera released")
