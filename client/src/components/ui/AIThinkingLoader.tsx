import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';

const STEPS = [
  'Understanding notes...',
  'Extracting key concepts...',
  'Building flashcards...',
  'Designing quiz questions...',
  'Optimizing difficulty...',
  'Verifying accuracy...',
  'Almost ready...',
];

interface AIThinkingLoaderProps {
  type: 'flashcards' | 'quiz';
}

export default function AIThinkingLoader({ type }: AIThinkingLoaderProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      style={{
        marginTop: 28,
        padding: '32px 28px',
        borderRadius: 'var(--radius-xl)',
        background: 'rgba(108,99,255,0.06)',
        border: '1px solid rgba(108,99,255,0.15)',
        textAlign: 'center',
      }}
    >
      {/* Floating AI orb */}
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6C63FF, #00C2FF, #A855F7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px rgba(108,99,255,0.5)',
        }}
      >
        <Brain size={28} color="#fff" />
      </motion.div>

      {/* Floating dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--purple), var(--cyan))',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-accent)',
            marginBottom: 8,
          }}
        >
          {STEPS[step]}
        </motion.p>
      </AnimatePresence>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Sparkles size={12} />
        Generating {type === 'flashcards' ? 'interactive flashcards' : 'smart quiz'} with AI
      </p>

      {/* Progress bar */}
      <div style={{ marginTop: 20, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: ['0%', '85%'] }}
          transition={{ duration: 12, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 99 }}
          className="progress-gradient"
        />
      </div>

      {/* Skeleton cards */}
      <div style={{ display: 'grid', gap: 12, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className="shimmer-bg"
            style={{ height: 56, borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.04)' }}
          />
        ))}
      </div>
    </motion.div>
  );
}
