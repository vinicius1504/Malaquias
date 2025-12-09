'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import * as THREE from 'three';

interface LogoModelProps {
  scrollProgress: MotionValue<number>;
}

function LogoModel({ scrollProgress }: LogoModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/images/logos/logo_3d2.glb');

  // Rotacoes alvo para cada secao (em radianos)
  const rotationTargets = {
    hero: { x: 0.3, y: -0.5, z: 0.15 },         // Diagonal apontando para texto esquerdo
    porque: { x: 0.2, y: 0.5, z: -0.1 },        // Apontando para direita (texto)
    middle: { x: 0, y: 0, z: 0 },               // Centro neutro
    faq: { x: 0.2, y: -0.5, z: 0.1 },           // Apontando para esquerda (texto)
    footer: { x: 0.4, y: 0, z: 0 },             // Ligeiramente inclinado
  };

  useFrame((state) => {
    if (!meshRef.current) return;

    const scroll = scrollProgress.get();
    let targetRotation = { x: 0, y: 0, z: 0 };

    if (scroll < 0.12) {
      // Hero - parada na posicao inicial
      targetRotation = rotationTargets.hero;
    } else if (scroll < 0.20) {
      // Transicao Hero -> Por que (rotaciona durante)
      const t = (scroll - 0.12) / 0.08;
      const spinY = t * Math.PI * 2; // Uma volta completa
      targetRotation = {
        x: THREE.MathUtils.lerp(rotationTargets.hero.x, rotationTargets.porque.x, t),
        y: rotationTargets.hero.y + spinY,
        z: THREE.MathUtils.lerp(rotationTargets.hero.z, rotationTargets.porque.z, t),
      };
    } else if (scroll < 0.38) {
      // Parado na secao "Por que"
      targetRotation = rotationTargets.porque;
    } else if (scroll < 0.75) {
      // Secoes intermediarias - rotacao continua baseada no scroll
      const progress = (scroll - 0.38) / 0.37;
      const spinY = progress * Math.PI * 4; // Varias voltas
      targetRotation = {
        x: rotationTargets.middle.x + Math.sin(spinY * 0.5) * 0.15,
        y: spinY,
        z: rotationTargets.middle.z,
      };
    } else if (scroll < 0.82) {
      // Transicao para FAQ
      const t = (scroll - 0.75) / 0.07;
      const baseY = ((scroll - 0.38) / 0.37) * Math.PI * 4;
      targetRotation = {
        x: THREE.MathUtils.lerp(rotationTargets.middle.x, rotationTargets.faq.x, t),
        y: THREE.MathUtils.lerp(baseY % (Math.PI * 2), rotationTargets.faq.y, t),
        z: THREE.MathUtils.lerp(rotationTargets.middle.z, rotationTargets.faq.z, t),
      };
    } else if (scroll < 0.92) {
      // Parado no FAQ
      targetRotation = rotationTargets.faq;
    } else {
      // Footer - transicao para marca d'agua
      const t = (scroll - 0.92) / 0.08;
      targetRotation = {
        x: THREE.MathUtils.lerp(rotationTargets.faq.x, rotationTargets.footer.x, t),
        y: THREE.MathUtils.lerp(rotationTargets.faq.y, rotationTargets.footer.y, t),
        z: THREE.MathUtils.lerp(rotationTargets.faq.z, rotationTargets.footer.z, t),
      };
    }

    // Interpolacao suave
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, targetRotation.x, 0.08);
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetRotation.y, 0.08);
    meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, targetRotation.z, 0.08);

    // Leve movimento flutuante sempre ativo
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
  });

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        scale={35}
        position={[0, 0, 0]}
      />
    </group>
  );
}

export default function ScrollingLogo3D() {
  const { scrollYProgress } = useScroll();

  // Mapeamento de scroll para posicao X (em %)
  const x = useTransform(
    scrollYProgress,
    [0, 0.12, 0.18, 0.38, 0.42, 0.75, 0.80, 0.92, 0.95, 1], //ajuste de acordo com a visibilidade
    ['70%', '62%', '28%', '28%', '50%', '50%', '72%', '72%', '50%', '40%'] //AJUSTE DE POSIÇÃO PROS LADOS
  );

  // Mapeamento de scroll para posicao Y (em %)
  // Ajustado para ficar mais baixo e visível
  const y = useTransform(
    scrollYProgress,
    [0, 0.12, 0.18, 0.38, 0.75, 0.82, 0.92, 1],
    ['75%', '60%', '110%', '65%', '55%', '55%', '80%', '75%']
  );

  // Mapeamento de scroll para escala
  const scale = useTransform(
    scrollYProgress,
    [0, 0.12, 0.38, 0.75, 0.92, 1],
    [1, 1, 1, 0.9, 0.9, 1.5]
  );

  // Mapeamento de scroll para opacidade
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.92, 1],
    [1, 1, 0.3]
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
          gl={{ antialias: true, alpha: true }}
          style={{ background: 'transparent' }}
        >
          {/* Iluminacao ambiente */}
          <ambientLight intensity={0.4} />

          {/* Luz frontal central */}
          <directionalLight
            position={[0, 2, 10]}
            intensity={1.5}
            color="#D8B87D"
          />

          {/* Luz frontal direita */}
          <directionalLight
            position={[5, 1, 8]}
            intensity={1.2}
            color="#D8B87D"
          />

          {/* Luz frontal esquerda */}
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

          {/* Modelo 3D */}
          <LogoModel scrollProgress={scrollYProgress} />
        </Canvas>
      </motion.div>
    </motion.div>
  );
}

// Pre-load do modelo
useGLTF.preload('/images/logos/logo_3d2.glb');
