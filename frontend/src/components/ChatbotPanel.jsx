import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, X, Bot, User, Sparkles, Mic, MicOff, Volume2, VolumeX, Car } from 'lucide-react';

/* ─── Local response engine ─── */
const LOCAL_RESPONSES = {
  risk: (data) => {
    const score = data?.risk?.score || 0;
    if (score > 80) return `🆘 CRITICAL! Your risk score is ${score.toFixed(0)}/100 — dangerously high. Your eyes are showing severe fatigue. Pull over immediately and rest!`;
    if (score > 60) return `🚨 Risk score ${score.toFixed(0)}/100 — alarm zone. I strongly recommend finding a rest stop in the next few minutes. Your safety comes first!`;
    if (score > 30) return `⚠️ Risk score ${score.toFixed(0)}/100. You're showing mild fatigue. Consider a 15-minute power nap or coffee break.`;
    return `✅ Risk score ${score.toFixed(0)}/100 — looking great! You're alert and driving safely. Keep it up! 🚗`;
  },
  fatigue: (data) => {
    const d = data?.drowsiness || {};
    if (d.is_drowsy) return `😴 Yes, you're drowsy! EAR: ${data?.ear?.toFixed(3)}. I've detected ${d.yawn_count} yawns this session. Please take a break immediately!`;
    if ((d.yawn_count || 0) > 2) return `🥱 You've yawned ${d.yawn_count} times. Early fatigue signs detected. A 10-minute break would be ideal.`;
    return `👁️ No drowsiness detected! EAR: ${(data?.ear || 0.3).toFixed(3)} — healthy range. You're alert and focused! 💪`;
  },
  stops: () => `📍 To find nearby safe stops, enable GPS in your browser.\n\nI can help locate:\n🅿️ Rest stops\n⛽ Fuel stations\n🏥 Hospitals\n🏨 Hotels\n🍽️ Restaurants\n\nThey'll appear on the map panel automatically!`,
  tips: () => `💡 Top Tips to Stay Alert:\n\n1. 🧊 Open windows for fresh air\n2. ☕ Have caffeine (takes 20 min)\n3. 🎵 Play upbeat music\n4. 💬 Talk to a passenger\n5. 🔄 Change sitting position\n6. 🛑 Best: Stop and nap 15-20 min!\n\nNo destination is worth your life! 🙏`,
  emotion: (data) => {
    const e = data?.emotion?.emotion || 'neutral';
    const map = { angry: 'Anger increases risk — try deep breathing 🧘', sad: 'Sadness can impair focus — consider stopping 💙', fear: 'Fear detected — pull over safely if needed ⚠️', happy: 'Great mood — keep enjoying the drive! 😊', neutral: 'Neutral state — ideal for safe driving ✅' };
    return `😊 Current emotion: ${e.toUpperCase()}\n${map[e] || 'Stay focused on the road!'}\nConfidence: ${(data?.emotion?.confidence || 0).toFixed(0)}%`;
  },
  default: (data) => {
    const emotion = data?.emotion?.emotion || 'neutral';
    return `🚗 Hi! I'm your DriveAssist AI Co-pilot!\n\nAsk me:\n📊 "My risk" — Current risk score\n😴 "Am I tired?" — Fatigue check\n😊 "My emotion" — Emotion analysis\n📍 "Nearby stops" — Safe places\n💡 "Tips" — Stay alert tips\n\nCurrent: EAR ${(data?.ear || 0.3).toFixed(3)} | Emotion: ${emotion}`;
  },
};

function getLocalResponse(message, data) {
  const msg = message.toLowerCase();
  if (msg.includes('risk') || msg.includes('score') || msg.includes('level')) return LOCAL_RESPONSES.risk(data);
  if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('drowsy') || msg.includes('sleepy')) return LOCAL_RESPONSES.fatigue(data);
  if (msg.includes('stop') || msg.includes('nearby') || msg.includes('rest') || msg.includes('gas') || msg.includes('hospital')) return LOCAL_RESPONSES.stops();
  if (msg.includes('tip') || msg.includes('alert') || msg.includes('awake') || msg.includes('help')) return LOCAL_RESPONSES.tips();
  if (msg.includes('emotion') || msg.includes('feel') || msg.includes('mood')) return LOCAL_RESPONSES.emotion(data);
  return LOCAL_RESPONSES.default(data);
}

/* ─── Speech synthesis helper ─── */
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const plain = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '').replace(/[*_#]/g, '').trim();
  const utt = new SpeechSynthesisUtterance(plain);
  utt.rate = 0.95;
  utt.pitch = 1.05;
  utt.volume = 1;
  // prefer a clear voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utt.voice = preferred;
  window.speechSynthesis.speak(utt);
}

export default function ChatbotPanel({ currentData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "👋 Hey! I'm your DriveAssist AI Co-pilot.\n\nAsk me about your risk score, fatigue, emotions, or nearby rest stops. You can also tap 🎤 to speak!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);     // TTS
  const [listening, setListening] = useState(false);           // STT
  const [voiceSupported] = useState(() => !!window.SpeechRecognition || !!window.webkitSpeechRecognition);
  const scrollRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  /* ─── Voice Input (STT) ─── */
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 200);
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
  }, []);

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  /* ─── Send Message ─── */
  const sendMessage = async (text) => {
    if (!text?.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    let reply;
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        const data = await res.json();
        reply = data.response;
      } else throw new Error('Backend unavailable');
    } catch {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
      reply = getLocalResponse(text, currentData);
    }

    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setLoading(false);
    if (voiceEnabled) speakText(reply);
  };

  const quickActions = [
    { label: '📊 Risk', msg: 'What is my current risk level?' },
    { label: '😴 Fatigue', msg: 'Am I showing signs of fatigue?' },
    { label: '😊 Emotion', msg: 'What is my current emotion?' },
    { label: '📍 Stops', msg: 'Show me nearby safe stops' },
    { label: '💡 Tips', msg: 'Tips to stay alert while driving' },
  ];

  /* ─── FAB (closed state) ─── */
  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="anim-float"
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 50,
          width: 60, height: 60, borderRadius: 20,
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          boxShadow: '0 8px 30px rgba(99,102,241,0.4)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
        <MessageCircle size={26} color="white" />
        {/* Pulse ring */}
        <span style={{ position: 'absolute', inset: -4, borderRadius: 24, border: '2px solid rgba(99,102,241,0.3)', animation: 'pulse-ring 2s ease-out infinite' }} />
      </button>
    );
  }

  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 50, width: 420 }} className="anim-scale-in">
      <div className="card" style={{ height: 580, borderRadius: 24, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ─ Header ─ */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px', borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              <Car size={18} color="white" />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)', letterSpacing: 0.5 }}>DriveAssist AI</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                <p style={{ fontSize: 10, color: '#22c55e', fontWeight: 600 }}>Co-pilot Online</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {/* TTS toggle */}
            <button onClick={() => { setVoiceEnabled(v => !v); if (voiceEnabled) window.speechSynthesis?.cancel(); }}
              title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              style={{ width: 32, height: 32, borderRadius: 10, background: voiceEnabled ? 'rgba(99,102,241,0.15)' : 'var(--bg-secondary)', border: `1px solid ${voiceEnabled ? 'rgba(99,102,241,0.4)' : 'var(--border-color)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: voiceEnabled ? '#6366f1' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button onClick={() => setIsOpen(false)}
              style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ─ Messages ─ */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'bot' && (
                <div style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <Bot size={12} color="#6366f1" />
                </div>
              )}
              <div style={{
                maxWidth: '78%', padding: '10px 14px', borderRadius: 16, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line',
                background: msg.role === 'user' ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                border: msg.role === 'bot' ? '1px solid var(--border-color)' : 'none',
                borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                borderTopLeftRadius: msg.role === 'bot' ? 4 : 16,
              }}>
                {msg.text}
                {/* TTS play button for bot */}
                {msg.role === 'bot' && (
                  <button onClick={() => speakText(msg.text)} title="Read aloud"
                    style={{ display: 'inline-flex', marginLeft: 8, background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', verticalAlign: 'middle', padding: 0 }}>
                    <Volume2 size={11} />
                  </button>
                )}
              </div>
              {msg.role === 'user' && (
                <div style={{ width: 28, height: 28, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                  <User size={12} color="white" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={12} color="#6366f1" />
              </div>
              <div style={{ padding: '12px 16px', borderRadius: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', gap: 5, alignItems: 'center' }}>
                {[0, 150, 300].map(d => (
                  <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#6366f1', animation: `bounce 1s ${d}ms infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ─ Quick Actions ─ */}
        <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 6, overflowX: 'auto' }}>
          {quickActions.map((qa, i) => (
            <button key={i} onClick={() => sendMessage(qa.msg)}
              style={{ fontSize: 11, padding: '5px 10px', borderRadius: 10, whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', fontWeight: 600, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', transition: 'all 0.2s', fontFamily: 'var(--font-sans)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.color = '#6366f1'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
              {qa.label}
            </button>
          ))}
        </div>

        {/* ─ Input Row ─ */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-color)' }}>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder={listening ? '🎤 Listening…' : 'Ask about your driving safety…'}
              style={{ flex: 1, fontSize: 13, padding: '10px 14px', borderRadius: 12, outline: 'none', background: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontFamily: 'var(--font-sans)', transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.4)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
            />
            {/* Voice button */}
            {voiceSupported && (
              <button type="button" onClick={listening ? stopListening : startListening}
                style={{
                  width: 40, height: 40, borderRadius: 12, cursor: 'pointer', flexShrink: 0, border: 'none',
                  background: listening ? 'rgba(239,68,68,0.12)' : 'var(--bg-secondary)',
                  border: `1px solid ${listening ? 'rgba(239,68,68,0.4)' : 'var(--border-color)'}`,
                  color: listening ? '#ef4444' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
                  animation: listening ? 'glow-pulse 1s ease-in-out infinite' : 'none',
                }}>
                {listening ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
            )}
            {/* Send button */}
            <button type="submit" disabled={!input.trim() || loading}
              style={{ width: 40, height: 40, borderRadius: 12, cursor: input.trim() ? 'pointer' : 'default', flexShrink: 0, border: 'none', background: input.trim() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'var(--bg-secondary)', opacity: input.trim() ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
              <Send size={15} color="white" />
            </button>
          </form>
          {/* Voice hint */}
          {voiceSupported && (
            <p style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 6 }}>
              🎤 Voice input • 🔊 TTS {voiceEnabled ? 'ON' : 'OFF'}
            </p>
          )}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1.2);opacity:1} }`}</style>
    </div>
  );
}
