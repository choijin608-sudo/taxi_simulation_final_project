import React, { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { TripsLayer } from '@deck.gl/geo-layers';

// ⭐ 데이터 파일을 코드와 한 몸으로 만듭니다. (파일이 src 폴더에 있어야 함!)
import tripsData from './trips_data.json'; 

// ⭐ 본인의 Mapbox 토큰으로 바꿔주세요
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiY2hvaWluNjA4IiwiYSI6ImNtaGJtNXllYjFjYnUybm9vcW16YXBsaXEifQ.4g2f0ZLXlOYBqfsKXodiug';

const INITIAL_VIEW_STATE = {
  longitude: 127.126,
  latitude: 37.420,
  zoom: 12,
  pitch: 45,
  bearing: 0
};

function App() {
  // 데이터를 바로 State에 넣습니다. (로딩 과정 없음)
  const [trips] = useState(tripsData);
  const [time, setTime] = useState(420); // 07:00
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const animationRef = useRef(null);

  // 🛠️ [CSS 강제 주입] 검은 화면/흰 화면 방지용 안전장치
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000';
  }, []);

  // 🔄 애니메이션 루프
  useEffect(() => {
    const animate = () => {
      setTime(t => (t > 600 ? 420 : t + (0.1 * animationSpeed)));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animationSpeed]);

  // 🎨 레이어 설정 (형광 주황색 꼬리)
  const layers = [
    new TripsLayer({
      id: 'trips-layer',
      data: trips,
      getPath: d => d.path, // [[lon, lat, time], ...]
      getTimestamps: d => d.path.map(p => p[2]),
      getColor: [255, 128, 0], // 형광 주황
      opacity: 1,
      widthMinPixels: 4,
      jointRounded: true,
      capRounded: true,
      trailLength: 10,
      currentTime: time,
      shadowEnabled: false
    })
  ];

  const displayTime = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: 'black' }}>
       {/* UI 패널 */}
       <div style={{ 
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', 
          zIndex: 10, backgroundColor: 'rgba(0,0,0,0.8)', padding: '15px', 
          borderRadius: '10px', color: 'white', border: '1px solid #444', textAlign: 'center'
      }}>
          <h2 style={{ margin: '0 0 10px 0' }}>🚕 Road Trip Simulation</h2>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fd805d' }}>{displayTime}</div>
          <div style={{ marginTop: '10px' }}>
            <label>Speed: {animationSpeed}x </label>
            <input 
              type="range" min="0.5" max="5" step="0.5" 
              value={animationSpeed} 
              onChange={(e) => setAnimationSpeed(Number(e.target.value))} 
            />
          </div>
      </div>

      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        style={{ width: '100%', height: '100%' }}
      >
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>
    </div>
  );
}

export default App;