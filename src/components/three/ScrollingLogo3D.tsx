'use client';

import { useRef, memo, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import * as THREE from 'three';

interface LogoModelProps {
  scrollProgress: MotionValue<number>;
}

// Componente do modelo 3D memoizado
const LogoModel = memo(function LogoModel({ scrollProgress }: LogoModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/images/logos/logo_3d2.glb');

  // Rotações alvo pré-calculadas
  const rotationTargets = useMemo(() => ({
    hero: { x: 0.3, y: 2.9, z: 0 },
    porque: { x: 0.3, y: 0.3, z: 0 },
    faq: { x: 0.3, y: 2.9, z: 0 },
    footer: { x: 0.3, y: 0, z: 0 },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const scroll = scrollProgress.get();
    let targetRotation = { x: 0, y: 0, z: 0 };

    if (scroll < 0.12) {
      targetRotation = rotationTargets.hero;
    } else if (scroll < 0.20) {
      const t = (scroll - 0.12) / 0.08;
      targetRotation = { x: 0.5, y: t * Math.PI * 2, z: 0 };
    } else if (scroll < 0.38) {
      targetRotation = rotationTargets.porque;
    } else if (scroll < 0.82) {
      const progress = (scroll - 0.38) / 0.44;
      targetRotation = { x: 0.5, y: progress * Math.PI * 4, z: 0 };
    } else if (scroll < 0.92) {
      targetRotation = rotationTargets.faq;
    } else {
      const t = (scroll - 0.92) / 0.08;
      targetRotation = {
        x: THREE.MathUtils.lerp(rotationTargets.faq.x, rotationTargets.footer.x, t),
        y: THREE.MathUtils.lerp(rotationTargets.faq.y, rotationTargets.footer.y, t),
        z: 0,
      };
    }

    // Interpolação suave
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x, 0.08);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.y, 0.08);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.z, 0.08);

    // Movimento flutuante sutil
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <group ref={meshRef}>
      <primitive object={scene} scale={20} position={[0, 0, 0]} />
    </group>
  );
});

// Componente principal memoizado
const ScrollingLogo3D = memo(function ScrollingLogo3D() {
  const { scrollYProgress } = useScroll();

  // Transforms memoizados
  const x = useTransform(
    scrollYProgress,
    [0, 0.12, 0.18, 0.38, 0.42, 0.75, 0.80, 0.92, 0.95, 1],
    ['70%', '62%', '28%', '28%', '50%', '50%', '72%', '72%', '50%', '40%']
  );

  const y = useTransform(
    scrollYProgress,
    [0, 0.12, 0.18, 0.38, 0.75, 0.82, 0.92, 1],
    ['75%', '60%', '110%', '65%', '55%', '55%', '80%', '90%']
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.12, 0.38, 0.75, 0.92, 1],
    [1, 1, 1, 0.9, 0.9, 1.2]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.92, 1],
    [1, 1, 0.4]
  );

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9 }}
    >
      <motion.div
        className="absolute w-[1100px] h-[1100px]"
        style={{
          left: x,
          top: y,
          scale,
          opacity,
          translateX: '-50%',
          translateY: '-50%',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 15], fov: 20 }}
          gl={{
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
          }}
          dpr={[1, 1.5]}
          frameloop="always"
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight position={[0, 2, 10]} intensity={1.5} color="#D8B87D" />
          <directionalLight position={[5, 1, 8]} intensity={1.2} color="#D8B87D" />
          <directionalLight position={[-5, 1, 8]} intensity={1.2} color="#D8B87D" />
          <directionalLight position={[0, 5, 5]} intensity={0.8} color="#C9983A" />
          <LogoModel scrollProgress={scrollYProgress} />
        </Canvas>
      </motion.div>
    </motion.div>
  );
});

// Pre-load do modelo
useGLTF.preload('/images/logos/logo_3d2.glb');

export default ScrollingLogo3D;
