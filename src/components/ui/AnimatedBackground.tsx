'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            opacity: number;

            constructor(canvasWidth: number, canvasHeight: number) {
                this.x = Math.random() * canvasWidth;
                this.y = Math.random() * canvasHeight;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.3 + 0.1;
            }

            update(canvasWidth: number, canvasHeight: number) {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.x > canvasWidth) this.x = 0;
                if (this.x < 0) this.x = canvasWidth;
                if (this.y > canvasHeight) this.y = 0;
                if (this.y < 0) this.y = canvasHeight;
            }

            draw(ctx: CanvasRenderingContext2D) {
                ctx.fillStyle = `rgba(99, 102, 241, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initParticles = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height));
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((particle) => {
                particle.update(canvas.width, canvas.height);
                particle.draw(ctx);
            });

            // Draw connections
            particles.forEach((a, i) => {
                particles.slice(i + 1).forEach((b) => {
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 * (1 - distance / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                });
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        initParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Base gradient */}
            <div className="absolute inset-0 bg-[#0a0a0f]" />

            {/* Mesh gradient orbs */}
            <motion.div
                className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, 50, -20, 0],
                    y: [0, -30, 40, 0],
                    scale: [1, 1.05, 0.95, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [0, -40, 30, 0],
                    y: [0, 50, -25, 0],
                    scale: [1, 0.95, 1.05, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full"
                style={{
                    background:
                        'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    x: [0, 30, -40, 0],
                    y: [0, -40, 20, 0],
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Particle canvas */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 opacity-60"
            />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '50px 50px',
                }}
            />
        </div>
    );
}
