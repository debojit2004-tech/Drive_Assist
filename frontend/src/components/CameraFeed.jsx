import React, { useEffect, useRef } from 'react';
import { Camera, CameraOff, Scan, Eye } from 'lucide-react';

export default function CameraFeed({ frame, faceDetected, isConnected, demoMode, ear = 0.3, mar = 0.2, camera }) {
  const canvasRef = useRef(null);

  // Animated demo visualization when no camera feed
  useEffect(() => {
    if (frame || (camera && camera.active) || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = 480, H = 340;
    canvas.width = W; canvas.height = H;
    let rafId, t = 0;

    const draw = () => {
      t += 0.02;
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, '#080818'); bgGrad.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = 'rgba(99,102,241,0.04)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      const cx = W / 2, cy = H / 2 - 10;
      ctx.save(); ctx.shadowColor = 'rgba(99,102,241,0.3)'; ctx.shadowBlur = 20;
      ctx.strokeStyle = 'rgba(99,102,241,0.15)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 75, 100, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2;
        const x = cx + Math.cos(angle) * (70 + Math.sin(angle * 3 + t) * 5);
        const y = cy + Math.sin(angle) * (95 + Math.cos(angle * 2 + t) * 5);
        ctx.fillStyle = `rgba(99,102,241,${0.3 + 0.3 * Math.sin(t * 2 + i * 0.3)})`;
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      const eyeH = 12 * (ear > 0.2 ? 1 : 0.3);
      ctx.fillStyle = `rgba(34,197,94,${ear > 0.2 ? 0.6 : 0.9})`;
      ctx.beginPath(); ctx.ellipse(cx - 30, cy - 15, 16, eyeH, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + 30, cy - 15, 16, eyeH, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.beginPath(); ctx.arc(cx - 30 + Math.sin(t * 0.5) * 3, cy - 15, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 30 + Math.sin(t * 0.5) * 3, cy - 15, 4, 0, Math.PI * 2); ctx.fill();

      const mouthOpen = mar > 0.4 ? mar * 20 : 3;
      ctx.strokeStyle = `rgba(139,92,246,${mar > 0.4 ? 0.8 : 0.4})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy + 40, 22, Math.max(3, mouthOpen), 0, 0, Math.PI * 2); ctx.stroke();

      const scanY = (t * 60) % H;
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, 'transparent'); scanGrad.addColorStop(0.5, 'rgba(99,102,241,0.06)'); scanGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = scanGrad; ctx.fillRect(0, scanY - 20, W, 40);

      ctx.strokeStyle = 'rgba(99,102,241,0.3)'; ctx.lineWidth = 2;
      const br = 30;
      ctx.beginPath(); ctx.moveTo(cx-90,cy-120+br); ctx.lineTo(cx-90,cy-120); ctx.lineTo(cx-90+br,cy-120); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+90-br,cy-120); ctx.lineTo(cx+90,cy-120); ctx.lineTo(cx+90,cy-120+br); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-90,cy+110-br); ctx.lineTo(cx-90,cy+110); ctx.lineTo(cx-90+br,cy+110); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+90-br,cy+110); ctx.lineTo(cx+90,cy+110); ctx.lineTo(cx+90,cy+110-br); ctx.stroke();

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(99,102,241,0.5)'; ctx.fillText('ANALYZING', 15, 25);
      ctx.fillStyle = 'rgba(99,102,241,0.3)';
      ctx.fillText(`EAR: ${ear?.toFixed(3) || '0.300'}`, 15, H - 30);
      ctx.fillText(`MAR: ${mar?.toFixed(3) || '0.200'}`, 15, H - 15);
      ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.textAlign = 'right';
      ctx.fillText('DEMO MODE', W - 15, 25); ctx.textAlign = 'left';

      rafId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafId);
  }, [frame, ear, mar, camera?.active]);

  // Set video srcObject when camera changes
  useEffect(() => {
    if (camera?.active && camera?.stream && camera?.videoRef?.current) {
      camera.videoRef.current.srcObject = camera.stream;
    }
  }, [camera?.active, camera?.stream]);

  const showCamera = camera && camera.active;
  const showBackendFrame = !showCamera && frame;
  const showCanvas = !showCamera && !showBackendFrame;

  return (
    <div className="card overflow-hidden" style={{ height: '100%' }}>
      <div className="card-header">
        <h3><Camera size={16} /> Live Feed</h3>
        <div className="flex items-center gap-3">
          {showCamera && (
            <span className="badge" style={{ background: 'var(--safe-bg)', color: 'var(--safe)', border: '1px solid var(--safe-border)' }}>
              <Camera size={10} /> LIVE
            </span>
          )}
          {demoMode && !showCamera && (
            <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)' }}>
              <Scan size={10} /> SIM
            </span>
          )}
          {(isConnected || showCamera) && (
            <div className="flex items-center gap-1 anim-blink">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--danger)' }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--danger)' }}>REC</span>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#060612', position: 'relative' }}>
        {/* Browser camera */}
        {showCamera && (
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="w-full"
            style={{ height: '340px', objectFit: 'cover', display: 'block', transform: 'scaleX(-1)' }}
          />
        )}

        {/* Backend frame */}
        {showBackendFrame && (
          <img src={`data:image/jpeg;base64,${frame}`} alt="Camera" className="w-full" style={{ maxHeight: '340px', objectFit: 'contain' }} />
        )}

        {/* Demo canvas */}
        {showCanvas && (
          <canvas ref={canvasRef} className="w-full" style={{ height: '340px', display: 'block' }} />
        )}

        {/* Camera error overlay */}
        {camera?.error && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="text-center p-6">
              <CameraOff size={32} style={{ color: 'var(--danger)', margin: '0 auto 12px' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>Camera Access Denied</p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{camera.error}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5"
           style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-2">
          <Eye size={13} style={{ color: faceDetected || showCamera ? 'var(--safe)' : 'var(--danger)' }} />
          <span className="text-[11px] font-medium" style={{ color: faceDetected || showCamera ? 'var(--safe)' : 'var(--danger)' }}>
            {showCamera ? 'CAMERA ACTIVE' : faceDetected ? 'FACE LOCKED' : 'NO FACE'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>
            EAR <span style={{ color: 'var(--accent-1)' }}>{(ear || 0).toFixed(3)}</span>
          </span>
          <span className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>
            MAR <span style={{ color: 'var(--accent-2)' }}>{(mar || 0).toFixed(3)}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
