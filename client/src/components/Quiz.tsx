import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, XCircle, RefreshCw, ChevronRight, Award, Trophy, Zap } from 'lucide-react';
import type { QuizDeck, QuizQuestion } from '../utils/types';
import Button from './ui/Button';
import ProgressRing from './ui/ProgressRing';
import EmptyState from './ui/EmptyState';

interface QuizProps {
  deck: QuizDeck;
}

export default function Quiz({ deck }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isRetestMode, setIsRetestMode] = useState(false);
  const [shakeIdx, setShakeIdx] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (deck?.questions) {
      setQuestions(deck.questions);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsQuizFinished(false);
      setIsRetestMode(false);
      setTimer(0);
    }
  }, [deck]);

  useEffect(() => {
    if (isQuizFinished) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isQuizFinished]);

  const currentQuestion = questions[currentIndex];

  const handleOptionSelect = (option: string, idx: number) => {
    if (selectedAnswers[currentIndex] !== undefined) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: option }));
    if (option !== currentQuestion.correctAnswer) {
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 500);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) setCurrentIndex((p) => p + 1);
    else {
      setIsQuizFinished(true);
      const score = calculateScore();
      const pct = Math.round((score / questions.length) * 100);
      if (pct >= 80) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 }, colors: ['#6C63FF', '#00C2FF', '#22d3a7'] });
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => { if (selectedAnswers[idx] === q.correctAnswer) score++; });
    return score;
  };

  const score = calculateScore();
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const handleRetestWrong = () => {
    const wrong = questions.filter((q, idx) => selectedAnswers[idx] !== q.correctAnswer);
    if (wrong.length > 0) {
      setQuestions(wrong);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setIsQuizFinished(false);
      setIsRetestMode(true);
      setTimer(0);
    }
  };

  const handleResetFull = () => {
    setQuestions(deck.questions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsQuizFinished(false);
    setIsRetestMode(false);
    setTimer(0);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!currentQuestion && !isQuizFinished) {
    return <EmptyState title="No quiz questions" description="Try generating a new quiz with different notes." />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
    >
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: 4, fontFamily: 'var(--font-display)' }}>
        {deck.title}
      </h2>
      {isRetestMode && (
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            fontSize: '0.75rem', color: 'var(--error)', fontWeight: 700,
            background: 'var(--error-glow)', padding: '3px 12px', borderRadius: 20,
            border: '1px solid rgba(255,77,109,0.2)', marginBottom: 16,
          }}
        >
          Re-testing · {questions.length} remaining
        </motion.span>
      )}

      <AnimatePresence mode="wait">
        {!isQuizFinished ? (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: '100%', maxWidth: 620, marginTop: 12 }}
          >
            {/* Progress header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Question <strong style={{ color: 'var(--text-primary)' }}>{currentIndex + 1}</strong> / {questions.length}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} color="var(--cyan)" /> {formatTime(timer)}
                </span>
                <ProgressRing
                  percent={Math.round(((currentIndex + 1) / questions.length) * 100)}
                  size={40}
                  strokeWidth={4}
                  label=""
                />
              </div>
            </div>

            <div style={{ height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 99, marginBottom: 24, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                className="progress-gradient"
                style={{ height: '100%' }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Question card */}
            <div className="glass-panel" style={{ padding: 28, marginBottom: 20, borderRadius: 'var(--radius-xl)' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 24, lineHeight: 1.5, fontFamily: 'var(--font-display)' }}>
                {currentQuestion.question}
              </p>

              <div style={{ display: 'grid', gap: 10 }}>
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswers[currentIndex] === option;
                  const hasAnswered = selectedAnswers[currentIndex] !== undefined;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const letter = String.fromCharCode(65 + idx);

                  let borderColor = 'rgba(255,255,255,0.08)';
                  let bg = 'rgba(255,255,255,0.02)';
                  let color = 'var(--text-primary)';
                  let optOpacity = 1;

                  if (hasAnswered) {
                    if (isCorrect) { borderColor = 'rgba(34,211,167,0.5)'; bg = 'var(--success-glow)'; color = 'var(--success)'; }
                    else if (isSelected) { borderColor = 'rgba(255,77,109,0.5)'; bg = 'var(--error-glow)'; color = 'var(--error)'; }
                    else { optOpacity = 0.45; }
                  }

                  return (
                    <motion.button
                      key={idx}
                      onClick={() => handleOptionSelect(option, idx)}
                      disabled={hasAnswered}
                      whileHover={!hasAnswered ? { scale: 1.01, x: 4 } : {}}
                      whileTap={!hasAnswered ? { scale: 0.98 } : {}}
                      animate={shakeIdx === idx ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                      transition={{ duration: 0.4 }}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '14px 18px', borderRadius: 'var(--radius-md)',
                        border: `1px solid ${borderColor}`, background: bg, color,
                        fontSize: '0.92rem', cursor: hasAnswered ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 12,
                        fontFamily: 'var(--font-body)',
                        opacity: optOpacity,
                      }}
                    >
                      <span style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 800, fontFamily: 'var(--font-display)',
                      }}>
                        {letter}
                      </span>
                      <span style={{ flex: 1 }}>{option}</span>
                      {hasAnswered && isCorrect && <CheckCircle size={18} />}
                      {hasAnswered && isSelected && !isCorrect && <XCircle size={18} />}
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {selectedAnswers[currentIndex] !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      marginTop: 20, padding: 16, borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.02)',
                      borderLeft: `3px solid ${selectedAnswers[currentIndex] === currentQuestion.correctAnswer ? 'var(--success)' : 'var(--error)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontWeight: 700, fontSize: '0.85rem', color: selectedAnswers[currentIndex] === currentQuestion.correctAnswer ? 'var(--success)' : 'var(--error)' }}>
                      {selectedAnswers[currentIndex] === currentQuestion.correctAnswer ? <><CheckCircle size={14} /> Correct!</> : <><XCircle size={14} /> Incorrect</>}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {currentQuestion.explanation || 'No explanation provided.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedAnswers[currentIndex] !== undefined && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Button variant="primary" onClick={handleNext} style={{ width: '100%', height: 48 }} icon={<ChevronRight size={18} />}>
                    {currentIndex === questions.length - 1 ? 'Finish & View Score' : 'Next Question'}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Results */
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ width: '100%', maxWidth: 620, marginTop: 12 }}
          >
            <div className="glass-panel glass-panel-glow" style={{ padding: 36, textAlign: 'center', marginBottom: 24, borderRadius: 'var(--radius-xl)' }}>
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                {percentage >= 80 ? <Trophy size={52} color="var(--warning)" style={{ margin: '0 auto 16px' }} /> : <Award size={52} color="var(--primary-hover)" style={{ margin: '0 auto 16px' }} />}
              </motion.div>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Quiz Complete!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 28, fontSize: '0.9rem' }}>
                Completed in {formatTime(timer)}
              </p>

              <ProgressRing
                percent={percentage}
                size={140}
                strokeWidth={10}
                label={`${percentage}%`}
                sublabel={`${score} / ${questions.length}`}
              />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                style={{ fontSize: '1rem', fontWeight: 600, margin: '28px 0 24px', color: 'var(--text-secondary)' }}
              >
                {percentage === 100 ? '🎉 Perfect score! You nailed it!'
                  : percentage >= 80 ? 'Great job! You\'ve mastered most concepts!'
                  : percentage >= 50 ? 'Good effort! Review and re-test to improve.'
                  : 'Keep studying — re-test wrong answers to level up.'}
              </motion.p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                {score < questions.length && (
                  <Button variant="primary" onClick={handleRetestWrong} icon={<RefreshCw size={14} />}>
                    Re-test Wrong Answers
                  </Button>
                )}
                <Button variant="secondary" onClick={handleResetFull}>
                  {isRetestMode ? 'Full Original Quiz' : 'Try Again'}
                </Button>
              </div>
            </div>

            {/* Review */}
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 14, fontFamily: 'var(--font-display)' }}>Question Review</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {questions.map((q, idx) => {
                const isCorrect = selectedAnswers[idx] === q.correctAnswer;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.06 }}
                    className="glass-panel"
                    style={{
                      padding: 18, borderRadius: 'var(--radius-md)',
                      borderLeft: `3px solid ${isCorrect ? 'var(--success)' : 'var(--error)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {isCorrect ? <CheckCircle size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={16} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />}
                      <div>
                        <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 6 }}>{q.question}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Your answer: <span style={{ color: isCorrect ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>{selectedAnswers[idx] || 'None'}</span>
                        </p>
                        {!isCorrect && (
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                            Correct: <span style={{ color: 'var(--success)', fontWeight: 600 }}>{q.correctAnswer}</span>
                          </p>
                        )}
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                          {q.explanation}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
