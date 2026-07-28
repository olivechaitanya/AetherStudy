import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, RefreshCw, Layers, CheckSquare } from 'lucide-react';

import type { ApiErrorCode } from '../utils/api';

interface StudyInputProps {
  onGenerate: (notes: string, type: 'flashcards' | 'quiz', count: number) => void;
  type: 'flashcards' | 'quiz';
  onTypeChange: (type: 'flashcards' | 'quiz') => void;
  isLoading: boolean;
  error: string | null;
  errorCode?: ApiErrorCode | null;
  onClearError: () => void;
}

const LOADING_STEPS = [
  'Parsing your notes...',
  'Extracting core concepts...',
  'Structuring decks and models...',
  'Formulating options & explanations...',
  'Double-checking references...',
  'Completing compilation...'
];

const SUGGESTED_PLACEHOLDERS = [
  "Explain JavaScript closures and execution contexts...",
  "Detail the key battles and timeline of the American Civil War...",
  "Describe the process of Cellular Respiration and Krebs Cycle...",
  "Draft a study guide for standard macroeconomics supply & demand...",
  "Summarize the plot, characters, and motifs of Shakespeare's Macbeth..."
];

export default function StudyInput({ onGenerate, type, onTypeChange, isLoading, error, errorCode, onClearError }: StudyInputProps) {
  const [notes, setNotes] = useState('');
  const [count, setCount] = useState(5);
  const [loadingStep, setLoadingStep] = useState(0);

  // Typing placeholder effect state
  const [placeholderText, setPlaceholderText] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [notes]);

  // Typing animation for placeholder
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const currentFullText = SUGGESTED_PLACEHOLDERS[placeholderIndex];
    
    const handleTyping = () => {
      if (!isDeleting) {
        setPlaceholderText(currentFullText.substring(0, placeholderText.length + 1));
        if (placeholderText === currentFullText) {
          timer = setTimeout(() => setIsDeleting(true), 1500); // Wait before delete
        } else {
          timer = setTimeout(handleTyping, 45); // Typing speed
        }
      } else {
        setPlaceholderText(currentFullText.substring(0, placeholderText.length - 1));
        if (placeholderText === '') {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % SUGGESTED_PLACEHOLDERS.length);
          timer = setTimeout(handleTyping, 200);
        } else {
          timer = setTimeout(handleTyping, 20); // Deleting speed
        }
      }
    };

    timer = setTimeout(handleTyping, 100);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, placeholderIndex]);

  // Rotate loading step messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim() || isLoading) return;
    onGenerate(notes.trim(), type, count);
  };

  const loadSampleNotes = () => {
    setNotes(
      "REST APIs and HTTP Methods:\n" +
      "- REST stands for Representational State Transfer, an architectural style for design APIs.\n" +
      "- HTTP Methods map to CRUD actions: GET (Read), POST (Create), PUT/PATCH (Update), DELETE (Delete).\n" +
      "- GET requests must remain idempotent and should never change server state.\n" +
      "- POST requests are not idempotent and typically generate new database items.\n" +
      "- Response status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error).\n" +
      "- Headers contain metadata (e.g. Content-Type: application/json, Authorization Bearer tokens)."
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel" 
      style={{ padding: '36px', marginBottom: '32px' }}
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--primary-hover)" />
              1. Input study materials or topic
            </label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={loadSampleNotes}
              className="glass-btn"
              style={{ padding: '6px 14px', fontSize: '0.75rem', height: 'auto', background: 'rgba(255,255,255,0.02)' }}
              disabled={isLoading}
            >
              Load Sample Notes
            </motion.button>
          </div>
          
          <textarea
            ref={textareaRef}
            className="glass-input"
            rows={5}
            placeholder={placeholderText}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            style={{ 
              resize: 'none', 
              minHeight: '140px', 
              fontSize: '1rem', 
              lineHeight: 1.6,
              border: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(5, 6, 10, 0.65)'
            }}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Deck type selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
              2. Select output tool
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                className={`tab-btn ${type === 'flashcards' ? 'active' : ''}`}
                onClick={() => onTypeChange('flashcards')}
                disabled={isLoading}
                style={{ border: '1px solid var(--border-thin)', height: '46px' }}
              >
                <Layers size={16} color={type === 'flashcards' ? 'var(--secondary)' : 'var(--text-muted)'} />
                <span>Flashcards</span>
              </button>
              <button
                type="button"
                className={`tab-btn ${type === 'quiz' ? 'active' : ''}`}
                onClick={() => onTypeChange('quiz')}
                disabled={isLoading}
                style={{ border: '1px solid var(--border-thin)', height: '46px' }}
              >
                <CheckSquare size={16} color={type === 'quiz' ? 'var(--primary-hover)' : 'var(--text-muted)'} />
                <span>MCQ Quiz</span>
              </button>
            </div>
          </div>

          {/* Slider Count */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <label style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
                3. Number of items
              </label>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--secondary)', fontFamily: 'var(--font-mono)' }}>{count} items</span>
            </div>
            <input
              type="range"
              min="3"
              max="15"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={isLoading}
              style={{
                width: '100%',
                height: '5px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '3px',
                outline: 'none',
                accentColor: 'var(--primary)',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              <span>3</span>
              <span>9</span>
              <span>15</span>
            </div>
          </div>
        </div>

        {/* Error Alert Box */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-panel" 
              style={{
                background: 'var(--error-glow)',
                borderColor: 'rgba(255, 46, 147, 0.3)',
                padding: '20px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px'
              }}
            >
              <AlertCircle size={22} color="var(--error)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flexGrow: 1 }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                  Aether Engine Error
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {error}
                </p>
                {errorCode && (
                  <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.72)', marginTop: '10px', lineHeight: 1.5 }}>
                    {errorCode === 'INVALID_REQUEST' && 'Please update your note prompt and try again.'}
                    {errorCode === 'INVALID_SCHEMA' && 'AI output did not match the expected format; try a slightly different topic.'}
                    {errorCode === 'INVALID_JSON' && 'The AI response was malformed. Retry the generation or try a shorter prompt.'}
                    {errorCode === 'RATE_LIMIT' && 'Rate limits are active. Please wait a moment and retry.'}
                    {errorCode === 'BACKEND_UNAVAILABLE' && 'The API appears unavailable. Check your backend and try again.'}
                    {errorCode === 'NETWORK_ERROR' && 'Network connectivity failed. Check your internet connection.'}
                    {errorCode === 'TIMEOUT' && 'The request timed out. Try again with a smaller deck size.'}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => onGenerate(notes, type, count)}
                    className="glass-btn"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(255, 46, 147, 0.12)', borderColor: 'rgba(255, 46, 147, 0.25)', color: '#fff' }}
                    disabled={isLoading || !notes.trim()}
                  >
                    <RefreshCw size={12} style={{ marginRight: '6px' }} /> Retry Request
                  </button>
                  <button
                    type="button"
                    onClick={onClearError}
                    className="glass-btn glass-btn-secondary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          type="submit"
          className={`glass-btn glass-btn-primary ${isLoading ? '' : 'pulse-primary'}`}
          style={{ width: '100%', height: '52px', fontSize: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
          disabled={isLoading || !notes.trim()}
        >
          {isLoading ? (
            <>
              <RefreshCw size={18} className="spin" style={{ animation: 'spin 1.5s linear infinite' }} />
              <span style={{ marginLeft: '10px', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                {LOADING_STEPS[loadingStep]}
              </span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span style={{ letterSpacing: '0.03em' }}>Synthesize Interactive Workspace</span>
            </>
          )}
        </motion.button>
      </form>
      
      {/* Skeleton Shimmer Loading Presentation */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ marginTop: '32px' }}
          >
            <div style={{ height: '24px', width: '30%', borderRadius: '6px', marginBottom: '16px' }} className="shimmer-bg" />
            <div className="glass-panel shimmer-bg" style={{ height: '280px', width: '100%', borderRadius: '24px' }} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  );
}
