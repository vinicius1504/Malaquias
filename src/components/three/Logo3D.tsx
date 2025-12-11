'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Fallback animado enquanto o modelo carrega
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 0.3]} />
      <meshStandardMaterial color="#D8B87D" wireframe />
    </mesh>
  );
}

function LogoModel({ isReturning, onLoaded }: { isReturning: boolean; onLoaded: () => void }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/images/logos/logo_3d2.glb');

  useEffect(() => {
    if (scene) {
      onLoaded();
    }
  }, [scene, onLoaded]);

  useFrame((state) => {
    if (meshRef.current) {
      if (!isReturning) {
        // Rotação automática lenta
        meshRef.current.rotation.y += 0.001;
      }
      // Leve movimento flutuante
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        scale={55}
        position={[0, -3, 0]}
      />
    </group>
  );
}

// Componente para controle de arrasto manual
function DragControls({
  onDragStart,
  onDragEnd
}: {
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const { gl, camera, scene } = useThree();
  const isDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const logoGroup = useRef<THREE.Group | null>(null);

  useEffect(() => {
    // Encontra o grupo da logo
    scene.traverse((obj) => {
      if (obj.type === 'Group' && obj.children.length > 0) {
        logoGroup.current = obj as THREE.Group;
      }
    });

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
      onDragStart();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !logoGroup.current) return;

      const deltaX = e.clientX - previousMouse.current.x;

      // Rotaciona o modelo apenas no eixo Y (horizontal)
      logoGroup.current.rotation.y += deltaX * 0.005;

      previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        onDragEnd();
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [gl, camera, scene, onDragStart, onDragEnd]);

  return null;
}

export default function Logo3D() {
  const [isReturning, setIsReturning] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleDragStart = () => {
    setIsReturning(false);
  };

  const handleDragEnd = () => {
    setIsReturning(true);
    // Para de retornar após a animação completar
    setTimeout(() => setIsReturning(false), 3000);
  };

  const handleLoaded = () => {
    setIsLoaded(true);
  };

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Iluminação ambiente mais forte para base uniforme */}
        <ambientLight intensity={0.4} />

        {/* Luz frontal central - ilumina ambas diagonais */}
        <directionalLight
          position={[0, 2, 10]}
          intensity={1.5}
          color="#D8B87D"
        />

        {/* Luz frontal direita - ilumina diagonal direita */}
        <directionalLight
          position={[5, 1, 8]}
          intensity={1.2}
          color="#D8B87D"
        />

        {/* Luz frontal esquerda - ilumina diagonal esquerda */}
        <directionalLight
          position={[-5, 1, 8]}
          intensity={1.2}
          color="#D8B87D"
        />

        {/* Luz de preenchimento superior */}
        <directionalLight
          position={[0, 5, 5]}
          intensity={0.8}
          color="#C9983A"
        />

        {/* Luz de contorno traseira */}
        <directionalLight
          position={[0, -2, -5]}
          intensity={0.3}
          color="#9C7A4A"
        />

        {/* Fallback enquanto carrega */}
        <Suspense fallback={<LoadingFallback />}>
          {/* Modelo 3D */}
          <LogoModel isReturning={isReturning} onLoaded={handleLoaded} />
        </Suspense>

        {/* Controles de arrasto - só ativa depois de carregado */}
        {isLoaded && <DragControls onDragStart={handleDragStart} onDragEnd={handleDragEnd} />}
      </Canvas>
    </div>
  );
}

// Pre-load do modelo
useGLTF.preload('/images/logos/logo_3d2.glb');
