"""
Face Detector – MediaPipe Face Mesh integration.
Extracts 468 facial landmarks per frame.
"""
import mediapipe as mp
import numpy as np

# Landmark indices for EAR
# Left eye:  [362, 385, 387, 263, 373, 380]
# Right eye: [33,  160, 158, 133, 153, 144]
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

# Mouth landmarks for MAR
# Upper: [13, 311, 308, 402, 14, 178, 78, 81]
MOUTH_OUTER = [61, 291, 0, 17]          # p1(left), p5(right), p3(top-center), p7(bottom-center)
MOUTH_INNER_TOP = [13]                   # inner upper lip
MOUTH_INNER_BOTTOM = [14]               # inner lower lip
MOUTH_LEFT = [78]
MOUTH_RIGHT = [308]
MOUTH_TOP_INNER = [82, 312]
MOUTH_BOTTOM_INNER = [87, 317]


class FaceDetector:
    """Wraps MediaPipe Face Mesh for real-time facial landmark extraction."""

    def __init__(self, max_faces: int = 1, min_detection_conf: float = 0.5,
                 min_tracking_conf: float = 0.5):
        self.mp_face_mesh = mp.solutions.face_mesh
        self.face_mesh = self.mp_face_mesh.FaceMesh(
            max_num_faces=max_faces,
            refine_landmarks=True,
            min_detection_confidence=min_detection_conf,
            min_tracking_confidence=min_tracking_conf,
        )

    def process(self, frame_rgb: np.ndarray):
        """
        Process an RGB frame and return landmark results.
        Returns None if no face detected.
        """
        results = self.face_mesh.process(frame_rgb)
        if not results.multi_face_landmarks:
            return None
        return results.multi_face_landmarks[0]

    @staticmethod
    def get_landmarks_array(face_landmarks, frame_shape):
        """Convert landmarks to numpy array of (x, y) pixel coords."""
        h, w = frame_shape[:2]
        coords = np.array([
            (lm.x * w, lm.y * h)
            for lm in face_landmarks.landmark
        ])
        return coords

    @staticmethod
    def get_eye_landmarks(coords):
        """Return left-eye and right-eye landmark arrays."""
        left = coords[LEFT_EYE]
        right = coords[RIGHT_EYE]
        return left, right

    @staticmethod
    def get_mouth_landmarks(coords):
        """Return mouth landmark coords for MAR."""
        left = coords[MOUTH_LEFT[0]]
        right = coords[MOUTH_RIGHT[0]]
        top_inner = coords[MOUTH_TOP_INNER]
        bottom_inner = coords[MOUTH_BOTTOM_INNER]
        inner_top = coords[MOUTH_INNER_TOP[0]]
        inner_bottom = coords[MOUTH_INNER_BOTTOM[0]]
        return {
            "left": left,
            "right": right,
            "top_inner": top_inner,
            "bottom_inner": bottom_inner,
            "inner_top": inner_top,
            "inner_bottom": inner_bottom,
        }

    def close(self):
        self.face_mesh.close()
