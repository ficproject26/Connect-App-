import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

function GlobeMesh({ scrollProgress }) {
  const globeRef = useRef();
  const dotsRef = useRef();

  useFrame((state) => {
    // Constant slow spin
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.0015;
      globeRef.current.rotation.y += scrollProgress * 0.015;
    }
    if (dotsRef.current) {
      dotsRef.current.rotation.y -= 0.0006;
      dotsRef.current.rotation.x = scrollProgress * 0.15;
    }

    // Dynamic camera depth zoom
    // camera.position.z moves between 4.5 (far) to 2.2 (near)
    const targetZ = 4.5 - (scrollProgress * 2.3);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);
  });

  return (
    <group ref={globeRef}>
      {/* Outer Grid Aura */}
      <mesh>
        <sphereGeometry args={[1.8, 24, 24]} />
        <meshBasicMaterial 
          color="#FFC107" 
          wireframe 
          transparent 
          opacity={0.04} 
        />
      </mesh>

      {/* Main Wireframe Globe */}
      <mesh>
        <sphereGeometry args={[1.55, 32, 32]} />
        <meshBasicMaterial 
          color="#FFC107" 
          wireframe 
          transparent 
          opacity={0.1} 
        />
      </mesh>

      {/* Dotted Network Nodes */}
      <points ref={dotsRef}>
        <sphereGeometry args={[1.57, 48, 48]} />
        <pointsMaterial 
          color="#FFD54F" 
          size={0.02} 
          transparent 
          opacity={0.5} 
        />
      </points>

      {/* Glowing Inner Core */}
      <mesh>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshBasicMaterial 
          color="#FFC107" 
          transparent 
          opacity={0.025} 
        />
      </mesh>
    </group>
  );
}

function StarsBackground() {
  const starsRef = useRef();

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
      starsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars radius={100} depth={50} count={2500} factor={4} saturation={0.5} fade speed={1} />
    </group>
  );
}

export default function Globe3D({ scrollProgress }) {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#FFD54F" />
        <pointLight position={[-10, -10, -10]} intensity={0.8} color="#0B1220" />
        
        <GlobeMesh scrollProgress={scrollProgress} />
        <StarsBackground />
      </Canvas>
    </div>
  );
}
