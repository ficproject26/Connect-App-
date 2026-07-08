import React, { useEffect, useRef } from 'react';

export default function ConnectionNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = canvas.width = canvas.offsetWidth || window.innerWidth || 1200;
    let height = canvas.height = canvas.offsetHeight || window.innerHeight || 800;

    const particles = [];
    // Particle count: guarantee a minimum of 70 particles for a rich effect
    const particleCount = Math.max(70, Math.min(Math.floor((width * height) / 10000), 150));
    const baseConnectionDistance = 110;
    const mouse = { x: null, y: null, radius: 200 }; // Expanded hover radius

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Premium slow motion speeds
        this.vx = (Math.random() - 0.5) * 0.35;
        this.vy = (Math.random() - 0.5) * 0.35;
        // Dots: Highly visible sizes (2.5px to 5px)
        this.radius = Math.random() * 2.5 + 2.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off bounds
        if (this.x < 0 || this.x > width) this.vx = -this.vx;
        if (this.y < 0 || this.y > height) this.vy = -this.vy;

        // Keep inside bounds if screen resized smaller
        this.x = Math.max(0, Math.min(this.x, width));
        this.y = Math.max(0, Math.min(this.y, height));

        // Gravitational pull on hover
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x += (dx / dist) * force * 0.12;
            this.y += (dy / dist) * force * 0.12;
          }
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 175, 55, 0.85)'; // Highly visible gold dots
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth || 1200;
      height = canvas.height = canvas.offsetHeight || window.innerHeight || 800;
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      // Self-correct dimensions in case offsetWidth changes on load/mount
      const currentWidth = canvas.offsetWidth || window.innerWidth || 1200;
      const currentHeight = canvas.offsetHeight || window.innerHeight || 800;
      if (canvas.width !== currentWidth || canvas.height !== currentHeight) {
        width = canvas.width = currentWidth;
        height = canvas.height = currentHeight;
      }

      ctx.clearRect(0, 0, width, height);

      // Update and draw particles
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let currentMaxDistance = baseConnectionDistance;
          let isHoverActive = false;

          // If mouse is active, evaluate hover connectivity enhancement
          if (mouse.x !== null && mouse.y !== null) {
            const d1x = p1.x - mouse.x;
            const d1y = p1.y - mouse.y;
            const dist1 = Math.sqrt(d1x * d1x + d1y * d1y);

            const d2x = p2.x - mouse.x;
            const d2y = p2.y - mouse.y;
            const dist2 = Math.sqrt(d2x * d2x + d2y * d2y);

            // Connect particles near the mouse with greater distance and opacity
            if (dist1 < mouse.radius || dist2 < mouse.radius) {
              currentMaxDistance = baseConnectionDistance * 1.8;
              isHoverActive = true;
            }
          }

          if (dist < currentMaxDistance) {
            const alpha = ((currentMaxDistance - dist) / currentMaxDistance) * (isHoverActive ? 0.35 : 0.12);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Render active gold lines or passive glowing blue lines
            ctx.strokeStyle = isHoverActive ? `rgba(244, 196, 0, ${alpha})` : `rgba(59, 130, 246, ${alpha * 0.45})`;
            ctx.lineWidth = isHoverActive ? 1.4 : 0.8;
            ctx.stroke();
          }
        }

        // Draw direct connection links between particles and the cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = p1.x - mouse.x;
          const dy = p1.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = ((mouse.radius - dist) / mouse.radius) * 0.45;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(244, 196, 0, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-[17]"
    />
  );
}
