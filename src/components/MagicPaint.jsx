import { useState, useRef, useEffect, useCallback } from 'react';
import { Home, Lock, LockOpen, Sparkles, Zap, Brush, Droplets, Waves } from 'lucide-react';
import { Button } from '@/components/ui/button.jsx';
import { SplashCursor } from './ui/splash-cursor.jsx';
import { motion, AnimatePresence } from 'framer-motion';

export const useMouse = () => {
  const [mouseState, setMouseState] = useState({ x: null, y: null });
  const ref = useRef(null); 

  useEffect(() => {
    const handleMouseMove = (event) => {
      setMouseState({
        x: event.clientX,
        y: event.clientY,
      });
    };

    const handleMouseLeave = () => {
      setMouseState({ x: null, y: null });
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener('mousemove', handleMouseMove);
      currentRef.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('mousemove', handleMouseMove);
        currentRef.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return [mouseState, ref];
};

export const CursorGradient = () => {
  const [mouseState, ref] = useMouse();
  const [hue, setHue] = useState(0);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (mouseState.x !== null && mouseState.y !== null) {
      const newHue = mouseState.x % 360;
      setHue(newHue);

      const newParticles = Array.from({ length: 3 }, () => ({
        id: Date.now() + Math.random(), 
        x: mouseState.x + (Math.random() - 0.5) * 20,
        y: mouseState.y + (Math.random() - 0.5) * 20,
        size: Math.random() * 3 + 2, 
        intensity: Math.random() * 0.5 + 0.5, 
      }));

      setParticles((prev) => [...prev, ...newParticles].slice(-30));
    }
  }, [mouseState.x, mouseState.y]); 

  return (
    <div className='relative w-full h-full cursor-none' ref={ref}>
      {mouseState.x !== null && mouseState.y !== null && (
        <>
          <motion.div
            className='fixed pointer-events-none z-[9999]'
            style={{
              left: mouseState.x,
              top: mouseState.y,
              x: '-50%', 
              y: '-50%',
              width: '40px',
              height: '40px',
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }} 
          >
            <div
              className='w-full h-full rounded-full mix-blend-screen' 
              style={{
                background: `radial-gradient(
                  circle at center,
                  hsl(${hue}, 100%, 70%),
                  hsl(${(hue + 60) % 360}, 100%, 60%)
                )`,
                boxShadow: `0 0 20px hsl(${hue}, 100%, 50%, 0.5)`,
              }}
            />
          </motion.div>

          <AnimatePresence>
            {particles.map((particle, index) => (
              <motion.div
                key={particle.id} 
                className='fixed pointer-events-none mix-blend-screen'
                style={{
                  left: particle.x,
                  top: particle.y,
                  x: '-50%', 
                  y: '-50%',
                }}
                initial={{ opacity: particle.intensity, scale: 0 }}
                animate={{ opacity: 0, scale: particle.size }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
              >
                <div
                  className='rounded-full'
                  style={{
                    width: `${particle.size * 4}px`,
                    height: `${particle.size * 4}px`,
                    background: `radial-gradient(
                      circle at center,
                      hsl(${(hue + index * 10) % 360}, 100%, ${70 + particle.intensity * 30}%),
                      transparent
                    )`,
                    filter: 'blur(2px)', 
                    boxShadow: `0 0 ${particle.size * 2}px hsl(${(hue + index * 10) % 360}, 100%, 50%, ${particle.intensity})`,
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

const FluidCanvas = ({
  width = 600,
  height = 400,
  viscosity = 0.00008,
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isDown: false });

  const gridRef = useRef({
    size: 128,
    velocityX: new Float32Array(128 * 128),
    velocityY: new Float32Array(128 * 128),
    velocityX0: new Float32Array(128 * 128),
    velocityY0: new Float32Array(128 * 128),
    density: new Float32Array(128 * 128),
    density0: new Float32Array(128 * 128),
    temperature: new Float32Array(128 * 128)
  });

  const addDensity = useCallback((x, y, amount) => {
    const { size, density, temperature } = gridRef.current;
    const radius = 6;
    const centerX = Math.max(0, Math.min(size - 1, Math.floor(x)));
    const centerY = Math.max(0, Math.min(size - 1, Math.floor(y)));
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = centerX + dx;
        const py = centerY + dy;
        
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const falloff = 1 - (distance / radius);
            const index = py * size + px;
            density[index] += amount * falloff * falloff;
            temperature[index] += amount * falloff * 0.5;
          }
        }
      }
    }
  }, []);

  const addVelocity = useCallback((x, y, vx, vy) => {
    const { size, velocityX, velocityY } = gridRef.current;
    const radius = 4;
    const centerX = Math.max(0, Math.min(size - 1, Math.floor(x)));
    const centerY = Math.max(0, Math.min(size - 1, Math.floor(y)));
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = centerX + dx;
        const py = centerY + dy;
        
        if (px >= 0 && px < size && py >= 0 && py < size) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const falloff = 1 - (distance / radius);
            const index = py * size + px;
            velocityX[index] += vx * falloff;
            velocityY[index] += vy * falloff;
          }
        }
      }
    }
  }, []);

  const setBoundary = useCallback((boundary, field) => {
    const { size } = gridRef.current;
    
    for (let i = 1; i < size - 1; i++) {
      field[i] = boundary === 2 ? -field[i + size] : field[i + size];
      field[i + (size - 1) * size] = boundary === 2 ? -field[i + (size - 2) * size] : field[i + (size - 2) * size];
    }
    
    for (let j = 1; j < size - 1; j++) {
      field[j * size] = boundary === 1 ? -field[j * size + 1] : field[j * size + 1];
      field[j * size + (size - 1)] = boundary === 1 ? -field[j * size + (size - 2)] : field[j * size + (size - 2)];
    }
    
    field[0] = 0.33 * (field[1] + field[size] + field[size + 1]);
    field[size - 1] = 0.33 * (field[size - 2] + field[2 * size - 1] + field[2 * size - 2]);
    field[(size - 1) * size] = 0.33 * (field[(size - 2) * size] + field[(size - 1) * size + 1] + field[(size - 2) * size + 1]);
    field[size * size - 1] = 0.33 * (field[size * size - 2] + field[(size - 1) * size - 1] + field[(size - 2) * size - 1]);
  }, []);

  const linearSolve = useCallback((boundary, field, field0, a, c) => {
    const { size } = gridRef.current;
    const cRecip = 1.0 / c;
    
    for (let iter = 0; iter < 8; iter++) {
      for (let j = 1; j < size - 1; j++) {
        for (let i = 1; i < size - 1; i++) {
          const index = j * size + i;
          field[index] = (field0[index] + a * (
            field[index - 1] + field[index + 1] + 
            field[index - size] + field[index + size]
          )) * cRecip;
        }
      }
      setBoundary(boundary, field);
    }
  }, [setBoundary]);

  const diffuse = useCallback((boundary, field, field0, diff, dt) => {
    const { size } = gridRef.current;
    const a = dt * diff * (size - 2) * (size - 2);
    linearSolve(boundary, field, field0, a, 1 + 6 * a);
  }, [linearSolve]);

  const project = useCallback((velocX, velocY, p, div) => {
    const { size } = gridRef.current;
    
    for (let j = 1; j < size - 1; j++) {
      for (let i = 1; i < size - 1; i++) {
        const index = j * size + i;
        div[index] = -0.5 * (
          velocX[index + 1] - velocX[index - 1] +
          velocY[index + size] - velocY[index - size]
        ) / size;
        p[index] = 0;
      }
    }
    
    setBoundary(0, div);
    setBoundary(0, p);
    linearSolve(0, p, div, 1, 6);
    
    for (let j = 1; j < size - 1; j++) {
      for (let i = 1; i < size - 1; i++) {
        const index = j * size + i;
        velocX[index] -= 0.5 * (p[index + 1] - p[index - 1]) * size;
        velocY[index] -= 0.5 * (p[index + size] - p[index - size]) * size;
      }
    }
    
    setBoundary(1, velocX);
    setBoundary(2, velocY);
  }, [setBoundary, linearSolve]);

  const advect = useCallback((boundary, field, field0, velocX, velocY, dt) => {
    const { size } = gridRef.current;
    const dtx = dt * (size - 2);
    const dty = dt * (size - 2);
    
    for (let j = 1; j < size - 1; j++) {
      for (let i = 1; i < size - 1; i++) {
        const index = j * size + i;
        
        let tmp1 = dtx * velocX[index];
        let tmp2 = dty * velocY[index];
        let x = i - tmp1;
        let y = j - tmp2;
        
        if (x < 0.5) x = 0.5;
        if (x > size + 0.5) x = size + 0.5;
        let i0 = Math.floor(x);
        let i1 = i0 + 1.0;
        
        if (y < 0.5) y = 0.5;
        if (y > size + 0.5) y = size + 0.5;
        let j0 = Math.floor(y);
        let j1 = j0 + 1.0;
        
        let s1 = x - i0;
        let s0 = 1.0 - s1;
        let t1 = y - j0;
        let t0 = 1.0 - t1;
        
        let i0i = Math.floor(i0);
        let i1i = Math.floor(i1);
        let j0i = Math.floor(j0);
        let j1i = Math.floor(j1);
        
        field[index] = 
          s0 * (t0 * field0[j0i * size + i0i] + t1 * field0[j1i * size + i0i]) +
          s1 * (t0 * field0[j0i * size + i1i] + t1 * field0[j1i * size + i1i]);
      }
    }
    
    setBoundary(boundary, field);
  }, [setBoundary]);

  const step = useCallback(() => {
    const { 
      size, velocityX, velocityY, velocityX0, velocityY0, 
      density, density0, temperature 
    } = gridRef.current;
    
    const dt = 0.016;
    
    diffuse(1, velocityX0, velocityX, viscosity, dt);
    diffuse(2, velocityY0, velocityY, viscosity, dt);
    
    project(velocityX0, velocityY0, velocityX, velocityY);
    
    advect(1, velocityX, velocityX0, velocityX0, velocityY0, dt);
    advect(2, velocityY, velocityY0, velocityX0, velocityY0, dt);
    
    project(velocityX, velocityY, velocityX0, velocityY0);
    
    diffuse(0, density0, density, 0.0001, dt);
    advect(0, density, density0, velocityX, velocityY, dt);
    
    for (let i = 0; i < size * size; i++) {
      temperature[i] *= 0.998;
      density[i] *= 0.995;
      
      if (temperature[i] > 0.1) {
        velocityY[i] -= temperature[i] * 0.01;
      }
    }
  }, [viscosity, diffuse, project, advect]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { size, density, temperature } = gridRef.current;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0a0a0a');
    gradient.addColorStop(1, '#1a1a1a');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        const x = Math.floor((i / width) * size);
        const y = Math.floor((j / height) * size);
        const index = y * size + x;
        
        const d = Math.min(1, density[index] * 0.8);
        const temp = temperature[index];
        
        const pixelIndex = (j * width + i) * 4;
        
        if (d > 0.01) {
          const hue = 180 + temp * 60;
          const saturation = 0.8 + temp * 0.2;
          const lightness = d * 0.6 + temp * 0.3;
          
          const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
          const x_color = c * (1 - Math.abs(((hue / 60) % 2) - 1));
          const m = lightness - c / 2;
          
          let r = 0, g = 0, b = 0;
          if (hue < 60) { r = c; g = x_color; b = 0; }
          else if (hue < 120) { r = x_color; g = c; b = 0; }
          else if (hue < 180) { r = 0; g = c; b = x_color; }
          else if (hue < 240) { r = 0; g = x_color; b = c; }
          else if (hue < 300) { r = x_color; g = 0; b = c; }
          else { r = c; g = 0; b = x_color; }
          
          data[pixelIndex] = Math.floor((r + m) * 255);
          data[pixelIndex + 1] = Math.floor((g + m) * 255);
          data[pixelIndex + 2] = Math.floor((b + m) * 255);
          data[pixelIndex + 3] = Math.floor(d * 255);
        } else {
          data[pixelIndex] = 0;
          data[pixelIndex + 1] = 0;
          data[pixelIndex + 2] = 0;
          data[pixelIndex + 3] = 0;
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
  }, [width, height]);

  const animate = useCallback(() => {
    step();
    render();
    animationRef.current = requestAnimationFrame(animate);
  }, [step, render]);

  const handleInteraction = useCallback((e) => {
    const { current: mouse } = mouseRef;
    const isTouch = e.touches && e.touches.length > 0;
    const event = isTouch ? e.touches[0] : e;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    mouse.prevX = mouse.x;
    mouse.prevY = mouse.y;
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;

    if (mouse.isDown) {
        const { size } = gridRef.current;
        const cx = (mouse.x / width) * size;
        const cy = (mouse.y / height) * size;
        const vx = (mouse.x - mouse.prevX) * 0.08;
        const vy = (mouse.y - mouse.prevY) * 0.08;
        
        addDensity(cx, cy, 15);
        addVelocity(cx, cy, vx, vy);
    }
  }, [width, height, addDensity, addVelocity]);

  useEffect(() => {
    animate();

    const handleMouseDown = (e) => { mouseRef.current.isDown = true; handleInteraction(e) };
    const handleMouseUp = () => (mouseRef.current.isDown = false);
    const handleMouseMove = (e) => handleInteraction(e);
    
    const handleTouchStart = (e) => { mouseRef.current.isDown = true; handleInteraction(e) };
    const handleTouchEnd = () => (mouseRef.current.isDown = false);
    const handleTouchMove = (e) => handleInteraction(e);

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    window.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [animate, handleInteraction]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
};

const MagicPaint = ({ onHome, onLock, isNavigationLocked }) => {
  const canvasRef = useRef(null);
  const [currentEffect, setCurrentEffect] = useState('splashCursor');
  const cleanupRef = useRef(null);

  const effects = [
    {
      id: 'splashCursor',
      name: 'Fluid Splash',
      icon: Droplets,
      description: 'Interactive fluid color splash',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      id: 'gradientTrail',
      name: 'Fairy Dust',
      icon: Sparkles,
      description: 'Colorful gradient trail with particles.',
      color: 'from-pink-400 to-purple-600'
    },
    {
      id: 'fluidCanvas',
      name: 'Interactive Fluid',
      icon: Droplets,
      description: 'A viscous, interactive fluid simulation.',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'smoke',
      name: 'Bubbles',
      icon: Waves,
      description: 'Mysterious grey smoke trails.',
      color: 'from-gray-400 to-gray-600'
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    const isCanvasEffect = !['splashCursor', 'fluidCanvas', 'gradientTrail'].includes(currentEffect);

    if (isCanvasEffect) {
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      switch (currentEffect) {
        case 'fireworks':
          cleanupRef.current = initFireworksEffect(canvas);
          break;
        case 'lightning':
          cleanupRef.current = initLightningEffect(canvas);
          break;
        case 'brush':
          cleanupRef.current = initNeonBrushEffect(canvas);
          break;
        case 'smoke':
          cleanupRef.current = initSmokeEffect(canvas);
          break;
        default:
          break;
      }
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [currentEffect]);

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

  const initSmokeEffect = (canvas) => {
    console.log('Initializing smoke effect');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = [];
    let animationId;
    let mousePos = { x: 0, y: 0 };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = -Math.random() * 3 - 1;
        this.life = 100;
        this.initialSize = this.size;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 1;
        this.size = Math.max(0, this.initialSize * (this.life / 100));
      }

      draw() {
        if (this.size > 0) {
          const opacity = this.life / 100;
          ctx.fillStyle = `rgba(128, 128, 128, ${opacity})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const animate = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.life <= 0 || p.size <= 0) {
          particles.splice(i, 1);
        }
      }
      
      if (mousePos.x !== 0 && mousePos.y !== 0) {
        for (let i = 0; i < 2; i++) {
          particles.push(
            new Particle(
              mousePos.x + (Math.random() * 10 - 5),
              mousePos.y + (Math.random() * 10 - 5)
            )
          );
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mousePos = { x: 0, y: 0 };
    };

    const handleTouchMove = (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        mousePos = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    };

    const handleTouchEnd = (e) => {
        e.preventDefault();
        mousePos = { x: 0, y: 0 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    animate();

    return () => {
      console.log('Cleaning up smoke effect');
      cancelAnimationFrame(animationId);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      particles.length = 0;
    };
  };

  const isComponentEffect = ['splashCursor', 'fluidCanvas', 'gradientTrail'].includes(currentEffect);

  // Prevent scrolling on mobile when touching the canvas
  useEffect(() => {
    const preventScroll = (e) => {
      e.preventDefault();
    };

    // Add touch event listeners to prevent scrolling
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('touchstart', preventScroll, { passive: false });

    return () => {
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('touchstart', preventScroll);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative overflow-hidden touch-none">
      {isComponentEffect ? (
        <>
          {currentEffect === 'splashCursor' && <SplashCursor />}
          {currentEffect === 'fluidCanvas' && <FluidCanvas width={window.innerWidth} height={window.innerHeight} />}
          {currentEffect === 'gradientTrail' && <CursorGradient />}
        </>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full touch-none" />
      )}
      <div className="absolute top-4 left-4 flex flex-col space-y-2 z-50">
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
      {/* Navigation buttons - top right */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={onLock}
          className={`px-4 py-2 ${isNavigationLocked ? 'bg-orange-500/70 hover:bg-orange-600/70' : 'bg-gray-500/70 hover:bg-gray-600/70'} text-white border-0`}
          title={isNavigationLocked ? "Unlock Navigation (Ctrl+L)" : "Lock Navigation (Ctrl+L)"}
        >
          {isNavigationLocked ? <Lock size={20} /> : <LockOpen size={20} />}
        </Button>
        <Button
          onClick={onHome}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
          disabled={isNavigationLocked}
        >
          <Home className="mr-2" size={20} />
          Home
        </Button>
      </div>
    </div>
  );
};

export default MagicPaint;

