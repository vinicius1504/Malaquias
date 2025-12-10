'use client';

import { useEffect, useRef, memo } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  baseOpacity: number;
  color: string;
}

const StarfieldCanvas = memo(function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    // Configurações otimizadas - menos estrelas
    const baseStarCount = 80;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    // Resize canvas
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      createStars(rect.width, rect.height);
    };

    // Create stars - otimizado
    const createStars = (width: number, height: number) => {
      starsRef.current = [];
      const scalingFactor = Math.max(width, height) / 1000;
      const starCount = Math.floor(baseStarCount * scalingFactor);

      for (let j = 0; j < starCount; j++) {
        const size = Math.random() * 2 + 1;
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size,
          speed: 0.05 + Math.random() * 0.15,
          opacity: Math.random() * 0.5 + 0.5,
          baseOpacity: Math.random() * 0.5 + 0.5,
          color: Math.random() > 0.5 ? 'rgba(216, 184, 125,' : 'rgba(156, 122, 74,',
        });
      }
    };

    // Draw frame - otimizado
    const drawFrame = (width: number, height: number, time: number) => {
      // Background gradient (cache-friendly)
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, width, height);

      // Radial overlay
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, width * 0.7
      );
      gradient.addColorStop(0, 'rgba(26, 26, 46, 0.8)');
      gradient.addColorStop(1, 'rgba(10, 10, 20, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw and update stars
      const sinTime = Math.sin(time * 0.001);
      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];

        // Update position
        star.y -= star.speed;
        if (star.y < 0) {
          star.y = height;
          star.x = Math.random() * width;
        }

        // Twinkle effect
        const opacity = star.baseOpacity + sinTime * 0.2;

        // Draw star
        ctx.fillStyle = `${star.color}${opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Animation loop com throttle
    const animate = (currentTime: number) => {
      animationRef.current = requestAnimationFrame(animate);

      const delta = currentTime - lastTimeRef.current;
      if (delta < frameInterval) return;

      lastTimeRef.current = currentTime - (delta % frameInterval);

      const rect = canvas.getBoundingClientRect();
      drawFrame(rect.width, rect.height, currentTime);
    };

    // Initialize
    resizeCanvas();

    // Debounced resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener('resize', handleResize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationRef.current);
      clearTimeout(resizeTimeout);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
});

export default StarfieldCanvas;
