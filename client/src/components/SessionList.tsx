import { motion } from 'framer-motion';
import { Layers, CheckSquare, Trash2, Calendar, Plus, Bookmark, Target } from 'lucide-react';
import type { Session } from '../utils/types';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (session: Session) => void;
  onDeleteSession: (id: string) => void;
  onNewSession: () => void;
}

export default function SessionList({
  sessions,
  activeSessionId,
  onDeleteSession,
  onNewSession,
  onSelectSession
}: SessionListProps) {
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Compute stats across all saved sessions
  const totalMasteredItems = sessions.reduce((acc, s) => {
    if (s.data.type === 'flashcards') {
      return acc + s.data.cards.filter(c => c.mastered).length;
    }
    return acc;
  }, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel" 
      style={{
        padding: '24px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '400px',
        border: '1px solid var(--border-thin)',
        background: 'rgba(5, 6, 10, 0.4)'
      }}
    >
      {/* Sidebar Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '14px',
        borderBottom: '1px solid var(--border-thin)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
          <Bookmark size={16} color="var(--primary-hover)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Workspace Library</h3>
        </div>
        <span style={{
          fontSize: '0.75rem',
          background: 'rgba(255,255,255,0.04)',
          padding: '3px 10px',
          borderRadius: '20px',
          color: 'var(--text-secondary)',
          border: '1px solid rgba(255,255,255,0.03)',
          fontFamily: 'var(--font-mono)'
        }}>
          {sessions.length} decks
        </span>
      </div>

      {/* Study stats badge */}
      {sessions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{
            background: 'rgba(0, 194, 255, 0.04)',
            border: '1px solid rgba(0, 194, 255, 0.12)',
            padding: '10px 14px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Target size={16} color="var(--secondary)" />
            <div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Mastered</p>
              <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 800 }}>{totalMasteredItems} Cards</p>
            </div>
          </div>
        </div>
      )}

      {/* New Study Session CTA */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNewSession}
        className="glass-btn glass-btn-primary"
        style={{
          width: '100%',
          marginBottom: '20px',
          padding: '12px 18px',
          fontSize: '0.85rem',
          height: '42px',
          justifyContent: 'center',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Plus size={15} />
        <span>Create Workspace</span>
      </motion.button>

      {/* Scrollable listing */}
      <div style={{
        flexGrow: 1,
        overflowY: 'auto',
        display: 'grid',
        gap: '12px',
        alignContent: 'start',
        maxHeight: '440px',
        paddingRight: '6px'
      }}>
        {sessions.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 10px',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            fontFamily: 'var(--font-display)'
          }}>
            No saved configurations.<br/>Start by pasting some notes above.
          </div>
        ) : (
          <motion.div 
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.08 } }
            }}
            initial="hidden"
            animate="show"
            style={{ display: 'grid', gap: '10px' }}
          >
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              const isFlashcard = session.data.type === 'flashcards';
              
              // Get item counts
              let statLabel = '';
              if (session.data.type === 'flashcards') {
                const mastered = session.data.cards.filter((c) => c.mastered).length;
                statLabel = `Mastery: ${mastered}/${session.data.cards.length}`;
              } else {
                statLabel = `${session.data.questions.length} questions`;
              }

              return (
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  style={{
                    padding: '14px',
                    borderRadius: '14px',
                    border: '1px solid',
                    borderColor: isActive ? 'var(--primary)' : 'var(--border-thin)',
                    background: isActive ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.005)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    position: 'relative',
                    boxShadow: isActive ? '0 8px 24px -6px rgba(139, 92, 246, 0.2)' : 'none'
                  }}
                  className={!isActive ? "session-item-hover" : ""}
                  whileHover={{ scale: isActive ? 1 : 1.01 }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingRight: '28px' }}>
                    {/* Icon tag */}
                    <div style={{
                      color: isFlashcard ? 'var(--secondary)' : 'var(--primary-hover)',
                      marginTop: '3px',
                      flexShrink: 0
                    }}>
                      {isFlashcard ? <Layers size={14} /> : <CheckSquare size={14} />}
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <h4 style={{
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: isActive ? '#fff' : 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px',
                        letterSpacing: '-0.01em'
                      }}>
                        {session.data.title}
                      </h4>
                      
                      {/* Sub-label metrics */}
                      <p style={{
                        fontSize: '0.75rem',
                        color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '10px'
                      }}>
                        {statLabel}
                      </p>

                      {/* Calendar Date indicator */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        <Calendar size={10} />
                        <span>{formatDate(session.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delete Trash command */}
                  <motion.button
                    whileHover={{ scale: 1.15 }}
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onDeleteSession(session.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      transition: 'color var(--transition-fast)',
                      padding: '3px'
                    }}
                    className="trash-btn-hover"
                    title="Remove Deck"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <style>{`
        .session-item-hover:hover {
          background: rgba(255, 255, 255, 0.02) !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
        }
        .trash-btn-hover:hover {
          color: var(--error) !important;
        }
      `}</style>
    </motion.div>
  );
}
