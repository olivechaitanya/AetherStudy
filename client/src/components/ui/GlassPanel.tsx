import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  glow?: boolean;
  children: ReactNode;
}

export default function GlassPanel({ glow = false, children, className = '', style, ...props }: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`glass-panel ${glow ? 'glass-panel-glow' : ''} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </motion.div>
  );
}
