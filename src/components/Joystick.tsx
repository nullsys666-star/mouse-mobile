import { motion } from 'motion/react';
import React, { useState, useCallback, useRef } from 'react';

interface JoystickProps {
  onMove: (x: number, y: number) => void;
  size?: number;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, size = 120 }) => {
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [isDriving, setIsDriving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDriving(true);
  };

  const handleMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDriving || !containerRef.current) return;
    
    if ('touches' in e) {
      if (e.cancelable) e.preventDefault();
    }

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let deltaX = clientX - centerX;
    let deltaY = clientY - centerY;

    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = size / 2;

    if (distance > maxRadius) {
      deltaX = (deltaX / distance) * maxRadius;
      deltaY = (deltaY / distance) * maxRadius;
    }

    setStickPos({ x: deltaX, y: deltaY });
    onMove(deltaX / maxRadius, deltaY / maxRadius);
  }, [isDriving, size, onMove]);

  const handleEnd = () => {
    setIsDriving(false);
    setStickPos({ x: 0, y: 0 });
    onMove(0, 0);
  };

  React.useEffect(() => {
    if (isDriving) {
      window.addEventListener('mousemove', handleMove as any);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove as any, { passive: false });
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mousemove', handleMove as any);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove as any);
      window.removeEventListener('touchend', handleEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMove as any);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove as any);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDriving, handleMove]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className="relative flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 shadow-lg select-none"
      style={{ width: size, height: size }}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/40 text-[10px] font-bold tracking-widest uppercase">Drive</div>
      <motion.div
        animate={{ x: stickPos.x, y: stickPos.y }}
        transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.5 }}
        className="w-1/2 h-1/2 rounded-full bg-[#5a5a40] shadow-2xl flex items-center justify-center"
      >
        <div className="w-1/4 h-1/4 bg-white/20 rounded-full" />
      </motion.div>
    </div>
  );
};
