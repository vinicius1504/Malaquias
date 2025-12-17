'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// URL do modelo 3D - usa Supabase Storage em produção para reduzir tamanho do deploy
const MODEL_URL = process.env.NEXT_PUBLIC_3D_MODEL_URL || '/images/models/excritorio2.glb';

function OfficeModel({ isReturning }: { isReturning: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  useFrame((state) => {
    if (meshRef.current) {
      if (!isReturning) {
        // Rotação automática lenta
        meshRef.current.rotation.y += 0.001;
      }
      // Leve movimento flutuante
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        scale={0.7}
        position={[0, -2, 0]}
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
  const officeGroup = useRef<THREE.Group | null>(null);

  useEffect(() => {
    // Encontra o grupo do modelo
    scene.traverse((obj) => {
      if (obj.type === 'Group' && obj.children.length > 0) {
        officeGroup.current = obj as THREE.Group;
      }
    });

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMouse.current = { x: e.clientX, y: e.clientY };
      onDragStart();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !officeGroup.current) return;

      const deltaX = e.clientX - previousMouse.current.x;

      // Rotaciona o modelo apenas no eixo Y (horizontal)
      officeGroup.current.rotation.y += deltaX * 0.005;

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

export default function Office3D() {
  const [isReturning, setIsReturning] = useState(false);

  const handleDragStart = () => {
    setIsReturning(false);
  };

  const handleDragEnd = () => {
    setIsReturning(true);
    setTimeout(() => setIsReturning(false), 3000);
  };

  return (
    <div className="w-full h-full cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: '#f5f5f5' }}
      >
        {/* Iluminação ambiente */}
        <ambientLight intensity={0.5} />

        {/* Luz principal frontal */}
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.2}
          color="#ffffff"
          castShadow
        />

        {/* Luz de preenchimento esquerda */}
        <directionalLight
          position={[-5, 3, 5]}
          intensity={0.8}
          color="#f0f0f0"
        />

        {/* Luz de cima */}
        <directionalLight
          position={[0, 10, 0]}
          intensity={0.6}
          color="#ffffff"
        />

        {/* Luz de contorno traseira */}
        <directionalLight
          position={[0, 2, -5]}
          intensity={0.4}
          color="#e0e0e0"
        />

        {/* Modelo 3D do escritório */}
        <OfficeModel isReturning={isReturning} />

        {/* Controles de arrasto */}
        <DragControls onDragStart={handleDragStart} onDragEnd={handleDragEnd} />
      </Canvas>
    </div>
  );
}

// Pre-load do modelo
useGLTF.preload(MODEL_URL);
