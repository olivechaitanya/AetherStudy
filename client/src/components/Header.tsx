import { motion } from 'framer-motion';
import { Command, Settings, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenCommand: () => void;
  onOpenSettings: () => void;
}

export default function Header({ onOpenCommand, onOpenSettings }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 36,
        padding: '12px 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ position: 'relative', width: 48, height: 48 }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: -4, borderRadius: '50%',
              background: 'radial-gradient(circle, #8B5CF6 0%, #00C2FF 100%)',
              filter: 'blur(8px)', zIndex: 1,
            }}
          />
          <motion.div
            animate={{ y: [0, -4, 0], rotate: 360 }}
            transition={{
              y: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
              rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            }}
            style={{
              position: 'absolute', width: '100%', height: '100%', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF 0%, #00C2FF 100%)',
              boxShadow: 'inset 0 4px 12px rgba(255,255,255,0.4), 0 8px 24px rgba(108,99,255,0.3)',
              zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              animate={{ scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', filter: 'drop-shadow(0 0 6px #00C2FF)' }}
            />
          </motion.div>
        </div>

        <div>
          <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
            AetherStudy
          </h1>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-accent)' }}>
            Interactive AI Study Assistant
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCommand}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.78rem',
          }}
        >
          <Command size={13} />
          <kbd style={{ fontSize: '0.68rem' }}>⌘K</kbd>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05, rotate: 30 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenSettings}
          style={{
            padding: 8, borderRadius: 10,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex',
          }}
        >
          <Settings size={16} />
        </motion.button>

        <motion.div
          animate={{ boxShadow: ['0 0 12px rgba(108,99,255,0.2)', '0 0 24px rgba(108,99,255,0.4)', '0 0 12px rgba(108,99,255,0.2)'] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', borderRadius: 20,
            background: 'rgba(108, 99, 255, 0.12)', border: '1px solid rgba(108, 99, 255, 0.25)',
            fontSize: '0.78rem', color: 'var(--primary-hover)', fontWeight: 700,
            fontFamily: 'var(--font-accent)',
          }}
        >
          <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
            <Sparkles size={13} />
          </motion.div>
          Groq Llama 3.3
        </motion.div>
      </div>
    </motion.header>
  );
}
