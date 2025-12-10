"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  digit: string;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

interface EnhancedMenuBackgroundProps {
  particleCount?: number;
  enableParallax?: boolean;
  intensity?: "low" | "medium" | "high";
}

export default function EnhancedMenuBackground({
  particleCount = 50,
  enableParallax = true,
  intensity = "medium",
}: EnhancedMenuBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);
  const [gradientPhase, setGradientPhase] = useState(0);

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

    // Adjust particle count based on device and intensity
    const isMobile = window.innerWidth < 768;
    const intensityMultiplier =
      intensity === "low" ? 0.5 : intensity === "high" ? 1.5 : 1;
    const count = Math.floor(
      (isMobile ? particleCount / 2.5 : particleCount) * intensityMultiplier,
    );

    // Enhanced particle colors
    const colors = [
      "rgba(245, 245, 240, 0.8)", // Primary
      "rgba(212, 197, 185, 0.6)", // Secondary
      "rgba(168, 159, 145, 0.4)", // Accent
      "rgba(255, 215, 0, 0.3)", // Gold
      "rgba(0, 191, 255, 0.3)", // Blue
    ];

    // Initialize particles with enhanced properties
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 25 + 8,
      speed: Math.random() * 0.8 + 0.2,
      opacity: Math.random() * 0.4 + 0.1,
      digit: Math.floor(Math.random() * 10).toString(),
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    // Mouse move handler for enhanced parallax
    const handleMouseMove = (e: MouseEvent) => {
      if (!enableParallax) return;
      mouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Gradient animation
    const gradientInterval = setInterval(() => {
      setGradientPhase((prev) => (prev + 1) % 360);
    }, 100);

    // Enhanced animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Enhanced gradient background with animation
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(gradientPhase * 0.01) * 100,
        canvas.height / 2 + Math.cos(gradientPhase * 0.01) * 100,
        0,
        canvas.width / 2,
        canvas.height / 2,
        Math.max(canvas.width, canvas.height),
      );

      const hue1 = (gradientPhase * 0.5) % 360;
      const hue2 = (gradientPhase * 0.3 + 60) % 360;

      gradient.addColorStop(0, `hsla(${hue1}, 20%, 15%, 0.95)`);
      gradient.addColorStop(0.5, `hsla(${hue2}, 15%, 12%, 0.97)`);
      gradient.addColorStop(1, "rgba(26, 28, 30, 0.98)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw enhanced particles
      particlesRef.current.forEach((particle, index) => {
        // Move particle up with slight wave motion
        particle.y -= particle.speed;
        particle.x += Math.sin(Date.now() * 0.001 + index) * 0.5;
        particle.rotation += particle.rotationSpeed;

        // Reset particle when it goes off screen
        if (particle.y + particle.size < 0) {
          particle.y = canvas.height + particle.size;
          particle.x = Math.random() * canvas.width;
        }

        // Keep particles within horizontal bounds
        if (particle.x < -particle.size)
          particle.x = canvas.width + particle.size;
        if (particle.x > canvas.width + particle.size)
          particle.x = -particle.size;

        // Enhanced parallax offset with depth
        const depth = particle.size / 25; // Larger particles = closer = more parallax
        const parallaxX = enableParallax ? mouseRef.current.x * depth : 0;
        const parallaxY = enableParallax ? mouseRef.current.y * depth : 0;

        // Draw enhanced digit with rotation and glow
        ctx.save();
        ctx.globalAlpha = particle.opacity;

        // Add glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = particle.size * 0.3;

        ctx.fillStyle = particle.color;
        ctx.font = `${particle.size}px 'JetBrains Mono', monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Apply rotation
        ctx.translate(
          particle.x + parallaxX + particle.size / 2,
          particle.y + parallaxY + particle.size / 2,
        );
        ctx.rotate((particle.rotation * Math.PI) / 180);

        ctx.fillText(particle.digit, 0, 0);
        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(gradientInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particleCount, enableParallax, intensity, gradientPhase]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{ background: "var(--color-background)" }}
    />
  );
}
