// src/components/MRU3D.jsx
import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line, Html } from "@react-three/drei";
import * as THREE from "three";

function Particle({ velocidade, posInicial, tempo, setCurrentPos, cor }) {
  const ref = useRef();

  // Posição atual calculada diretamente das props
  const x = posInicial.x + velocidade.x * tempo;
  const y = posInicial.y + velocidade.y * tempo;
  const z = posInicial.z + velocidade.z * tempo;

  // Gera o rastro COMPLETO de t=0 até tempo atual de uma só vez.
  // Assim o rastro aparece inteiro imediatamente, sem efeito de "crescimento".
  const trail = useMemo(() => {
    if (tempo <= 0) return [];
    const steps = Math.min(Math.ceil(tempo / 0.05), 200);
    const dt = tempo / steps;
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      points.push(new THREE.Vector3(
        posInicial.x + velocidade.x * t,
        posInicial.y + velocidade.y * t,
        posInicial.z + velocidade.z * t
      ));
    }
    return points;
  }, [tempo, posInicial.x, posInicial.y, posInicial.z, velocidade.x, velocidade.y, velocidade.z]);

  useFrame(() => {
    if (ref.current) {
      ref.current.position.set(x, y, z);
    }
    setCurrentPos({ x, y, z });
  });

  return (
    <>
      {/* Partícula principal */}
      <mesh ref={ref}>
        <sphereGeometry args={[0.28, 64, 64]} />
        <meshStandardMaterial 
          color={cor} 
          emissive={cor} 
          emissiveIntensity={0.8}
          metalness={0.6}
          roughness={0.2}
        />
      </mesh>
      
      {/* Luz de glow na partícula */}
      <pointLight 
        position={ref.current?.position || [0, 0, 0]} 
        intensity={1.2} 
        distance={5} 
        color={cor} 
      />
      
      {/* Rastro da partícula */}
      {trail.length > 2 && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              count={trail.length}
              array={new Float32Array(trail.flatMap(v => [v.x, v.y, v.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={cor} linewidth={2} transparent opacity={0.6} />
        </line>
      )}
    </>
  );
}

// Componente de eixos melhorado
function AxesWithLabels() {
  const axisLength = 8;
  
  return (
    <group>
      {/* Eixo X - Vermelho */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), axisLength, 0xff4444, 0.6, 0.4]} />
      <Text
        position={[axisLength + 0.3, -0.2, -0.2]}
        fontSize={0.55}
        color="#ff6666"
        anchorX="center"
        anchorY="center"
        fontWeight="bold"
      >
        X
      </Text>
      
      {/* Eixo Y - Verde */}
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), axisLength, 0x44ff44, 0.6, 0.4]} />
      <Text
        position={[-0.2, axisLength + 0.3, -0.2]}
        fontSize={0.55}
        color="#66ff66"
        anchorX="center"
        anchorY="center"
        fontWeight="bold"
      >
        Y
      </Text>
      
      {/* Eixo Z - Azul */}
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), axisLength, 0x4444ff, 0.6, 0.4]} />
      <Text
        position={[-0.2, -0.2, axisLength + 0.3]}
        fontSize={0.55}
        color="#6688ff"
        anchorX="center"
        anchorY="center"
        fontWeight="bold"
      >
        Z
      </Text>

      {/* Linhas dos eixos estendidas */}
      <Line
        points={[[-axisLength, 0, 0], [axisLength + 1, 0, 0]]}
        color="#ff8888"
        opacity={0.3}
        lineWidth={1}
      />
      <Line
        points={[[0, -axisLength, 0], [0, axisLength + 1, 0]]}
        color="#88ff88"
        opacity={0.3}
        lineWidth={1}
      />
      <Line
        points={[[0, 0, -axisLength], [0, 0, axisLength + 1]]}
        color="#8888ff"
        opacity={0.3}
        lineWidth={1}
      />

      {/* GridHelper no chão */}
      <gridHelper args={[16, 24, "#00D4FF", "#444444"]} position={[0, -3, 0]} />
    </group>
  );
}

// Componente para mostrar posição atual em 3D
function FloatingInfo({ position, color }) {
  return (
    <Html position={[position.x, position.y + 0.6, position.z]} center>
      <div style={{
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        padding: '4px 10px',
        borderRadius: '20px',
        border: `1px solid ${color}`,
        fontSize: '11px',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        color: '#fff',
        pointerEvents: 'none'
      }}>
        <span style={{ color }}>●</span> ({position.x.toFixed(2)}, {position.y.toFixed(2)}, {position.z.toFixed(2)})
      </div>
    </Html>
  );
}

// Componente principal MRU3D
export default function MRU3D({ velocidade, posInicial, tempo }) {
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0, z: 0 });
  const [showInfo, setShowInfo] = useState(true);
  
  // Cor da partícula baseada na velocidade
  const particleColor = velocidade.x > 0 ? "#F97316" : "#FF6B9D";

  // Cálculos para as equações
  const x_t = posInicial.x + velocidade.x * tempo;
  const y_t = posInicial.y + velocidade.y * tempo;
  const z_t = posInicial.z + velocidade.z * tempo;

  const r0_str = `(${posInicial.x.toFixed(2)}, ${posInicial.y.toFixed(2)}, ${posInicial.z.toFixed(2)})`;
  const v_str = `(${velocidade.x.toFixed(2)}, ${velocidade.y.toFixed(2)}, ${velocidade.z.toFixed(2)})`;
  const rt_str = `(${x_t.toFixed(2)}, ${y_t.toFixed(2)}, ${z_t.toFixed(2)})`;

  // Componentes da velocidade
  const vx = velocidade.x;
  const vy = velocidade.y;
  const vz = velocidade.z;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#05070D' }}>
      
      {/* Botão toggle para informações */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          background: 'rgba(0,0,0,0.7)',
          border: '1px solid rgba(0,212,255,0.4)',
          borderRadius: 8,
          padding: '6px 12px',
          color: '#00D4FF',
          fontSize: '11px',
          cursor: 'pointer',
          fontFamily: 'monospace',
          backdropFilter: 'blur(4px)'
        }}
      >
        {showInfo ? '📊 Ocultar Equações' : '📐 Mostrar Equações'}
      </button>

      {/* Painel de informações flutuante */}
      {showInfo && (
        <div style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          background: 'rgba(8, 12, 20, 0.95)',
          backdropFilter: 'blur(16px)',
          borderRadius: 20,
          border: '1px solid rgba(0, 212, 255, 0.35)',
          padding: '20px 24px',
          zIndex: 10,
          fontFamily: 'monospace',
          pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            
            {/* Forma Vetorial */}
            <div>
              <div style={{ color: '#00F5C4', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>
                📐 Forma Vetorial
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '1rem', fontWeight: 'bold', marginBottom: 8 }}>
                r(t) = r₀ + v·t
              </div>
              <div style={{ color: '#00D4FF', fontSize: '0.85rem', marginTop: 8, wordBreak: 'break-all' }}>
                r(t) = {r0_str} + {v_str} · {tempo.toFixed(2)}s
              </div>
              <div style={{ color: '#F97316', fontSize: '0.9rem', fontWeight: 'bold', marginTop: 10, background: 'rgba(249,115,22,0.1)', padding: '6px 10px', borderRadius: 8 }}>
                = {rt_str}
              </div>
            </div>

            {/* Forma Paramétrica */}
            <div>
              <div style={{ color: '#00F5C4', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>
                📏 Forma Paramétrica
              </div>
              <div style={{ color: '#FFFFFF', fontSize: '0.85rem', marginBottom: 12 }}>
                x(t) = x₀ + vₓ·t &nbsp;&nbsp;|&nbsp;&nbsp;
                y(t) = y₀ + vᵧ·t &nbsp;&nbsp;|&nbsp;&nbsp;
                z(t) = z₀ + v_z·t
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ color: '#ff8888', fontSize: '0.8rem' }}>
                  X: {posInicial.x.toFixed(2)} + {velocidade.x.toFixed(2)}·{tempo.toFixed(2)} = <strong style={{ color: '#F97316' }}>{x_t.toFixed(2)}</strong>
                </div>
                <div style={{ color: '#88ff88', fontSize: '0.8rem' }}>
                  Y: {posInicial.y.toFixed(2)} + {velocidade.y.toFixed(2)}·{tempo.toFixed(2)} = <strong style={{ color: '#F97316' }}>{y_t.toFixed(2)}</strong>
                </div>
                <div style={{ color: '#8888ff', fontSize: '0.8rem' }}>
                  Z: {posInicial.z.toFixed(2)} + {velocidade.z.toFixed(2)}·{tempo.toFixed(2)} = <strong style={{ color: '#F97316' }}>{z_t.toFixed(2)}</strong>
                </div>
              </div>
            </div>

            {/* Valores Atuais */}
            <div>
              <div style={{ color: '#00F5C4', fontSize: '0.7rem', letterSpacing: '2px', marginBottom: 12, textTransform: 'uppercase' }}>
                🎯 Posição Atual (x, y, z)
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: '1.2rem', fontWeight: 'bold', marginBottom: 12, flexWrap: 'wrap' }}>
                <span style={{ color: '#ff8888' }}>X: {currentPos.x.toFixed(2)}</span>
                <span style={{ color: '#88ff88' }}>Y: {currentPos.y.toFixed(2)}</span>
                <span style={{ color: '#8888ff' }}>Z: {currentPos.z.toFixed(2)}</span>
              </div>
              <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: 8 }}>
                Módulo |r| = {Math.hypot(currentPos.x, currentPos.y, currentPos.z).toFixed(2)} m
              </div>
              <div style={{ color: '#00D4FF', fontSize: '0.75rem', marginTop: 8 }}>
                Velocidade |v| = {Math.hypot(vx, vy, vz).toFixed(2)} m/s
              </div>
            </div>
          </div>
        </div>
      )}

      <Canvas
        camera={{ position: [10, 8, 12], fov: 55 }}
        style={{ background: '#05070D' }}
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[8, 10, 8]} intensity={1.2} />
        <pointLight position={[-5, 5, 5]} intensity={0.6} color="#4466cc" />
        <directionalLight position={[5, 12, 5]} intensity={0.9} />
        
        {/* Luz de preenchimento */}
        <hemisphereLight intensity={0.4} color="#ffffff" groundColor="#111122" />

        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          zoomSpeed={1.5}
          panSpeed={1}
          rotateSpeed={1.2}
          makeDefault
        />

        <AxesWithLabels />

        {/* Plano de referência no chão */}
        <mesh position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[16, 16]} />
          <meshStandardMaterial color="#0a0a1a" metalness={0.8} roughness={0.5} transparent opacity={0.5} />
        </mesh>

        <Particle
          velocidade={velocidade}
          posInicial={posInicial}
          tempo={tempo}
          setCurrentPos={setCurrentPos}
          cor={particleColor}
        />

        {/* Mostrador flutuante da posição */}
        {currentPos && (
          <FloatingInfo position={currentPos} color={particleColor} />
        )}
      </Canvas>
    </div>
  );
}