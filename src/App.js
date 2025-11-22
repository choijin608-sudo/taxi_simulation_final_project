import React, { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { TripsLayer } from '@deck.gl/geo-layers';
import { ScatterplotLayer } from '@deck.gl/layers';

// ⭐ 본인의 Mapbox 토큰을 넣어주세요
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiY2hvaWluNjA4IiwiYSI6ImNtaGJtNXllYjFjYnUybm9vcW16YXBsaXEifQ.4g2f0ZLXlOYBqfsKXodiug';

const INITIAL_VIEW_STATE = {
  longitude: 127.126,
  latitude: 37.420,
  zoom: 12,
  pitch: 45,
  bearing: 0
};

function App() {
  const [trips, setTrips] = useState([]);
  const [time, setTime] = useState(420); // 07:00
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const animationRef = useRef(null);

  // 🧪 1. [핵심] CSS 강제 주입 (index.html 수정 불필요)
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    // body 스타일 강제 지정
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#000';
  }, []);

  // 2. 데이터 로드
  useEffect(() => {
    fetch('/trips_data.json')
      .then(resp => resp.json())
      .then(data => {
        setTrips(data);
        console.log("✅ 경로 데이터 로드 완료:", data.length);
      })
      .catch(err => console.error("데이터 로드 실패:", err));
  }, []);

  // 3. 애니메이션
  useEffect(() => {
    const animate = () => {
      setTime(t => (t > 600 ? 420 : t + (0.1 * animationSpeed)));
      animationRef.current = requestAnimationFrame(animate);
    };
    if (trips.length > 0) animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [trips, animationSpeed]);

  // 4. 레이어 (꼬리 효과)
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
      trailLength: 10, // 꼬리 길이 (분)
      currentTime: time,
      shadowEnabled: false
    })
  ];

  const displayTime = `${String(Math.floor(time / 60)).padStart(2, '0')}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

  return (
    // 전체 화면 컨테이너 강제 지정
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
        style={{ width: '100%', height: '100%' }} // 강제 크기
      >
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          style={{ width: '100%', height: '100%' }} // 강제 크기
        />
      </DeckGL>
    </div>
  );
}

export default App;