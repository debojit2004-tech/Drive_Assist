import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass, Locate, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const driverIcon = new L.DivIcon({
  html: `<div style="width:18px;height:18px;background:#22c55e;border:3px solid #fff;border-radius:50%;box-shadow:0 0 20px rgba(34,197,94,0.6), 0 0 40px rgba(34,197,94,0.2);"></div>`,
  className: '', iconSize: [18, 18], iconAnchor: [9, 9],
});

const placeIcons = {
  rest_stop:    new L.DivIcon({ html: '<div style="font-size:20px">🅿️</div>', className: '', iconSize: [24, 24] }),
  fuel_station: new L.DivIcon({ html: '<div style="font-size:20px">⛽</div>', className: '', iconSize: [24, 24] }),
  hospital:     new L.DivIcon({ html: '<div style="font-size:20px">🏥</div>', className: '', iconSize: [24, 24] }),
  hotel:        new L.DivIcon({ html: '<div style="font-size:20px">🏨</div>', className: '', iconSize: [24, 24] }),
  restaurant:   new L.DivIcon({ html: '<div style="font-size:20px">🍽️</div>', className: '', iconSize: [24, 24] }),
};

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo([position.lat, position.lon], map.getZoom(), { duration: 1.5 });
  }, [position?.lat, position?.lon]);
  return null;
}

export default function MapPanel({ position, nearbyPlaces = [] }) {
  const [places, setPlaces] = useState([]);
  const lat = position?.lat || 28.6139;
  const lon = position?.lon || 77.2090;
  const hasRealGPS = position && !position.source;
  const accuracy = position?.accuracy || 0;

  useEffect(() => {
    if (position) {
      fetch(`/api/nearby-places?lat=${position.lat}&lon=${position.lon}`)
        .then(r => r.json())
        .then(d => { if (d.places) setPlaces(d.places); })
        .catch(() => {});
    }
  }, [position?.lat, position?.lon]);

  const allPlaces = places.length > 0 ? places : nearbyPlaces;

  return (
    <div className="card overflow-hidden" style={{ height: '100%' }}>
      <div className="card-header">
        <h3><MapPin size={16} /> GPS Tracking</h3>
        <div className="flex items-center gap-3">
          {/* GPS source indicator */}
          {position?.source === 'ip' && (
            <span className="badge" style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning-border)', fontSize: '9px' }}>
              IP-based
            </span>
          )}
          {position?.source === 'default' && (
            <span className="badge" style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)', fontSize: '9px' }}>
              Default
            </span>
          )}
          {hasRealGPS && (
            <span className="badge" style={{ background: 'var(--safe-bg)', color: 'var(--safe)', border: '1px solid var(--safe-border)', fontSize: '9px' }}>
              <Locate size={9} /> GPS
            </span>
          )}
          <span className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Location details bar */}
      <div className="flex items-center gap-4 px-4 py-2" style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
        {position?.city && (
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>
            📍 {position.city}{position.region ? `, ${position.region}` : ''}{position.country ? `, ${position.country}` : ''}
          </span>
        )}
        {accuracy > 0 && accuracy < 10000 && (
          <span className="text-[10px] mono" style={{ color: 'var(--text-muted)' }}>
            ±{accuracy < 1000 ? `${accuracy.toFixed(0)}m` : `${(accuracy / 1000).toFixed(1)}km`}
          </span>
        )}
        {position?.speed > 0 && (
          <span className="text-[10px] mono" style={{ color: 'var(--accent-1)' }}>
            {(position.speed * 3.6).toFixed(0)} km/h
          </span>
        )}
      </div>

      <div style={{ height: 'calc(100% - 100px)', minHeight: '280px' }}>
        <MapContainer center={[lat, lon]} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          <MapUpdater position={position} />
          <Marker position={[lat, lon]} icon={driverIcon}>
            <Popup><div style={{ color: '#000', fontSize: '12px' }}><strong>📍 Your Location</strong><br />{lat.toFixed(5)}, {lon.toFixed(5)}{position?.city ? <><br />{position.city}</> : ''}</div></Popup>
          </Marker>
          {/* Accuracy circle */}
          {hasRealGPS && accuracy > 0 && accuracy < 2000 && (
            <Circle center={[lat, lon]} radius={accuracy} pathOptions={{ color: '#22c55e', weight: 1, fillColor: '#22c55e', fillOpacity: 0.05 }} />
          )}
          {allPlaces.map((place, i) => (
            <Marker key={i} position={[place.lat, place.lon]} icon={placeIcons[place.category] || placeIcons.rest_stop}>
              <Popup>
                <div style={{ color: '#000', fontSize: '12px' }}>
                  <strong>{place.icon} {place.name}</strong><br />
                  {place.distance_km}km — <a href={place.maps_url} target="_blank" rel="noreferrer" style={{ color: '#4f46e5' }}>Navigate →</a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {allPlaces.length > 0 && (
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border-color)', maxHeight: '120px', overflowY: 'auto' }}>
          <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>NEARBY</p>
          {allPlaces.slice(0, 4).map((p, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 text-[11px]" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ color: 'var(--text-primary)' }}>{p.icon} {p.name}</span>
              <span className="mono" style={{ color: 'var(--text-muted)' }}>{p.distance_km}km</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
