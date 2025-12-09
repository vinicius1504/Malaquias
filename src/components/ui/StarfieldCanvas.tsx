'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  baseOpacity: number;
  layer: number;
  color: 'light' | 'dark'; // Cor fixa da estrela
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  dx: number;
  dy: number;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarRef = useRef<ShootingStar | null>(null);
  const animationRef = useRef<number>(0);
  const shootingStarTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const layerCount = 3;
    const speeds = [0.05, 0.1, 0.2];
    const baseStarCount = 50;

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      createStars();
    };

    // Create stars
    const createStars = () => {
      starsRef.current = [];
      const scalingFactor = Math.max(canvas.width, canvas.height) / 1000;

      for (let i = 0; i < layerCount; i++) {
        const starCount = Math.floor(baseStarCount * scalingFactor * (i + 1));
        for (let j = 0; j < starCount; j++) {
          // Alternar entre tamanhos: pequeno (1-2), médio (2.5-4), grande (4-6)
          const sizeType = j % 3;
          let size;
          if (sizeType === 0) {
            size = Math.random() * 1 + 1; // Pequeno: 1-2
          } else if (sizeType === 1) {
            size = Math.random() * 1.5 + 2.5; // Médio: 2.5-4
          } else {
            size = Math.random() * 2 + 4; // Grande: 4-6
          }

          starsRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: size,
            speed: speeds[i],
            opacity: Math.random(),
            baseOpacity: Math.random() * 0.5 + 0.5,
            layer: i,
            color: Math.random() > 0.5 ? 'light' : 'dark', // Cor fixa definida na criação
          });
        }
      }
    };

    // Update stars
    const updateStars = () => {
      starsRef.current.forEach((star) => {
        star.y -= star.speed;
        star.opacity = star.baseOpacity + Math.sin(Date.now() * 0.001 * star.speed) * 0.3;

        if (star.y < 0) {
          star.y = canvas.height;
          star.x = Math.random() * canvas.width;
        }
      });
    };

    // Draw stars
    const drawStars = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radial gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 8,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width
      );
      gradient.addColorStop(0, 'rgba(26, 26, 46, 1)'); // #1a1a2e
      gradient.addColorStop(1, 'rgba(10, 10, 20, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with gold tones (rounded)
      starsRef.current.forEach((star) => {
        // Usa a cor fixa definida na criação da estrela
        if (star.color === 'light') {
          ctx.fillStyle = `rgba(216, 184, 125, ${star.opacity})`; // #D8B87D
        } else {
          ctx.fillStyle = `rgba(156, 122, 74, ${star.opacity})`; // #9C7A4A
        }

        // Draw rounded stars (circles)
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Create shooting star
    const createShootingStar = () => {
      const startX = Math.random() * canvas.width;
      const startY = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * 300 + 100;
      const speed = Math.random() * 4 + 2;

      shootingStarRef.current = {
        x: startX,
        y: startY,
        length: length,
        speed: speed,
        opacity: 1,
        dx: Math.cos(angle) * speed,
        dy: Math.sin(angle) * speed,
      };

      const nextAppearance = Math.random() * 20000 + 20000;
      shootingStarTimeoutRef.current = setTimeout(createShootingStar, nextAppearance);
    };

    // Update shooting star
    const updateShootingStar = () => {
      const star = shootingStarRef.current;
      if (!star) return;

      star.x += star.dx;
      star.y += star.dy;
      star.opacity -= 0.01;

      if (
        star.opacity <= 0 ||
        star.x < 0 ||
        star.x > canvas.width ||
        star.y < 0 ||
        star.y > canvas.height
      ) {
        shootingStarRef.current = null;
      }
    };

    // Draw shooting star
    const drawShootingStar = () => {
      const star = shootingStarRef.current;
      if (!star) return;

      const gradient = ctx.createLinearGradient(
        star.x,
        star.y,
        star.x - star.dx * star.length,
        star.y - star.dy * star.length
      );
      gradient.addColorStop(0, `rgba(216, 184, 125, ${star.opacity})`); // #D8B87D
      gradient.addColorStop(1, 'rgba(156, 122, 74, 0)'); // #9C7A4A

      ctx.beginPath();
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(
        star.x - star.dx * star.length,
        star.y - star.dy * star.length
      );
      ctx.stroke();
      ctx.closePath();
    };

    // Animation loop
    const animate = () => {
      updateStars();
      updateShootingStar();
      drawStars();
      drawShootingStar();
      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    createStars();
    shootingStarTimeoutRef.current = setTimeout(
      createShootingStar,
      Math.random() * 20000 + 20000
    );
    animate();

    window.addEventListener('resize', resizeCanvas);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
      if (shootingStarTimeoutRef.current) {
        clearTimeout(shootingStarTimeoutRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}