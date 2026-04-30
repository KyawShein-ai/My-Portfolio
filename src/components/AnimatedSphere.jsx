import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial, Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Animated 3D Sphere Component
function AnimatedShape() {
  const meshRef = useRef();
  const sphereRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the mesh
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
    
    // Animate sphere
    if (sphereRef.current) {
      sphereRef.current.rotation.x = time * 0.1;
      sphereRef.current.rotation.z = time * 0.15;
    }
  });

  return (
    <group ref={meshRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sphere ref={sphereRef} args={[1.5, 64, 64]} scale={1.2}>
          <MeshDistortMaterial
            color="#00F5D4"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Inner glowing sphere */}
      <Sphere args={[1.2, 32, 32]} scale={1.2}>
        <meshStandardMaterial
          color="#FF4D6D"
          emissive="#FF4D6D"
          emissiveIntensity={0.45}
          transparent
          opacity={0.25}
        />
      </Sphere>

      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.1, 16, 100]} />
        <meshStandardMaterial
          color="#FEE440"
          emissive="#FEE440"
          emissiveIntensity={0.4}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

// Floating particles
function Particles({ count = 100 }) {
  const points = useRef();

  const particlesPosition = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const distance = Math.random() * 5 + 3;
    const theta = THREE.MathUtils.randFloatSpread(360);
    const phi = THREE.MathUtils.randFloatSpread(360);

    particlesPosition.set([
      distance * Math.sin(theta) * Math.cos(phi),
      distance * Math.sin(theta) * Math.sin(phi),
      distance * Math.cos(theta),
    ], i * 3);
  }

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (points.current) {
      points.current.rotation.y = time * 0.05;
      points.current.rotation.x = time * 0.03;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesPosition.length / 3}
          array={particlesPosition}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#60a5fa"
        sizeAttenuation
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Main 3D Scene Component
export default function AnimatedSphere() {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#8b5cf6" />
        <pointLight position={[10, -10, 5]} intensity={0.5} color="#60a5fa" />
        
        {/* 3D Objects */}
        <AnimatedShape />
        <Particles count={50} />
        <Stars radius={30} depth={30} count={500} factor={2} saturation={0} fade speed={1} />
        
        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
