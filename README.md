# 🚗 DriveAssist AI — Driver Safety System

<div align="center">

![DriveAssist](https://img.shields.io/badge/DriveAssist-AI%20Safety-6366f1?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)

**AI-powered real-time driver monitoring using computer vision, adaptive risk scoring, and voice AI chatbot.**

[🚀 Live Demo](#) · [📖 Documentation](#architecture) · [🐛 Report Bug](#)

</div>

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 👁️ **Drowsiness Detection** | 468-point MediaPipe Face Mesh tracks Eye Aspect Ratio (EAR) in real-time |
| 🧠 **Emotion AI** | DeepFace classifies 7 emotions and maps them to driving risk |
| ⚡ **Adaptive Risk Engine** | 5-factor weighted formula personalised to your baseline |
| 📍 **GPS Safe Stops** | Live location with nearby rest stops, hospitals, fuel stations |
| 🎤 **Voice AI Chatbot** | Gemini-powered assistant with **speech input & TTS output** |
| 🚨 **Smart Alert System** | Audio + visual alerts with alert history and voice announcements |
| 📊 **Live Analytics** | Historical trends, radar charts, session logs, emotion breakdown |
| 🎨 **3 Themes** | Dark Galaxy, Light, and Neon Car modes |

---

## 🏗️ Architecture

```
Browser Camera / GPS
        ↓
FastAPI Backend (port 8000)
  ├── WebSocket /ws  →  Real-time 30fps streaming
  ├── POST /analyze-frame  →  Browser frame analysis
  ├── POST /chat  →  Gemini AI chatbot
  └── GET  /nearby-places  →  GPS POI lookup
        ↓
React Frontend (port 5173)
  ├── Landing Page  →  Marketing + auth flow
  ├── Sign In  →  Auth with demo access
  ├── Dashboard  →  Live monitoring
  ├── Analytics  →  Historical data
  └── About  →  System docs
```

**Risk Formula:**
```
Risk = 0.35×EAR_drop + 0.20×MAR_freq + 0.15×Emotion + 0.20×Time + 0.10×Baseline
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Webcam (optional — demo mode works without)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/driveassist.git
cd driveassist
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Start backend
python main.py
# → Running on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running on http://localhost:5173
```

### 4. Open the App
Visit **http://localhost:5173** and click **"Get Started"** or **"⚡ Quick Demo Access"**

---

## ⚙️ Environment Variables

Create `backend/.env` (see `.env.example`):

```env
# Camera (0 = default webcam)
CAMERA_INDEX=0

# MongoDB (optional)
MONGO_URI=mongodb://localhost:27017
MONGO_DB=driver_ai

# Google Gemini AI — get from https://aistudio.google.com/apikey
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.0-flash

# Server
HOST=0.0.0.0
PORT=8000
FRONTEND_URL=http://localhost:5173
```

> ⚠️ **Never commit your `.env` file.** It's in `.gitignore`.

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite 5
- **Tailwind CSS** + custom CSS design system
- **Recharts** — analytics charts
- **Leaflet.js** — GPS map
- **Web Speech API** — voice chatbot

### Backend
- **FastAPI** + Uvicorn
- **MediaPipe** — 468-point face mesh
- **OpenCV** — computer vision pipeline
- **DeepFace** — emotion classification
- **Google Gemini AI** — chatbot

### APIs & Services
- Overpass API — nearby POI lookup
- Browser Geolocation API
- CARTO — map tiles

---

## 📁 Project Structure

```
Drive Assist/
├── backend/
│   ├── main.py              # FastAPI app + WebSocket
│   ├── chatbot.py           # Gemini AI chatbot
│   ├── risk_engine.py       # 5-factor risk computation
│   ├── gps.py               # GPS + nearby places
│   ├── driver_profile.py    # Baseline profiles
│   ├── config.py            # Settings
│   ├── requirements.txt
│   └── vision/
│       ├── camera.py        # Camera capture
│       ├── face_detector.py # MediaPipe landmarks
│       ├── ear_mar.py       # EAR/MAR computation
│       └── emotion_detector.py
└── frontend/
    ├── src/
    │   ├── pages/           # LandingPage, Dashboard, Analytics, About, SignIn
    │   ├── components/      # Navbar, Dashboard, ChatbotPanel, AlertBanner, …
    │   └── hooks/           # useWebSocket, useGeolocation, useTheme
    └── vite.config.js
```

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with ❤️ for safer roads · <strong>DriveAssist AI © 2026</strong>
</div>
