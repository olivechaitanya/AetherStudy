import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, RefreshCw, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import type { StudyDeck } from '../utils/types';
import { refineStudyDeck } from '../utils/api';
import GlassPanel from './ui/GlassPanel';
import Button from './ui/Button';

interface RefinementPanelProps {
  currentData: StudyDeck;
  onRefineSuccess: (updatedData: StudyDeck, instruction: string) => void;
}

export default function RefinementPanel({ currentData, onRefineSuccess }: RefinementPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const refinedData = await refineStudyDeck(currentData, instruction.trim());
      onRefineSuccess(refinedData, instruction.trim());
      setInstruction('');
    } catch (err: any) {
      setError(err.message || 'Failed to apply refinement.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = currentData.type === 'flashcards'
    ? ['Translate all cards to Spanish', 'Make explanations simpler', 'Add 3 advanced cards', 'Make formatting concise']
    : ['Make questions harder', 'Focus on error handling', 'Translate to French', 'Add 2 more questions'];

  return (
    <GlassPanel
      glow
      style={{
        width: '100%', maxWidth: 620, padding: 24, marginTop: 28,
        background: 'rgba(108,99,255,0.04)',
        border: '1px solid rgba(108,99,255,0.15)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>
          <Sparkles size={18} color="var(--primary-hover)" />
        </motion.div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Refine with AI</h4>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
        Edit, extend, or transform this deck without losing your progress.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {suggestions.map((s, i) => (
          <motion.button
            key={s}
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.04, borderColor: 'rgba(108,99,255,0.4)' }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setInstruction(s)}
            disabled={isLoading}
            style={{
              padding: '5px 12px', fontSize: '0.72rem', fontWeight: 600,
              borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)', color: 'var(--text-secondary)',
              cursor: 'pointer', fontFamily: 'var(--font-accent)',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Wand2 size={10} /> {s}
          </motion.button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10 }}>
        <motion.div
          animate={{
            boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.15)' : 'none',
            borderColor: focused ? 'rgba(108,99,255,0.4)' : 'rgba(255,255,255,0.08)',
          }}
          style={{ flex: 1, borderRadius: 'var(--radius-md)', border: '1px solid', overflow: 'hidden' }}
        >
          <input
            type="text"
            className="glass-input"
            placeholder="e.g. 'translate to Spanish' or 'make harder'..."
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isLoading}
            style={{ height: 46, fontSize: '0.88rem', border: 'none', borderRadius: 0 }}
          />
        </motion.div>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !instruction.trim()}
          style={{ height: 46, width: 46, padding: 0, flexShrink: 0 }}
          icon={isLoading ? <RefreshCw size={16} style={{ animation: 'spin 1.5s linear infinite' }} /> : <Send size={16} />}
        />
      </form>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 'var(--radius-sm)',
              background: 'var(--error-glow)', border: '1px solid rgba(255,77,109,0.2)',
              color: 'var(--error)', fontSize: '0.8rem',
              display: 'flex', gap: 8, alignItems: 'center',
            }}
          >
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassPanel>
  );
}
