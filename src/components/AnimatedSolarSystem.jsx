import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';

// Sun Component
function Sun() {
  const sunRef = useRef();
  const glowRef1 = useRef();
  const glowRef2 = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (sunRef.current) {
      sunRef.current.rotation.y = time * 0.1;
    }
    if (glowRef1.current) {
      glowRef1.current.scale.setScalar(1 + Math.sin(time * 2) * 0.05);
    }
    if (glowRef2.current) {
      glowRef2.current.scale.setScalar(1 + Math.cos(time * 1.5) * 0.08);
    }
  });

  return (
    <group>
      <Sphere ref={sunRef} args={[1.2, 64, 64]}>
        <meshBasicMaterial
          color="#fcd34d"
        />
      </Sphere>
      
      {/* Animated Sun glow layers */}
      <Sphere ref={glowRef1} args={[1.5, 32, 32]}>
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.6}
        />
      </Sphere>
      
      <Sphere ref={glowRef2} args={[1.8, 32, 32]}>
        <meshBasicMaterial
          color="#fb923c"
          transparent
          opacity={0.3}
        />
      </Sphere>
      
      {/* Outermost glow */}
      <Sphere args={[2.2, 32, 32]}>
        <meshBasicMaterial
          color="#fbbf24"
          transparent
          opacity={0.1}
        />
      </Sphere>

      {/* Enhanced point lights from sun */}
      <pointLight position={[0, 0, 0]} intensity={4} color="#fcd34d" distance={60} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#fb923c" distance={40} />
    </group>
  );
}

// Planet Component
function Planet({ distance, size, color, speed, orbitSpeed, name, onEarthClick, isClickable }) {
  const planetRef = useRef();
  const orbitRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Orbit around sun
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * orbitSpeed;
    }
    
    // Rotate planet
    if (planetRef.current) {
      planetRef.current.rotation.y = time * speed;
    }
  });

  return (
    <group ref={orbitRef}>
      <group position={[distance, 0, 0]}>
        <Sphere 
          ref={planetRef} 
          args={[size, 64, 64]}
          onClick={isClickable ? onEarthClick : undefined}
          onPointerOver={isClickable ? () => setHovered(true) : undefined}
          onPointerOut={isClickable ? () => setHovered(false) : undefined}
          scale={hovered ? 1.3 : 1}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered ? 0.8 : 0.4}
            metalness={0.6}
            roughness={0.5}
          />
        </Sphere>
        
        {/* Planet Label */}
        <Html
          position={[0, size + 0.3, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-400/50 shadow-lg shadow-blue-500/30">
            <p className="text-white text-xs font-semibold whitespace-nowrap">
              {name}
              {isClickable && <span className="ml-1 text-blue-300 animate-pulse">(Click)</span>}
            </p>
          </div>
        </Html>
      </group>
      
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[distance, 0.005, 16, 100]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

// Saturn with rings
function Saturn() {
  const saturnRef = useRef();
  const orbitRef = useRef();
  const distance = 6;
  const size = 0.4;

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time * 0.15;
    }
    
    if (saturnRef.current) {
      saturnRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <group ref={orbitRef}>
      <group position={[distance, 0, 0]}>
        <Sphere ref={saturnRef} args={[size, 64, 64]}>
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.5}
          />
        </Sphere>
        
        {/* Saturn rings */}
        <mesh rotation={[Math.PI / 2.5, 0, 0]}>
          <torusGeometry args={[size * 1.5, 0.06, 16, 100]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#eab308"
            emissiveIntensity={0.4}
            metalness={0.7}
            roughness={0.3}
            transparent
            opacity={0.85}
          />
        </mesh>
        
        {/* Saturn Label */}
        <Html
          position={[0, size + 0.5, 0]}
          center
          distanceFactor={10}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-blue-400/50 shadow-lg shadow-blue-500/30">
            <p className="text-white text-xs font-semibold whitespace-nowrap">Saturn</p>
          </div>
        </Html>
      </group>
      
      {/* Orbit ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[distance, 0.005, 16, 100]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

// Asteroid Belt
function AsteroidBelt() {
  const beltRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (beltRef.current) {
      beltRef.current.rotation.y = time * 0.1;
    }
  });

  const asteroids = [];
  for (let i = 0; i < 200; i++) {
    const angle = (i / 200) * Math.PI * 2;
    const radius = 4.5 + Math.random() * 0.5;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    asteroids.push([x, (Math.random() - 0.5) * 0.3, z]);
  }

  return (
    <group ref={beltRef}>
      {asteroids.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.015 + Math.random() * 0.025, 8, 8]} />
          <meshStandardMaterial 
            color="#94a3b8" 
            emissive="#64748b"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Black Hole Component
function BlackHole({ position }) {
  const blackHoleRef = useRef();
  const accretionDiskRef = useRef();
  const eventHorizonRef = useRef();
  const particlesRef = useRef();

  // Create swirling particles around black hole
  const particleCount = 150;
  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.8 + Math.random() * 0.6;
    particles.push({
      angle,
      radius,
      speed: 0.5 + Math.random() * 0.5,
      height: (Math.random() - 0.5) * 0.2
    });
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate black hole core
    if (blackHoleRef.current) {
      blackHoleRef.current.rotation.y = time * 0.5;
    }
    
    // Rotate accretion disk
    if (accretionDiskRef.current) {
      accretionDiskRef.current.rotation.z = time * 0.8;
    }
    
    // Pulse event horizon
    if (eventHorizonRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.05;
      eventHorizonRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Event Horizon (pure black) */}
      <Sphere ref={eventHorizonRef} args={[0.3, 32, 32]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[0.35, 32, 32]}>
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.6}
        />
      </Sphere>

      {/* Outer glow */}
      <Sphere args={[0.45, 32, 32]}>
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.3}
        />
      </Sphere>

      {/* Gravitational lensing effect */}
      <Sphere args={[0.6, 32, 32]}>
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Accretion Disk */}
      <group ref={accretionDiskRef}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.7, 0.15, 16, 64]} />
          <meshStandardMaterial
            color="#f59e0b"
            emissive="#f59e0b"
            emissiveIntensity={0.8}
            transparent
            opacity={0.7}
          />
        </mesh>
        
        {/* Inner disk ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.1, 16, 64]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1}
            transparent
            opacity={0.8}
          />
        </mesh>
        
        {/* Outer disk ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.95, 0.08, 16, 64]} />
          <meshStandardMaterial
            color="#eab308"
            emissive="#eab308"
            emissiveIntensity={0.6}
            transparent
            opacity={0.5}
          />
        </mesh>
      </group>

      {/* Hawking Radiation particles */}
      <group ref={particlesRef}>
        {particles.map((p, i) => {
          const x = Math.cos(p.angle) * p.radius;
          const z = Math.sin(p.angle) * p.radius;
          return (
            <mesh key={i} position={[x, p.height, z]}>
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial
                color={i % 3 === 0 ? "#a78bfa" : i % 2 === 0 ? "#fbbf24" : "#ef4444"}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
      </group>

      {/* Point lights for dramatic effect */}
      <pointLight position={[0, 0, 0]} intensity={1} color="#7c3aed" distance={3} />
      <pointLight position={[0.5, 0, 0]} intensity={0.8} color="#f59e0b" distance={2} />

      {/* Black Hole Label */}
      <Html
        position={[0, 0.8, 0]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="bg-gradient-to-r from-purple-900/90 to-black/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/50 shadow-lg shadow-purple-500/50">
          <p className="text-white text-xs font-semibold whitespace-nowrap">Black Hole</p>
        </div>
      </Html>
    </group>
  );
}

// Main Solar System Scene
export default function AnimatedSolarSystem({ onEarthClick }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, pixelRatio: window.devicePixelRatio }}
        dpr={[1, 2]}
      >
        {/* Enhanced Lighting */}
        <ambientLight intensity={0.2} />
        
        {/* Sun */}
        <Sun />
        
        {/* Planets with distinct brand colors */}
        <Planet distance={2} size={0.15} color="#9ca3af" speed={0.8} orbitSpeed={0.8} name="Mercury" />
        <Planet distance={2.5} size={0.2} color="#FEE440" speed={0.6} orbitSpeed={0.6} name="Venus" />
        <Planet 
          distance={3} 
          size={0.25} 
          color="#00E5C3" 
          speed={0.5} 
          orbitSpeed={0.5} 
          name="Earth" 
          onEarthClick={onEarthClick}
          isClickable={true}
        />
        <Planet distance={3.5} size={0.18} color="#FF4D6D" speed={0.4} orbitSpeed={0.4} name="Mars" />
        
        {/* Asteroid Belt */}
        <AsteroidBelt />
        
        <Planet distance={5} size={0.45} color="#f59e0b" speed={0.25} orbitSpeed={0.25} name="Jupiter" />
        <Saturn />
        <Planet distance={7} size={0.35} color="#60a5fa" speed={0.15} orbitSpeed={0.15} name="Uranus" />
        <Planet distance={8} size={0.35} color="#6366f1" speed={0.1} orbitSpeed={0.1} name="Neptune" />
        
        {/* Black Holes - positioned outside the solar system */}
        <BlackHole position={[-10, 2, -8]} />
        <BlackHole position={[12, -3, 10]} />
        
        {/* Stars */}
        <Stars radius={30} depth={30} count={1000} factor={2} saturation={0} fade speed={1} />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
}
