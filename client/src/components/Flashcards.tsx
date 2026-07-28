import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle, HelpCircle, RefreshCw, Trophy } from 'lucide-react';
import type { FlashcardDeck } from '../utils/types';
import confetti from 'canvas-confetti';

interface FlashcardsProps {
  deck: FlashcardDeck;
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
}

export default function Flashcards({ deck, onUpdateDeck }: FlashcardsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = deck.cards;
  const currentCard = cards[currentIndex];

  const containerRef = useRef<HTMLDivElement>(null);

  // Set up Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, cards.length]);

  // Trigger celebration confetti when all cards are mastered
  useEffect(() => {
    const allMastered = cards.length > 0 && cards.every(c => c.mastered);
    if (allMastered) {
      // Fire multiple bursts of confetti
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#6C63FF', '#00C2FF', '#A855F7']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#6C63FF', '#00C2FF', '#A855F7']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [cards]);

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const toggleMastery = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't flip the card when ticking mastery
    const updatedCards = [...cards];
    updatedCards[currentIndex] = {
      ...currentCard,
      mastered: !currentCard.mastered
    };
    
    onUpdateDeck({
      ...deck,
      cards: updatedCards
    });
  };

  const resetMastery = () => {
    const updatedCards = cards.map(c => ({ ...c, mastered: false }));
    onUpdateDeck({ ...deck, cards: updatedCards });
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Cursor tracking for 3D tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    // Limit angle to max 12 degrees
    const rotateY = (x - xc) / 15;
    const rotateX = -(y - yc) / 12;
    
    container.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const container = containerRef.current;
    if (!container) return;
    container.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  const masteredCount = cards.filter(c => c.mastered).length;
  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const masteryPercent = Math.round((masteredCount / cards.length) * 100);
  const deckFinished = masteredCount === cards.length;

  if (cards.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        No flashcards. Please try generating again.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Title */}
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        textAlign: 'center',
        marginBottom: '6px',
        color: '#fff',
        letterSpacing: '-0.02em'
      }}>
        {deck.title}
      </h2>
      
      <p style={{
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-display)',
        marginBottom: '28px',
        textAlign: 'center',
        opacity: 0.7
      }}>
        Tip: Press <kbd>Space</kbd> to flip, <kbd>←</kbd> / <kbd>→</kbd> to navigate cards.
      </p>

      {/* Progress metrics */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '580px',
        marginBottom: '12px',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        fontFamily: 'var(--font-mono)'
      }}>
        <div>
          Card <span style={{ color: '#fff', fontWeight: 700 }}>{currentIndex + 1}</span> of {cards.length}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Mastered: <strong style={{ color: 'var(--success)' }}>{masteredCount}/{cards.length}</strong> ({masteryPercent}%)
          </span>
          {masteredCount > 0 && (
            <button
              onClick={resetMastery}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                transition: 'color var(--transition-fast)'
              }}
              className="reset-btn-hover"
              title="Reset Mastery Status"
            >
              <RefreshCw size={11} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress bar visualizer */}
      <div style={{
        width: '100%',
        maxWidth: '580px',
        height: '6px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '3px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Navigation line */}
        <motion.div 
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            background: 'var(--secondary-gradient)',
            borderRadius: '3px'
          }}
        />
        {/* Mastery underline */}
        <motion.div 
          animate={{ width: `${masteryPercent}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: '2px',
            background: 'var(--success)'
          }}
        />
      </div>

      {/* 3D Flip Card Container with Framer Motion entry slide and manual hover tilt */}
      <div style={{ perspective: '1500px', width: '100%', maxWidth: '580px', display: 'flex', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60, rotateY: 5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: -60, rotateY: -5 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`flashcard-container ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
            style={{ 
              marginBottom: '32px',
              transition: 'transform 0.1s ease-out' // Smooth return from tilt
            }}
          >
            <div className="flashcard-3d">
              {/* Front Face */}
              <div className="card-face card-front" style={{
                borderColor: deckFinished ? 'var(--success)' : currentCard.mastered ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-thin)',
                boxShadow: currentCard.mastered ? '0 15px 35px rgba(16, 185, 129, 0.08)' : 'var(--shadow-premium)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', position: 'absolute', top: '28px', fontFamily: 'var(--font-mono)' }}>
                  Active Card
                </span>

                {currentCard.mastered && (
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--success)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)'
                  }}>
                    <CheckCircle size={14} /> Mastered
                  </div>
                )}

                <p style={{ fontSize: '1.35rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', maxWidth: '100%', wordBreak: 'break-word', padding: '0 12px', lineHeight: 1.5 }}>
                  {currentCard.front}
                </p>

                {currentCard.hint && (
                  <div style={{
                    position: 'absolute',
                    bottom: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-display)'
                  }} title={currentCard.hint}>
                    <HelpCircle size={14} color="var(--primary)" />
                    <span>Hint: </span>
                    <span className="hint-text" style={{ filter: 'blur(3.5px)', transition: 'filter 0.25s', color: 'var(--text-secondary)' }}>{currentCard.hint}</span>
                  </div>
                )}
                
                <div style={{ position: 'absolute', bottom: '28px', right: '28px', color: 'var(--text-muted)' }}>
                  <RotateCw size={15} />
                </div>
              </div>

              {/* Back Face */}
              <div className="card-face card-back" style={{
                borderColor: deckFinished ? 'var(--success)' : currentCard.mastered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(139, 92, 246, 0.25)',
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', position: 'absolute', top: '28px', fontFamily: 'var(--font-mono)' }}>
                  Explanation
                </span>

                <p style={{ fontSize: '1.2rem', fontWeight: 500, lineHeight: 1.7, color: 'var(--text-primary)', maxWidth: '100%', wordBreak: 'break-word', whiteSpace: 'pre-wrap', padding: '0 12px' }}>
                  {currentCard.back}
                </p>

                {/* Mastery status toggle button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMastery}
                  className="glass-btn"
                  style={{
                    position: 'absolute',
                    bottom: '24px',
                    padding: '8px 18px',
                    fontSize: '0.8rem',
                    backgroundColor: currentCard.mastered ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255,255,255,0.02)',
                    borderColor: currentCard.mastered ? 'var(--success)' : 'var(--border-thin)',
                    color: currentCard.mastered ? 'var(--success)' : 'var(--text-secondary)'
                  }}
                >
                  <CheckCircle size={14} />
                  <span>{currentCard.mastered ? 'Mastered!' : 'Mark as Mastered'}</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Deck Completion Award Display */}
      {deckFinished && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 24px',
            borderRadius: '16px',
            background: 'var(--success-glow)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            fontWeight: 700,
            marginBottom: '24px',
            fontFamily: 'var(--font-display)',
            fontSize: '0.9rem'
          }}
        >
          <Trophy size={18} />
          <span>Deck 100% Mastered! Outstanding Job!</span>
        </motion.div>
      )}

      {/* Card Navigation Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px', justifyContent: 'space-between' }}>
        <button
          onClick={handlePrev}
          className="glass-btn glass-btn-secondary"
          disabled={currentIndex === 0}
          style={{ flex: 1, height: '44px' }}
        >
          <ChevronLeft size={16} />
          <span>Prev</span>
        </button>

        <button
          onClick={handleFlip}
          className="glass-btn"
          style={{ 
            flex: 1.2, 
            height: '44px',
            background: 'rgba(139, 92, 246, 0.06)', 
            borderColor: 'rgba(139, 92, 246, 0.25)', 
            color: 'var(--primary-hover)' 
          }}
        >
          <RotateCw size={14} />
          <span>Flip</span>
        </button>

        <button
          onClick={handleNext}
          className="glass-btn glass-btn-secondary"
          disabled={currentIndex === cards.length - 1}
          style={{ flex: 1, height: '44px' }}
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </button>
      </div>

      <style>{`
        .flashcard-container:hover .hint-text {
          filter: blur(0px) !important;
        }
        .reset-btn-hover:hover {
          color: var(--text-primary) !important;
        }
      `}</style>
    </div>
  );
}
