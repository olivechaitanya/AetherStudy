import { motion } from 'framer-motion';
import { Sparkles, BookOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        textAlign: 'center',
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
      }}
    >
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,194,255,0.1))',
          border: '1px solid rgba(108,99,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}
      >
        <BookOpen size={28} color="var(--primary-hover)" />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: 'absolute', top: -4, right: -4 }}
        >
          <Sparkles size={16} color="var(--cyan)" />
        </motion.div>
      </motion.div>
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6, fontFamily: 'var(--font-accent)' }}>{title}</p>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 240, lineHeight: 1.5 }}>{description}</p>
      </div>
      {action}
    </motion.div>
  );
}
