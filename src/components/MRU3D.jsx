import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Particle({ velocidade, posInicial, tempo }) {
  const ref = useRef();
  const [trail, setTrail] = useState([]);

  useFrame(() => {
    const x = posInicial.x + velocidade.x * tempo;
    const y = posInicial.y + velocidade.y * tempo;
    const z = posInicial.z + velocidade.z * tempo;

    ref.current.position.set(x, y, z);

    setTrail((prev) => [...prev.slice(-100), [x, y, z]]);
  });

  return (
    <>
      <mesh ref={ref}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="#00D4FF" />
      </mesh>

      {/* 🔥 RASTRO */}
      <line>
        <bufferGeometry
          attach="geometry"
          setFromPoints={trail.map(p => new THREE.Vector3(...p))}
        />
        <lineBasicMaterial color="#00F5C4" />
      </line>
    </>
  );
}

export default function MRU3D({ velocidade, posInicial, tempo }) {
  return (
    <Canvas camera={{ position: [5, 5, 5] }}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />

      <OrbitControls />

      {/* EIXOS COLORIDOS */}
      <axesHelper args={[5]} />

      <Particle velocidade={velocidade} posInicial={posInicial} tempo={tempo} />
    </Canvas>
  );
}