import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, TrendingUp } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const stats = [
  { icon: Brain, label: 'AI-Powered', value: 'Smart' },
  { icon: Zap, label: 'Generation', value: '< 3s' },
  { icon: TrendingUp, label: 'Retention', value: '+40%' },
];

export default function HeroSection() {
  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      style={{ marginBottom: 40, position: 'relative' }}
    >
      {/* Background glow behind heading */}
      <div style={{
        position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 200,
        background: 'radial-gradient(ellipse, rgba(108,99,255,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Sparkles size={16} color="var(--cyan)" />
        </motion.div>
        <span style={{
          fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--cyan)',
          fontFamily: 'var(--font-accent)',
        }}>
          AI Study Assistant · 2026
        </span>
      </motion.div>

      <motion.h1
        variants={item}
        style={{
          fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          marginBottom: 16,
          letterSpacing: '-0.04em',
        }}
      >
        <span className="gradient-text">Study Smarter.</span>
        <br />
        <span style={{ color: 'var(--text-primary)' }}>Powered by </span>
        <span className="gradient-text-accent">AI.</span>
      </motion.h1>

      <motion.p
        variants={item}
        style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          maxWidth: 520,
          lineHeight: 1.7,
          marginBottom: 28,
        }}
      >
        Transform any notes into interactive flashcards and smart quizzes.
        Built for learners who demand more than boring study tools.
      </motion.p>

      <motion.div variants={item} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {stats.map((s) => (
          <motion.div
            key={s.label}
            whileHover={{ y: -3, scale: 1.02 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <s.icon size={16} color="var(--primary-hover)" />
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</p>
              <p style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
