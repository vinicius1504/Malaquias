'use client';

import { useRef, memo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center } from '@react-three/drei';
import * as THREE from 'three';

// Componente do modelo 3D da recepção
const ReceptionModel = memo(function ReceptionModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/models/model_recepcao.glb');

  // Habilitar sombras em todos os meshes do modelo
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

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
        <primitive object={scene} scale={45} position={[0, 2, 0]} />
      </Center>
    </group>
  );
});

// Componente principal
const ReceptionModel3D = memo(function ReceptionModel3D() {
  return (
    <div className="w-full h-full min-h-[400px]">
      <Canvas
        shadows
        camera={{ position: [5, 3, 5], fov: 25 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        {/* Iluminação ambiente */}
        <ambientLight intensity={0.3} />

        {/* Luz principal de cima iluminando a mesa - com sombra */}
        <directionalLight
          position={[0, 8, 0]}
          intensity={1.2}
          color="#ffffff"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={20}
          shadow-camera-near={0.5}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* Luz frontal iluminando a logo da empresa */}
        <spotLight
          position={[-4, 3, 4]}
          intensity={2}
          color="#D8B87D"
          angle={0.5}
          penumbra={0.5}
          castShadow
        />

        {/* Luz de preenchimento lateral */}
        <directionalLight position={[5, 3, 5]} intensity={0.6} color="#ffffff" />

        {/* Luz de contorno traseira */}
        <directionalLight position={[0, 2, -5]} intensity={0.4} color="#C9983A" />

        {/* Luz pontual dourada para realçar detalhes */}
        <pointLight position={[-2, 1, 2]} intensity={0.8} color="#D8B87D" />

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
useGLTF.preload('/models/model_recepcao.glb');

export default ReceptionModel3D;
