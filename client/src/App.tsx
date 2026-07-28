import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import StudyInput from './components/StudyInput';
import Flashcards from './components/Flashcards';
import Quiz from './components/Quiz';
import RefinementPanel from './components/RefinementPanel';
import SessionList from './components/SessionList';
import AnimatedBackground from './components/effects/AnimatedBackground';
import LoadingScreen from './components/effects/LoadingScreen';
import CommandPalette from './components/ui/CommandPalette';
import SettingsModal from './components/ui/SettingsModal';
import { ToastProvider, useToast } from './components/ui/Toast';
import type { StudyDeck, Session } from './utils/types';
import { generateStudyDeck, type ApiErrorCode } from './utils/api';
import { ArrowLeft, Layers, CheckSquare } from 'lucide-react';
import Button from './components/ui/Button';
import GlassPanel from './components/ui/GlassPanel';

function AppContent() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentDeck, setCurrentDeck] = useState<StudyDeck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<ApiErrorCode | null>(null);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);
  const [commandOpen, setCommandOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const activeRequestRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aetherstudy_sessions');
      if (stored) setSessions(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load sessions', e);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen((p) => !p);
      }
      if (e.key === 'Escape') {
        setCommandOpen(false);
        setSettingsOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleGenerate = async (notes: string, type: 'flashcards' | 'quiz', count: number) => {
    if (activeRequestRef.current) activeRequestRef.current.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setIsLoading(true);
    setError(null);
    setErrorCode(null);

    try {
      const data = await generateStudyDeck(notes, type, count, controller.signal);
      const newSession: Session = {
        id: crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        notes: notes.length > 80 ? notes.substring(0, 80) + '...' : notes,
        data,
      };
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      localStorage.setItem('aetherstudy_sessions', JSON.stringify(updatedSessions));
      setCurrentDeck(data);
      setActiveSessionId(newSession.id);
      toast(`${type === 'flashcards' ? 'Flashcards' : 'Quiz'} generated successfully!`, 'success');
    } catch (err: any) {
      if (err.name === 'AbortError' || err.code === 'ABORT') return;
      setError(err.message || 'Generation failed.');
      setErrorCode(err.code ?? null);
      toast(err.message || 'Generation failed.', 'error');
    } finally {
      if (activeRequestRef.current === controller) {
        setIsLoading(false);
        activeRequestRef.current = null;
      }
    }
  };

  const handleRefineSuccess = (refinedData: StudyDeck, instruction: string) => {
    setCurrentDeck(refinedData);
    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId
          ? { ...s, notes: `${s.notes} (Refined: "${instruction.substring(0, 20)}...")`, data: refinedData }
          : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('aetherstudy_sessions', JSON.stringify(updatedSessions));
    }
    toast('Deck refined successfully!', 'success');
  };

  const handleUpdateDeck = (updatedDeck: StudyDeck) => {
    setCurrentDeck(updatedDeck);
    if (activeSessionId) {
      const updatedSessions = sessions.map((s) =>
        s.id === activeSessionId ? { ...s, data: updatedDeck } : s
      );
      setSessions(updatedSessions);
      localStorage.setItem('aetherstudy_sessions', JSON.stringify(updatedSessions));
    }
  };

  const handleSelectSession = (session: Session) => {
    if (activeRequestRef.current) { activeRequestRef.current.abort(); setIsLoading(false); }
    setActiveSessionId(session.id);
    setCurrentDeck(session.data);
    setError(null);
    setErrorCode(null);
  };

  const handleDeleteSession = (id: string) => {
    const updatedSessions = sessions.filter((s) => s.id !== id);
    setSessions(updatedSessions);
    localStorage.setItem('aetherstudy_sessions', JSON.stringify(updatedSessions));
    if (activeSessionId === id) { setActiveSessionId(null); setCurrentDeck(null); }
    toast('Deck deleted.', 'info');
  };

  const handleNewSession = () => {
    if (activeRequestRef.current) { activeRequestRef.current.abort(); setIsLoading(false); }
    setActiveSessionId(null);
    setCurrentDeck(null);
    setError(null);
    setErrorCode(null);
  };

  return (
    <>
      <AnimatePresence>
        {showLoadingScreen && (
          <LoadingScreen onComplete={() => setShowLoadingScreen(false)} />
        )}
      </AnimatePresence>

      <AnimatedBackground />

      <div className="app-shell">
        <div className="container">
          <Header
            onOpenCommand={() => setCommandOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 24, flexGrow: 1 }}>
            <aside style={{ gridColumn: 'span 12', order: 2 }} className="sidebar-grid-col">
              <SessionList
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                onNewSession={handleNewSession}
              />
            </aside>

            <main style={{ gridColumn: 'span 12', order: 1 }} className="main-grid-col">
              <AnimatePresence mode="wait">
                {currentDeck === null ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <HeroSection />
                    <StudyInput
                      onGenerate={handleGenerate}
                      isLoading={isLoading}
                      error={error}
                      errorCode={errorCode}
                      onClearError={() => {
                        setError(null);
                        setErrorCode(null);
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="deck"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                  >
                    <div style={{ alignSelf: 'flex-start', marginBottom: 24, width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Button variant="secondary" onClick={handleNewSession} style={{ padding: '8px 16px', fontSize: '0.82rem' }} icon={<ArrowLeft size={16} />}>
                        Back to Generator
                      </Button>
                      <motion.div
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600,
                          padding: '6px 14px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        {currentDeck.type === 'flashcards' ? (
                          <><Layers size={15} color="var(--cyan)" /> Flashcards</>
                        ) : (
                          <><CheckSquare size={15} color="var(--magenta)" /> Quiz</>
                        )}
                      </motion.div>
                    </div>

                    <GlassPanel glow style={{ width: '100%', padding: '36px 32px', display: 'flex', justifyContent: 'center' }}>
                      {currentDeck.type === 'flashcards' ? (
                        <Flashcards deck={currentDeck} onUpdateDeck={handleUpdateDeck} />
                      ) : (
                        <Quiz deck={currentDeck} />
                      )}
                    </GlassPanel>

                    <RefinementPanel currentData={currentDeck} onRefineSuccess={handleRefineSuccess} />
                  </motion.div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>

      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onNewSession={handleNewSession}
        onOpenSettings={() => { setCommandOpen(false); setSettingsOpen(true); }}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />

      <style>{`
        @media(min-width: 900px) {
          .sidebar-grid-col { grid-column: span 4 !important; order: 1 !important; }
          .main-grid-col { grid-column: span 8 !important; order: 2 !important; }
        }
      `}</style>
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
