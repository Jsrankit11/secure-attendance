import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 250, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if touch device or prefers reduced motion
    const touchCheck = window.matchMedia('(pointer: coarse)').matches;
    const reducedMotionCheck = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (touchCheck || reducedMotionCheck) {
      setIsTouch(true);
      return;
    }

    document.body.classList.add('custom-cursor-active');

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Inspect target to determine cursor label or hover expansion
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest('button, a, input, select, textarea, [data-cursor], [role="button"]');
      if (interactive) {
        setIsHoveringInteractive(true);
        const customLabel = interactive.getAttribute('data-cursor');
        if (customLabel) {
          setCursorText(customLabel);
        } else if (interactive.tagName === 'BUTTON' || interactive.getAttribute('role') === 'button') {
          const btnText = interactive.textContent?.trim().toUpperCase() || '';
          if (btnText.includes('VERIFY')) setCursorText('VERIFY');
          else if (btnText.includes('VIEW') || btnText.includes('DETAILS')) setCursorText('VIEW');
          else if (btnText.includes('OPEN') || btnText.includes('EXPLORE')) setCursorText('OPEN');
          else setCursorText('');
        } else {
          setCursorText('');
        }
      } else {
        setIsHoveringInteractive(false);
        setCursorText('');
      }
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY, isVisible]);

  if (isTouch || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Outer Easing Ring */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent-emerald/60 flex items-center justify-center pointer-events-none"
        style={{
          x: smoothX,
          y: smoothY,
        }}
        animate={{
          width: isHoveringInteractive ? (cursorText ? 76 : 48) : 26,
          height: isHoveringInteractive ? (cursorText ? 76 : 48) : 26,
          backgroundColor: isHoveringInteractive ? 'rgba(0, 245, 160, 0.08)' : 'rgba(0, 245, 160, 0.02)',
          borderColor: isHoveringInteractive ? 'rgba(0, 245, 160, 0.9)' : 'rgba(0, 245, 160, 0.4)',
          boxShadow: isHoveringInteractive ? '0 0 20px rgba(0, 245, 160, 0.35)' : 'none',
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {cursorText && (
          <span className="text-[9px] font-mono font-bold tracking-widest text-accent-emerald uppercase select-none animate-pulse">
            {cursorText}
          </span>
        )}
      </motion.div>

      {/* Center glowing emerald dot */}
      <motion.div
        className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-accent-emerald shadow-[0_0_10px_#00F5A0] pointer-events-none"
        style={{
          x: mouseX,
          y: mouseY,
        }}
        animate={{
          scale: isHoveringInteractive ? 0.6 : 1,
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};
