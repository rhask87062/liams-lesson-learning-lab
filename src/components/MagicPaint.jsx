import { useState, useRef, useEffect } from 'react';
import { Home, Settings, Palette, Sparkles, Zap, Waves, Brush, Lock, LockOpen, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { SplashCursor } from './ui/splash-cursor.jsx';

const MagicPaint = ({ onHome, onLock, isNavigationLocked }) => {
  const canvasRef = useRef(null);
  const [currentEffect, setCurrentEffect] = useState('splashCursor');
  const cleanupRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPositionRef = useRef({ x: 0, y: 0 });

  const effects = [
    {
      id: 'splashCursor',
      name: 'Fluid Splash',
      icon: Droplets,
      description: 'Interactive fluid color splash',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      id: 'splash',
      name: 'Misty Colors',
      icon: Waves,
      description: 'Flowing, cloud-like aurora effects',
      color: 'from-blue-400 to-purple-600'
    },
    {
      id: 'fireworks',
      name: 'Fireworks',
      icon: Sparkles,
      description: 'Explosive particle bursts',
      color: 'from-red-400 to-yellow-500'
    },
    {
      id: 'lightning',
      name: 'Lightning',
      icon: Zap,
      description: 'Electric energy trails',
      color: 'from-purple-400 to-blue-500'
    },
    {
      id: 'brush',
      name: 'Neon Brush',
      icon: Brush,
      description: 'Glowing neon paint strokes',
      color: 'from-green-400 to-pink-500'
    }
  ];

  // Initialize the selected effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clean up previous effect
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    // Clear canvas completely
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Initialize the selected effect
    console.log('Switching to effect:', currentEffect);
    switch (currentEffect) {
      case 'splash':
        cleanupRef.current = initFluidMistyEffect(canvas);
        break;
      case 'fireworks':
        cleanupRef.current = initFireworksEffect(canvas);
        break;
      case 'lightning':
        cleanupRef.current = initLightningEffect(canvas);
        break;
      case 'brush':
        cleanupRef.current = initNeonBrushEffect(canvas);
        break;
      default:
        cleanupRef.current = initFluidMistyEffect(canvas);
    }

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [currentEffect]);

  // Fluid Misty Effect - Continuous flowing like 21st.dev
  const initFluidMistyEffect = (canvas) => {
    console.log('Initializing fluid misty effect');
    
    const ctx = canvas.getContext('2d');
    const particles = [];
    const maxParticles = 300;
    let animationId;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    class FluidParticle {
      constructor(x, y, vx, vy, hue) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 120 + Math.random() * 60;
        this.maxLife = this.life;
        this.hue = hue;
        this.size = Math.random() * 8 + 4;
        this.opacity = 0.8;
        this.saturation = 70 + Math.random() * 30;
        this.lightness = 50 + Math.random() * 30;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life--;
        this.hue += 0.5;
        this.opacity = (this.life / this.maxLife) * 0.8;
        this.size *= 0.995;
      }

      draw() {
        const alpha = this.opacity;
        const size = this.size * (this.life / this.maxLife);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'screen';
        
        // Create multiple layers for fluid effect
        for (let i = 0; i < 3; i++) {
          const layerSize = size * (1 + i * 0.8);
          const layerAlpha = alpha / (i + 1);
          
          ctx.globalAlpha = layerAlpha;
          
          const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, layerSize
          );
          
          gradient.addColorStop(0, `hsla(${this.hue + i * 15}, ${this.saturation}%, ${this.lightness}%, 0.9)`);
          gradient.addColorStop(0.4, `hsla(${this.hue + i * 25}, ${this.saturation}%, ${this.lightness - 10}%, 0.6)`);
          gradient.addColorStop(1, `hsla(${this.hue + i * 35}, ${this.saturation}%, ${this.lightness - 20}%, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, layerSize, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    const createFluidTrail = (x, y, lastX, lastY) => {
      const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      const steps = Math.max(1, Math.floor(distance / 3));
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const interpolatedX = lastX + (x - lastX) * t;
        const interpolatedY = lastY + (y - lastY) * t;
        
        // Create multiple particles for each point
        for (let j = 0; j < 8; j++) {
          if (particles.length < maxParticles) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const hue = (Date.now() * 0.1 + Math.random() * 60) % 360;
            
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 20;
            
            particles.push(new FluidParticle(
              interpolatedX + offsetX, 
              interpolatedY + offsetY, 
              vx, vy, hue
            ));
          }
        }
      }
    };

    const animate = () => {
      // Create trailing effect with less opacity
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    // Event handlers for continuous drawing
    const handlePointerStart = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      lastX = e.clientX - rect.left;
      lastY = e.clientY - rect.top;
      createFluidTrail(lastX, lastY, lastX, lastY);
    };

    const handlePointerMove = (e) => {
      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createFluidTrail(x, y, lastX, lastY);
        lastX = x;
        lastY = y;
      }
    };

    const handlePointerEnd = () => {
      isDrawing = false;
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      lastX = touch.clientX - rect.left;
      lastY = touch.clientY - rect.top;
      createFluidTrail(lastX, lastY, lastX, lastY);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        createFluidTrail(x, y, lastX, lastY);
        lastX = x;
        lastY = y;
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      isDrawing = false;
    };

    // Add event listeners
    canvas.addEventListener('mousedown', handlePointerStart);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerEnd);
    canvas.addEventListener('mouseleave', handlePointerEnd);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Start animation
    animate();

    // Return cleanup function
    return () => {
      console.log('Cleaning up fluid misty effect');
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handlePointerStart);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerEnd);
      canvas.removeEventListener('mouseleave', handlePointerEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      particles.length = 0;
    };
  };

  // Fireworks Effect
  const initFireworksEffect = (canvas) => {
    console.log('Initializing fireworks effect');
    const ctx = canvas.getContext('2d');
    const particles = [];
    let animationId;

    class Particle {
      constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.gravity = 0.1;
        this.size = Math.random() * 3 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity;
        this.life--;
        this.vx *= 0.99;
        this.vy *= 0.99;
      }

      draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const createFirework = (x, y) => {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
      const particleCount = 30;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = Math.random() * 5 + 2;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const life = Math.random() * 60 + 30;
        
        particles.push(new Particle(x, y, vx, vy, color, life));
      }
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update();
        particle.draw();

        if (particle.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const handlePointerDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      createFirework(x, y);
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      for (let touch of e.touches) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        createFirework(x, y);
      }
    };

    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    animate();

    return () => {
      console.log('Cleaning up fireworks effect');
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handlePointerDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      particles.length = 0;
    };
  };

  // Lightning Effect
  const initLightningEffect = (canvas) => {
    console.log('Initializing lightning effect');
    const ctx = canvas.getContext('2d');
    const lightningBolts = [];
    let animationId;

    class LightningBolt {
      constructor(startX, startY, endX, endY) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.segments = this.generateSegments();
        this.life = 20;
        this.maxLife = 20;
      }

      generateSegments() {
        const segments = [];
        const distance = Math.sqrt((this.endX - this.startX) ** 2 + (this.endY - this.startY) ** 2);
        const segmentCount = Math.floor(distance / 10);
        
        for (let i = 0; i <= segmentCount; i++) {
          const t = i / segmentCount;
          const x = this.startX + (this.endX - this.startX) * t + (Math.random() - 0.5) * 20;
          const y = this.startY + (this.endY - this.startY) * t + (Math.random() - 0.5) * 20;
          segments.push({ x, y });
        }
        
        return segments;
      }

      update() {
        this.life--;
      }

      draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(${240 + Math.random() * 60}, 100%, 80%)`;
        ctx.lineWidth = 2 + Math.random() * 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        
        for (let i = 1; i < this.segments.length; i++) {
          ctx.lineTo(this.segments[i].x, this.segments[i].y);
        }
        
        ctx.stroke();
        ctx.restore();
      }
    }

    const createLightning = (x, y) => {
      const endX = x + (Math.random() - 0.5) * 200;
      const endY = y + Math.random() * 100 + 50;
      lightningBolts.push(new LightningBolt(x, y, endX, endY));
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = lightningBolts.length - 1; i >= 0; i--) {
        const bolt = lightningBolts[i];
        bolt.update();
        bolt.draw();

        if (bolt.life <= 0) {
          lightningBolts.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const handlePointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.random() < 0.1) {
        createLightning(x, y);
      }
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      for (let touch of e.touches) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        if (Math.random() < 0.3) {
          createLightning(x, y);
        }
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    animate();

    return () => {
      console.log('Cleaning up lightning effect');
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      lightningBolts.length = 0;
    };
  };

  // Neon Brush Effect - Replacement for paint drops
  const initNeonBrushEffect = (canvas) => {
    console.log('Initializing neon brush effect');
    const ctx = canvas.getContext('2d');
    const strokes = [];
    let animationId;
    let isDrawing = false;
    let currentStroke = null;

    class NeonStroke {
      constructor() {
        this.points = [];
        this.hue = Math.random() * 360;
        this.life = 300;
        this.maxLife = 300;
      }

      addPoint(x, y) {
        this.points.push({ x, y, time: Date.now() });
        // Keep only recent points for performance
        if (this.points.length > 50) {
          this.points.shift();
        }
      }

      update() {
        this.life--;
        this.hue += 0.5;
      }

      draw() {
        if (this.points.length < 2) return;

        const alpha = this.life / this.maxLife;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = 'screen';
        
        // Draw multiple layers for neon effect
        for (let layer = 0; layer < 3; layer++) {
          const lineWidth = (3 - layer) * 4 + 2;
          const layerAlpha = alpha / (layer + 1);
          
          ctx.globalAlpha = layerAlpha;
          ctx.strokeStyle = `hsl(${this.hue + layer * 20}, 100%, ${70 - layer * 10}%)`;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = `hsl(${this.hue}, 100%, 50%)`;
          ctx.shadowBlur = 10 + layer * 5;
          
          ctx.beginPath();
          ctx.moveTo(this.points[0].x, this.points[0].y);
          
          for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            const prevPoint = this.points[i - 1];
            
            // Smooth curve using quadratic curves
            const cpx = (prevPoint.x + point.x) / 2;
            const cpy = (prevPoint.y + point.y) / 2;
            ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy);
          }
          
          ctx.stroke();
        }
        
        ctx.restore();
      }
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = strokes.length - 1; i >= 0; i--) {
        const stroke = strokes[i];
        stroke.update();
        stroke.draw();

        if (stroke.life <= 0) {
          strokes.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const handlePointerStart = (e) => {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      currentStroke = new NeonStroke();
      currentStroke.addPoint(x, y);
      strokes.push(currentStroke);
    };

    const handlePointerMove = (e) => {
      if (isDrawing && currentStroke) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        currentStroke.addPoint(x, y);
      }
    };

    const handlePointerEnd = () => {
      isDrawing = false;
      currentStroke = null;
    };

    const handleTouchStart = (e) => {
      e.preventDefault();
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      
      currentStroke = new NeonStroke();
      currentStroke.addPoint(x, y);
      strokes.push(currentStroke);
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      if (isDrawing && currentStroke) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        currentStroke.addPoint(x, y);
      }
    };

    const handleTouchEnd = (e) => {
      e.preventDefault();
      isDrawing = false;
      currentStroke = null;
    };

    canvas.addEventListener('mousedown', handlePointerStart);
    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('mouseup', handlePointerEnd);
    canvas.addEventListener('mouseleave', handlePointerEnd);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    animate();

    return () => {
      console.log('Cleaning up neon brush effect');
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousedown', handlePointerStart);
      canvas.removeEventListener('mousemove', handlePointerMove);
      canvas.removeEventListener('mouseup', handlePointerEnd);
      canvas.removeEventListener('mouseleave', handlePointerEnd);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      strokes.length = 0;
    };
  };

  const handleKeyPress = (e) => {
    // Global hotkeys
    if (e.ctrlKey && e.shiftKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      onHome();
      return;
    }
    if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      onLock();
      return;
    }

    // Effect selection hotkeys
    if (e.key >= '1' && e.key <= '4') {
      const effectIndex = parseInt(e.key) - 1;
      if (effects[effectIndex]) {
        setCurrentEffect(effects[effectIndex].id);
      }
    }
  };

  if (currentEffect === 'splashCursor') {
    return (
      <div className="w-screen h-screen bg-black">
        <SplashCursor />
        {/* UI Controls */}
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-50">
          {effects.map((effect) => (
            <Button
              key={effect.id}
              onClick={() => setCurrentEffect(effect.id)}
              className={`flex items-center justify-start space-x-2 w-48 transition-all duration-300 ${
                currentEffect === effect.id
                  ? `bg-gradient-to-r ${effect.color} text-white shadow-lg`
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
              }`}
            >
              <effect.icon className="h-5 w-5" />
              <span>{effect.name}</span>
            </Button>
          ))}
        </div>
        <Button onClick={onHome} className="absolute top-4 left-4 bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 z-50">
          <Home className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  // Fallback for other effects
  return (
    <div className="w-screen h-screen bg-black relative">
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* UI Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        {effects.map((effect) => (
          <Button
            key={effect.id}
            onClick={() => setCurrentEffect(effect.id)}
            className={`flex items-center justify-start space-x-2 w-48 transition-all duration-300 ${
              currentEffect === effect.id
                ? `bg-gradient-to-r ${effect.color} text-white shadow-lg`
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70'
            }`}
          >
            <effect.icon className="h-5 w-5" />
            <span>{effect.name}</span>
          </Button>
        ))}
      </div>
      <Button onClick={onHome} className="absolute top-4 left-4 bg-gray-700/50 text-gray-300 hover:bg-gray-600/70">
        <Home className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default MagicPaint;

