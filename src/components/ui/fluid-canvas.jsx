'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

export const FluidCanvas = ({
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