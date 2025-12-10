"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  digit: string;
}

interface MenuBackgroundProps {
  particleCount?: number;
  enableParallax?: boolean;
}

export default function MenuBackground({
  particleCount = 50,
  enableParallax = true,
}: MenuBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Reduce particle count on mobile
    const isMobile = window.innerWidth < 768;
    const count = isMobile ? Math.floor(particleCount / 2.5) : particleCount;

    // Initialize particles
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 20 + 10,
      speed: Math.random() * 0.5 + 0.2,
      opacity: Math.random() * 0.3 + 0.1,
      digit: Math.floor(Math.random() * 10).toString(),
    }));

    // Mouse move handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableParallax) return;
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "rgba(26, 28, 30, 0.95)");
      gradient.addColorStop(1, "rgba(44, 44, 46, 0.95)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Move particle up
        particle.y -= particle.speed;

        // Reset particle when it goes off screen
        if (particle.y + particle.size < 0) {
          particle.y = canvas.height + particle.size;
          particle.x = Math.random() * canvas.width;
        }

        // Apply parallax offset
        const parallaxX = enableParallax ? mouseRef.current.x : 0;
        const parallaxY = enableParallax ? mouseRef.current.y : 0;

        // Draw digit
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = "rgba(245, 245, 240, 0.8)";
        ctx.font = `${particle.size}px monospace`;
        ctx.fillText(
          particle.digit,
          particle.x + parallaxX,
          particle.y + parallaxY,
        );
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, enableParallax]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: "var(--color-background)" }}
    />
  );
}
