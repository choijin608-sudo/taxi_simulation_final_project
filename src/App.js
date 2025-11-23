import React, { useState, useEffect, useRef } from 'react';
import Map from 'react-map-gl';
import DeckGL from '@deck.gl/react';
import { TripsLayer } from '@deck.gl/geo-layers';

// ⭐ 본인의 Mapbox 토큰 확인!
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
  const [time, setTime] = useState(420);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const animationRef = useRef(null);

  // 1. 데이터 로드 (여기가 핵심!)
  useEffect(() => {
    // ⭐ process.env.PUBLIC_URL을 붙여서 경로를 자동으로 완성합니다.
    const DATA_URL = `${process.env.PUBLIC_URL}/trips_data.json`;
    
    console.log("데이터 가지러 가는 주소:", DATA_URL); // 콘솔에서 주소 확인 가능

    fetch(DATA_URL)
      .then(resp => {
          if (!resp.ok) throw new Error("파일을 못 찾겠어요 (404)");
          return resp.json();
      })
      .then(data => {
        setTrips(data);
        console.log("✅ 데이터 로드 성공:", data.length);
      })
      .catch(err => console.error("❌ 데이터 로드 실패:", err));
  }, []);

  // 2. 애니메이션 루프
  useEffect(() => {
    const animate = () => {
      setTime(t => (t > 600 ? 420 : t + (0.1 * animationSpeed)));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animationSpeed]);

  // 3. 레이어 설정
  const layers = [
    new TripsLayer({
      id: 'trips-layer',
      data: trips,
      getPath: d => d.path,
      getTimestamps: d => d.path.map(p => p[2]),
      getColor: [255, 128, 0],
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
       {/* 스타일 강제 주입 */}
       <style>{`body { margin: 0; background: black; overflow: hidden; }`}</style>
       <link href="https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css" rel="stylesheet" />

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
      >
        <Map
          mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
          mapStyle="mapbox://styles/mapbox/dark-v11"
        />
      </DeckGL>
    </div>
  );
}

export default App;