import React from 'react';
import CameraFeed from './CameraFeed';
import RiskMeter from './RiskMeter';
import DrowsinessIndicator from './DrowsinessIndicator';
import EmotionDisplay from './EmotionDisplay';
import AnalyticsCharts from './AnalyticsCharts';
import MapPanel from './MapPanel';
import AlertBanner from './AlertBanner';

export default function Dashboard({ wsData, isConnected, position, camera }) {
  let earH, marH, riskH;
  if (wsData?._earHistory) {
    earH = wsData._earHistory; marH = wsData._marHistory; riskH = wsData._riskHistory;
  } else { earH = []; marH = []; riskH = []; }

  const risk = wsData?.risk || {};
  const drowsiness = wsData?.drowsiness || {};
  const emotion = wsData?.emotion || {};

  return (
    <div className="stagger">
      <AlertBanner level={risk.level} action={risk.action} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">
        <div className="lg:col-span-4">
          <CameraFeed
            frame={wsData?.frame} faceDetected={wsData?.face_detected}
            isConnected={isConnected || !!wsData} demoMode={wsData?.demo_mode}
            ear={wsData?.ear} mar={wsData?.mar} camera={camera}
          />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <RiskMeter score={risk.score || 0} level={risk.level || 'safe'} trend={risk.trend || 'stable'}
                     action={risk.action || ''} components={risk.components} sessionMinutes={risk.session_minutes || 0} />
          <EmotionDisplay emotion={emotion.emotion || 'neutral'} confidence={emotion.confidence || 0} allEmotions={emotion.all_emotions} />
        </div>
        <div className="lg:col-span-4">
          <MapPanel position={position} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <DrowsinessIndicator ear={wsData?.ear || 0.3} mar={wsData?.mar || 0.2}
                               isDrowsy={drowsiness.is_drowsy} isYawning={drowsiness.is_yawning}
                               yawnCount={drowsiness.yawn_count || 0} closedFrames={drowsiness.closed_frames || 0} />
        </div>
        <div className="lg:col-span-8">
          <AnalyticsCharts earHistory={earH} marHistory={marH} riskHistory={riskH} />
        </div>
      </div>
    </div>
  );
}
