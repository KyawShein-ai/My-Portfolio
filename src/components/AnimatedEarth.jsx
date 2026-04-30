import { useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Earth Component
function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();
  const textureRef = useRef();

  // Create Earth texture once
  if (!textureRef.current) {
    textureRef.current = createEarthTexture();
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (earthRef.current) {
      earthRef.current.rotation.y = time * 0.15;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = time * 0.18;
    }
  });

  return (
    <group>
      {/* Earth */}
      <Sphere ref={earthRef} args={[2.2, 64, 64]}>
        <meshStandardMaterial
          map={textureRef.current}
          color="#00E5C3"
          roughness={0.6}
          metalness={0.4}
        />
      </Sphere>

      {/* Clouds layer */}
      <Sphere ref={cloudsRef} args={[2.25, 64, 64]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.4}
          roughness={1}
          metalness={0}
        />
      </Sphere>

      {/* Atmosphere glow - multiple layers */}
      <Sphere args={[2.5, 32, 32]}>
        <meshBasicMaterial
          color="#FF4D6D"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
        />
      </Sphere>
      
      <Sphere args={[2.8, 32, 32]}>
        <meshBasicMaterial
          color="#00F5D4"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Enhanced Orbital ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[3.5, 0.03, 16, 100]} />
        <meshBasicMaterial
          color="#FEE440"
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}

// Create procedural Earth texture
function createEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Ocean - brand teal
  ctx.fillStyle = '#00E5C3';
  ctx.fillRect(0, 0, 512, 512);

  // Continents (simplified) - brighter green
  ctx.fillStyle = '#22c55e';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const size = Math.random() * 80 + 40;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Floating satellites
function Satellites() {
  const satellitesRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (satellitesRef.current) {
      satellitesRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <group ref={satellitesRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 2) * 4,
            Math.sin((i * Math.PI) / 2) * 1,
            Math.sin((i * Math.PI) / 2) * 4,
          ]}
        >
          <boxGeometry args={[0.12, 0.12, 0.35]} />
          <meshStandardMaterial
            color="#fcd34d"
            emissive="#fcd34d"
            emissiveIntensity={0.8}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// Main Earth Scene
export default function AnimatedEarth() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 65 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, pixelRatio: window.devicePixelRatio }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 3, 5]} intensity={2} castShadow />
        <pointLight position={[-5, -3, -5]} intensity={0.8} color="#60a5fa" />
        <pointLight position={[3, 3, 3]} intensity={0.6} color="#8b5cf6" />
        
        {/* 3D Objects */}
        <Earth />
        <Satellites />
        <Stars radius={30} depth={30} count={800} factor={2} saturation={0} fade speed={1} />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  );
}
