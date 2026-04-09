"""
Chatbot Assistant – AI-driven driver safety advisor.
Uses Google Gemini API with context injection, or fallback responses.
"""
import logging
from config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are DriveGuard AI — an intelligent, empathetic driver safety assistant.

You have real-time access to the driver's state through sensors:
- EAR (Eye Aspect Ratio): measures eye openness. Below 0.21 = eyes closing
- MAR (Mouth Aspect Ratio): measures mouth opening. Above 0.6 = yawning
- Detected emotion (angry, fear, happy, sad, neutral, surprise, disgust)
- Risk score (0-100): computed from 5 weighted factors
- GPS location and nearby places

Your personality:
- Friendly, concise, and actionable
- Use relevant emojis naturally (not excessively)
- Be empathetic but firm about safety
- Keep responses under 150 words

Risk response guidelines:
- Risk <30 → Reassure, praise safe driving
- 30–60 → Suggest break, coffee, stretching
- 60–80 → Warn strongly, recommend pulling over
- >80 → Emergency stop, direct to nearest safe location

Always prioritize driver safety above everything else."""

# Fallback responses when Gemini is unavailable
FALLBACK_RESPONSES = {
    "safe": [
        "✅ You're doing great! Your driving vitals look healthy. Keep it up!",
        "👍 All systems green. You're alert and focused. Safe travels!",
    ],
    "warning": [
        "⚠️ I'm noticing some early signs of fatigue. How about a quick coffee break?",
        "💡 Your alertness is dipping slightly. Consider stopping at the next rest area for a 15-minute power nap.",
    ],
    "alarm": [
        "🚨 Your fatigue levels are concerning. Please find a safe place to pull over soon!",
        "⚠️ IMPORTANT: You're showing significant signs of drowsiness. Pull over at the next safe opportunity.",
    ],
    "emergency": [
        "🆘 CRITICAL: Your readings indicate severe fatigue! Pull over IMMEDIATELY at the nearest safe location!",
        "🚨 EMERGENCY: Stop driving NOW! Your safety is at risk. Find the nearest rest stop or safe shoulder.",
    ],
}


class ChatBot:
    """AI-driven chatbot for driver safety assistance using Google Gemini."""

    def __init__(self):
        self._model = None
        self._available = False
        self._conversation_history = []
        self._init_gemini()

    def _init_gemini(self):
        """Initialize Google Gemini client if API key is available."""
        if GEMINI_API_KEY:
            try:
                from google import genai
                self._client = genai.Client(api_key=GEMINI_API_KEY)
                self._available = True
                logger.info("✅ Google Gemini AI chatbot initialized")
            except Exception as e:
                logger.warning(f"Gemini not available: {e}. Using fallback mode.")
        else:
            logger.info("No Gemini API key. Chatbot running in fallback mode.")

    async def get_response(self, message: str, context: dict = None) -> str:
        """Get chatbot response."""
        if self._available:
            return await self._gemini_response(message, context)
        return self._fallback_response(message, context)

    async def _gemini_response(self, message: str, context: dict) -> str:
        """Get response from Google Gemini API."""
        try:
            context_msg = self._format_context(context) if context else ""

            # Build the full prompt
            full_prompt = SYSTEM_PROMPT + "\n\n"
            if context_msg:
                full_prompt += f"Current driver state:\n{context_msg}\n\n"

            # Add conversation history (last 6 exchanges)
            for msg in self._conversation_history[-6:]:
                role = "Driver" if msg["role"] == "user" else "Assistant"
                full_prompt += f"{role}: {msg['content']}\n"

            full_prompt += f"Driver: {message}\nAssistant:"

            response = self._client.models.generate_content(
                model=GEMINI_MODEL,
                contents=full_prompt,
            )

            reply = response.text.strip()

            # Update history
            self._conversation_history.append({"role": "user", "content": message})
            self._conversation_history.append({"role": "assistant", "content": reply})

            return reply

        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return self._fallback_response(message, context)

    def _fallback_response(self, message: str, context: dict) -> str:
        """Generate response without Gemini."""
        import random

        level = "safe"
        if context:
            score = context.get("risk_score", 0)
            if score >= 80:
                level = "emergency"
            elif score >= 60:
                level = "alarm"
            elif score >= 30:
                level = "warning"

        responses = FALLBACK_RESPONSES.get(level, FALLBACK_RESPONSES["safe"])
        base = random.choice(responses)

        # Add context-aware additions
        if context:
            emotion = context.get("emotion", "neutral")
            if emotion in ["angry", "fear"]:
                base += f"\n\n😤 I notice you seem {emotion}. Take a deep breath — managing emotions while driving is crucial for safety."
            elif emotion == "sad":
                base += "\n\n💙 I can sense you might not be feeling great. Your safety comes first — consider pulling over if you need a moment."

            nearby = context.get("nearby_places", [])
            if nearby and level in ["alarm", "emergency"]:
                closest = nearby[0]
                base += f"\n\n📍 Nearest stop: {closest['name']} ({closest['distance_km']}km) — {closest['maps_url']}"

        return base

    @staticmethod
    def _format_context(context: dict) -> str:
        """Format driver context for the AI prompt."""
        lines = []
        if "risk_score" in context:
            lines.append(f"Risk Score: {context['risk_score']}/100")
        if "ear" in context:
            lines.append(f"EAR: {context['ear']} (Eye Aspect Ratio, below 0.21 = eyes closing)")
        if "mar" in context:
            lines.append(f"MAR: {context['mar']} (Mouth Aspect Ratio, above 0.6 = yawning)")
        if "emotion" in context:
            lines.append(f"Emotion: {context['emotion']}")
        if "is_drowsy" in context:
            lines.append(f"Drowsy: {'Yes ⚠️' if context['is_drowsy'] else 'No'}")
        if "is_yawning" in context:
            lines.append(f"Yawning: {'Yes' if context['is_yawning'] else 'No'}")
        if "yawn_count" in context:
            lines.append(f"Yawn count: {context['yawn_count']}")
        if "lat" in context and "lon" in context:
            lines.append(f"Location: {context['lat']}, {context['lon']}")
        return "\n".join(lines)

    def clear_history(self):
        """Clear conversation history."""
        self._conversation_history.clear()
