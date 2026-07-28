import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Layers, CheckSquare, Plus, Settings, Command } from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNewSession: () => void;
  onStartGeneration: (type: 'flashcards' | 'quiz') => void;
  onOpenSettings: () => void;
}

const commands = [
  { id: 'new', label: 'New Study Session', icon: Plus, shortcut: 'N' },
  { id: 'flashcards', label: 'Generate Flashcards', icon: Layers, shortcut: 'F' },
  { id: 'quiz', label: 'Generate Quiz', icon: CheckSquare, shortcut: 'Q' },
  { id: 'settings', label: 'Open Settings', icon: Settings, shortcut: ',' },
];

export default function CommandPalette({ open, onClose, onNewSession, onStartGeneration, onOpenSettings }: CommandPaletteProps) {
  const handleSelect = (id: string) => {
    if (id === 'new') onNewSession();
    if (id === 'flashcards') onStartGeneration('flashcards');
    if (id === 'quiz') onStartGeneration('quiz');
    if (id === 'settings') onOpenSettings();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 9000 }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
              width: '100%', maxWidth: 520, zIndex: 9001,
              background: 'rgba(12, 8, 32, 0.95)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(108,99,255,0.15)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Command size={16} color="var(--text-muted)" />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Command Palette</span>
              <kbd style={{ marginLeft: 'auto' }}>Esc</kbd>
            </div>
            <div style={{ padding: 8 }}>
              {commands.map((cmd, i) => (
                <motion.button
                  key={cmd.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleSelect(cmd.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                    fontSize: '0.9rem', textAlign: 'left',
                  }}
                  whileHover={{ background: 'rgba(108,99,255,0.12)' }}
                >
                  <cmd.icon size={16} color="var(--primary-hover)" />
                  <span style={{ flex: 1 }}>{cmd.label}</span>
                  <kbd>{cmd.shortcut}</kbd>
                </motion.button>
              ))}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Brain size={14} color="var(--cyan)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Powered by Groq Llama 3.3</span>
              <Sparkles size={12} color="var(--magenta)" style={{ marginLeft: 'auto' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
