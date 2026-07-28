import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Keyboard, Zap, Palette } from 'lucide-react';
import Button from './Button';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', zIndex: 8000 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%', maxWidth: 480, zIndex: 8001,
              background: 'rgba(12, 8, 32, 0.96)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
              padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Settings</h2>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>

            {[
              { icon: Sparkles, title: 'AI Model', desc: 'Groq Llama 3.3 70B — fast & accurate' },
              { icon: Keyboard, title: 'Keyboard Shortcuts', desc: '⌘K command palette · Space to flip cards' },
              { icon: Zap, title: 'Performance', desc: 'Optimized animations with Framer Motion' },
              { icon: Palette, title: 'Theme', desc: 'Dark Aurora — premium glassmorphism' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: 'flex', gap: 14, padding: '14px 0',
                  borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(108,99,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <item.icon size={16} color="var(--primary-hover)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{item.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}

            <Button variant="secondary" onClick={onClose} style={{ width: '100%', marginTop: 20 }}>
              Close
            </Button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
