'use client';

import { useRef, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

// Componente do modelo 3D da recepção
const ReceptionModel = memo(function ReceptionModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/model_recepcao2.glb');


  useFrame((state) => {
    if (!groupRef.current) return;
    // Rotação suave automática
    groupRef.current.rotation.y += 0.002;
    // Movimento flutuante sutil
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Center>
        <primitive object={scene} scale={45} position={[0, 3, 0]} />
      </Center>
    </group>
  );
});

// Componente principal
const ReceptionModel3D = memo(function ReceptionModel3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        camera={{ position: [5, 3, 5], fov: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        {/* Luz ambiente para iluminação base */}
        <ambientLight intensity={0.4} />

        {/* Luz frontal fixa - acompanha a câmera */}
        <directionalLight position={[5, 3, 5]} intensity={1.2} color="#ffffff" />

        {/* Luz frontal secundária */}
        <directionalLight position={[-5, 3, 5]} intensity={0.8} color="#ffffff" />

        {/* Modelo */}
        <ReceptionModel />

        {/* Controles de órbita para interatividade - rotação livre */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minPolarAngle={0}
          maxPolarAngle={Math.PI}
          autoRotate={false}
        />
      </Canvas>
    </div>
  );
});

// Pre-load do modelo
useGLTF.preload('/models/model_recepcao2.glb');

export default ReceptionModel3D;
