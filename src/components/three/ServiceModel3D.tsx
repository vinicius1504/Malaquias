'use client';

import { useRef, memo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

interface ServiceModelProps {
  modelPath: string;
}

// Componente do modelo 3D dinâmico
const ServiceModel = memo(function ServiceModel({ modelPath }: ServiceModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Rotação suave automática no eixo Y
    groupRef.current.rotation.y += 0.002;
    // Movimento flutuante sutil
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
  });

  return (
    <group ref={groupRef}>
      <Center>
        {/* Rotação de -90 graus no eixo X para deixar o modelo de pé */}
        <primitive
          object={scene}
          scale={90}
          position={[0, 1, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Center>
    </group>
  );
});

// Fallback enquanto carrega
function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#D8B87D" wireframe />
    </mesh>
  );
}

// Componente principal
const ServiceModel3D = memo(function ServiceModel3D({ modelPath }: ServiceModelProps) {
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

        {/* Modelo com Suspense para loading */}
        <Suspense fallback={<ModelFallback />}>
          <ServiceModel modelPath={modelPath} />
        </Suspense>

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

export default ServiceModel3D;
