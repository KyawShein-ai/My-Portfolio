import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Skill Icon Component
function SkillIcon({ position, icon, color, label, orbitRadius, orbitSpeed, orbitAngle }) {
  const iconRef = useRef();
  const orbitRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Orbit around center
    if (orbitRef.current) {
      const angle = time * orbitSpeed + orbitAngle;
      orbitRef.current.position.x = Math.cos(angle) * orbitRadius;
      orbitRef.current.position.z = Math.sin(angle) * orbitRadius;
    }
    
    // Rotate icon to face camera
    if (iconRef.current) {
      iconRef.current.rotation.y = time * 0.5;
    }
  });

  return (
    <group ref={orbitRef} position={position}>
      <group ref={iconRef}>
        {/* Icon Label - Clean without background */}
        <Html
          position={[0, 0, 0]}
          center
          distanceFactor={6}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="text-5xl filter drop-shadow-lg">
              {icon}
            </div>
            <div 
              className="text-sm font-bold px-2 py-1 rounded"
              style={{ 
                color: color,
                textShadow: `0 0 10px ${color}, 0 0 20px ${color}`,
                backgroundColor: 'rgba(0,0,0,0.5)'
              }}
            >
              {label}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}

// Orbit Ring Component
function OrbitRing({ radius, color }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

// Center Profile Component
function CenterProfile({ imageUrl }) {
  const profileRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (profileRef.current) {
      profileRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
    }
  });

  return (
    <group ref={profileRef}>
      {/* Profile Image Container - Larger */}
      <Html
        position={[0, 0, 0]}
        center
        distanceFactor={4}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="relative">
          {/* Glowing border rings */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-rose-500 to-gold-500 blur-2xl opacity-60 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-spin" style={{ animationDuration: '3s' }}></div>
          
          {/* Profile Image - Much Larger */}
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
            <img 
              src={imageUrl || '/api/placeholder/256/256'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </Html>
      
      {/* Center glow sphere */}
      <mesh>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
}

// Main Orbiting Skills Scene
export default function OrbitingSkills({ profileImage }) {
  const skills = [
    { icon: '🔷', label: 'HTML', color: '#ff6b6b', orbitRadius: 4, orbitSpeed: 0.5, orbitAngle: 0 },
    { icon: '🎨', label: 'CSS', color: '#4ecdc4', orbitRadius: 4, orbitSpeed: 0.5, orbitAngle: Math.PI / 4 },
    { icon: '☕', label: 'Java', color: '#ffe66d', orbitRadius: 4.5, orbitSpeed: 0.4, orbitAngle: Math.PI / 2 },
    { icon: '⚡', label: 'JavaScript', color: '#ffd93d', orbitRadius: 4.5, orbitSpeed: 0.4, orbitAngle: (3 * Math.PI) / 4 },
    { icon: '🐘', label: 'PHP', color: '#a78bfa', orbitRadius: 5, orbitSpeed: 0.3, orbitAngle: Math.PI },
    { icon: '#️⃣', label: 'C#', color: '#c084fc', orbitRadius: 5, orbitSpeed: 0.3, orbitAngle: (5 * Math.PI) / 4 },
    { icon: '🤖', label: 'Android', color: '#4ade80', orbitRadius: 5.5, orbitSpeed: 0.25, orbitAngle: (3 * Math.PI) / 2 },
    { icon: '⚛️', label: 'React', color: '#38bdf8', orbitRadius: 5.5, orbitSpeed: 0.25, orbitAngle: (7 * Math.PI) / 4 },
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, pixelRatio: window.devicePixelRatio }}
        dpr={[1, 2]}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#10b981" />
        <pointLight position={[5, 5, 5]} intensity={0.5} color="#f43f5e" />

        {/* Center Profile */}
        <CenterProfile imageUrl={profileImage} />

        {/* Orbit Rings */}
        <OrbitRing radius={4} color="#10b981" />
        <OrbitRing radius={4.5} color="#34d399" />
        <OrbitRing radius={5} color="#f43f5e" />
        <OrbitRing radius={5.5} color="#f59e0b" />

        {/* Orbiting Skills */}
        {skills.map((skill, index) => (
          <SkillIcon
            key={index}
            position={[0, 0, 0]}
            icon={skill.icon}
            color={skill.color}
            label={skill.label}
            orbitRadius={skill.orbitRadius}
            orbitSpeed={skill.orbitSpeed}
            orbitAngle={skill.orbitAngle}
          />
        ))}

        {/* Stars Background */}
        <Stars radius={30} depth={30} count={800} factor={2} saturation={0} fade speed={1} />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          autoRotate={false}
          minDistance={8}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
