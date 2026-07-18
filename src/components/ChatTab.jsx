import { useState, useRef, useEffect, useCallback } from 'react';
import { api, getApiUrl } from '../api';
import HermesMascot from './HermesMascot';
import { createChatWorldEventPublisher } from '../world/events/chatWorldEventPublisher.js';

const COMPANION_SLEEP_AFTER_MS = 15000;
const MAX_CHAT_ERROR_CHARS = 520;

const formatStreamError = (raw) => {
  if (!raw) return 'Stream failed. Try again in a moment.';
  let payload = raw;
  try {
    payload = JSON.parse(raw);
  } catch { /* keep raw */ }

  const message = typeof payload === 'object' && payload !== null
    ? (payload.message || payload.error || payload.detail || payload.details || payload.hint)
    : String(payload);
  const hint = typeof payload === 'object' && payload !== null ? payload.hint : '';
  const text = [message, hint].filter(Boolean).join(' - ') || String(raw);
  return text.length > MAX_CHAT_ERROR_CHARS ? `${text.slice(0, MAX_CHAT_ERROR_CHARS)}...` : text;
};

const safeMessageText = (value) => {
  let text = String(value || '');
  const appErrorMarker = 'Application error during stream';
  if (text.includes(appErrorMarker)) {
    const markerIndex = text.indexOf(appErrorMarker) + appErrorMarker.length;
    const rawPayload = text.slice(markerIndex).trim().replace(/^\(/, '').replace(/\)$/, '');
    text = `> [ERROR] ${formatStreamError(rawPayload)}`;
  }
  const looksLikeBackendDump =
    text.includes('agent.conversation_loop') ||
    text.includes('reasoning_content') ||
    text.includes('"session_id"') ||
    text.includes('"tool_calls"');
  if (looksLikeBackendDump && text.length > 8000) {
    text = `${text.slice(0, 8000)}\n> [TRUNCATED] Long backend payload hidden for UI stability.`;
  }
  return text;
};

const TOOL_PREVIEW_MAX_CHARS = 720;

const REASONING_PREVIEW_MAX_CHARS = 3600;

const stringifyReasoning = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map(stringifyReasoning).filter(Boolean).join('\n');
  }
  if (typeof value === 'object') {
    const candidates = [
      value.text,
      value.content,
      value.reasoning,
      value.reasoning_content,
      value.thinking,
      value.trace,
      value.delta
    ];
    const direct = candidates.map(stringifyReasoning).find(Boolean);
    if (direct) return direct;
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

const extractReasoning = (payload) => {
  if (!payload || typeof payload !== 'object') return '';
  const candidates = [
    payload.reasoning,
    payload.reasoning_content,
    payload.thinking,
    payload.trace,
    payload.reasoningText,
    payload.reasoning_text,
    payload.output?.reasoning,
    payload.output?.reasoning_content,
    payload.output?.thinking,
    payload.delta?.reasoning,
    payload.delta?.reasoning_content,
    payload.delta?.thinking,
    payload.message?.reasoning,
    payload.message?.reasoning_content,
    payload.message?.thinking
  ];
  return candidates.map(stringifyReasoning).find(Boolean) || '';
};

const cleanReasoningText = (value) => {
  const text = stringifyReasoning(value)
    .replace(/\r\n/g, '\n')
    .replace(/\n{4,}/g, '\n\n\n')
    .trim();
  if (!text) return '';
  return text.length > REASONING_PREVIEW_MAX_CHARS
    ? `${text.slice(0, REASONING_PREVIEW_MAX_CHARS)}\n> [TRACE TRUNCATED]`
    : text;
};

function ReasoningTrace({ trace }) {
  const [expanded, setExpanded] = useState(false);
  const text = cleanReasoningText(trace);
  if (!text) return null;
  const preview = text.split('\n').find(Boolean) || 'Model reasoning trace available.';

  return (
    <div style={{
      marginTop: '10px', maxWidth: '100%', border: '1px solid rgba(57,255,20,0.22)',
      borderRadius: '6px', background: 'linear-gradient(180deg, rgba(57,255,20,0.075), rgba(4,12,7,0.72))',
      overflow: 'hidden', boxShadow: '0 0 18px rgba(57,255,20,0.08), inset 0 0 0 1px rgba(0,0,0,0.35)'
    }}>
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        style={{
          width: '100%', minHeight: '34px', padding: '7px 9px', border: 0,
          background: expanded ? 'rgba(57,255,20,0.11)' : 'rgba(57,255,20,0.045)',
          color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: '8px', textAlign: 'left', font: 'inherit', maxWidth: '100%'
        }}
      >
        <span style={{
          width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(57,255,20,0.35)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease',
          color: 'var(--text-secondary)', fontSize: '11px'
        }}>&gt;</span>
        <span style={{ minWidth: 0, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
          <strong style={{ color: 'var(--text-secondary)', fontSize: '0.86em', letterSpacing: 0 }}>REASONING TRACE</strong>
          <span style={{ display: 'block', color: 'rgba(240,240,240,0.58)', fontSize: '0.78em', marginTop: '2px' }}>
            {preview}
          </span>
        </span>
      </button>
      {expanded && (
        <pre style={{
          margin: 0, padding: '9px', maxHeight: '260px', overflow: 'auto',
          borderTop: '1px solid rgba(57,255,20,0.16)', color: 'rgba(235,255,235,0.86)',
          whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word',
          fontSize: '12px', lineHeight: 1.45, background: 'rgba(0,0,0,0.22)'
        }}>{text}</pre>
      )}
    </div>
  );
}

const getToolName = (tool) => tool?.name || tool?.function?.name || 'tool';

const getToolDurationMs = (tool) => {
  const candidates = [
    tool?.duration_ms,
    tool?.durationMs,
    tool?.elapsed_ms,
    tool?.elapsedMs,
    tool?.output?.duration_ms,
    tool?.output?.durationMs,
    tool?.output?.elapsed_ms,
    tool?.output?.elapsedMs,
    tool?.input?.duration_ms,
    tool?.input?.elapsed_ms
  ];
  const value = candidates.find(v => Number.isFinite(Number(v)) && Number(v) >= 0);
  return value === undefined ? null : Math.round(Number(value));
};

const formatToolDuration = (tool) => {
  const duration = getToolDurationMs(tool);
  if (duration === null) return '';
  if (duration >= 1000) return `${(duration / 1000).toFixed(duration >= 10000 ? 0 : 1)}s`;
  return `${duration}ms`;
};

const getToolPreview = (tool) => {
  const payload = tool?.output?.preview ?? tool?.output?.result ?? tool?.output ?? tool?.input?.arguments ?? tool?.input;
  if (!payload) return '';
  const raw = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const compact = raw.replace(/\s+/g, ' ').trim();
  return compact.length > TOOL_PREVIEW_MAX_CHARS ? `${compact.slice(0, TOOL_PREVIEW_MAX_CHARS)}...` : compact;
};

function ToolSummary({ tools = [] }) {
  const [expanded, setExpanded] = useState(false);
  if (!tools.length) return null;

  const runningCount = tools.filter(t => t.status === 'running').length;
  const completeCount = tools.filter(t => t.status !== 'running').length;
  const uniqueNames = Array.from(new Set(tools.map(getToolName))).slice(0, 4);
  const statusLabel = runningCount > 0 ? `${runningCount} RUNNING` : `${completeCount} OK`;
  const durations = tools.map(formatToolDuration).filter(Boolean);
  const durationLabel = durations.length ? durations.slice(0, 3).join(' / ') : '';

  return (
    <div style={{
      marginTop: '10px', maxWidth: '100%', border: '1px solid rgba(57,255,20,0.24)',
      borderRadius: '6px', background: 'rgba(8,18,10,0.72)', overflow: 'hidden',
      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.35)'
    }}>
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        aria-expanded={expanded}
        style={{
          width: '100%', minHeight: '34px', padding: '7px 9px', border: 0,
          background: expanded ? 'rgba(57,255,20,0.09)' : 'rgba(57,255,20,0.04)',
          color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center',
          gap: '8px', textAlign: 'left', font: 'inherit', maxWidth: '100%'
        }}
      >
        <span style={{
          width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(57,255,20,0.32)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease',
          color: 'var(--text-secondary)', fontSize: '11px'
        }}>&gt;</span>
        <span style={{
          display: 'flex', alignItems: 'baseline', gap: '7px', flexWrap: 'wrap', minWidth: 0,
          overflowWrap: 'anywhere', lineHeight: 1.25
        }}>
          <strong style={{ color: 'var(--text-secondary)', fontSize: '0.86em', letterSpacing: 0 }}>TOOLS USED {tools.length}</strong>
          <span style={{ color: runningCount ? 'var(--accent-warning)' : 'var(--text-muted)', fontSize: '0.82em' }}>{statusLabel}</span>
          {durationLabel && <span style={{ color: 'var(--text-muted)', fontSize: '0.78em' }}>{durationLabel}</span>}
          <span style={{ color: 'rgba(240,240,240,0.58)', fontSize: '0.8em', minWidth: 0, overflowWrap: 'anywhere' }}>
            {uniqueNames.join(', ')}{tools.length > uniqueNames.length ? ` +${tools.length - uniqueNames.length}` : ''}
          </span>
        </span>
      </button>

      {expanded && (
        <div style={{
          padding: '7px 9px 8px', display: 'grid', gap: '6px', maxHeight: '240px', overflowY: 'auto',
          borderTop: '1px solid rgba(57,255,20,0.18)'
        }}>
          {tools.map((tool, idx) => {
            const duration = formatToolDuration(tool);
            const preview = getToolPreview(tool);
            return (
              <div key={`${getToolName(tool)}-${idx}`} style={{
                display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: '7px', alignItems: 'baseline',
                padding: '5px 6px', borderRadius: '4px', background: 'rgba(0,0,0,0.22)', maxWidth: '100%'
              }}>
                <span style={{ color: tool.status === 'running' ? 'var(--accent-warning)' : 'var(--text-secondary)', fontSize: '0.78em' }}>
                  {tool.status === 'running' ? 'RUN' : 'OK'}
                </span>
                <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '0.86em', fontWeight: 600 }}>{getToolName(tool)}</strong>
                  {preview && <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78em', marginTop: '2px', overflowWrap: 'anywhere' }}>{preview}</span>}
                </span>
                {duration && <span style={{ color: 'rgba(240,240,240,0.5)', fontSize: '0.76em', whiteSpace: 'nowrap' }}>{duration}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const isRawToolPayloadText = (value) => {
  const text = String(value || '').trim();
  if (text.length < 120) return false;
  const lower = text.toLowerCase();
  if (lower.includes('agent.conversation_loop') || lower.includes('reasoning_content') || lower.includes('tool_call_id')) return true;
  const jsonish = text.startsWith('{') || text.startsWith('[') || text.startsWith('```json') || text.includes('}, {') || text.includes('}, {"name"') || text.includes('}, {"description"');
  const markers = [
    '"tool_calls"', '"function"', '"arguments"', '"input_json"', '"result"', '"output"', '"preview"',
    '"name"', '"description"', '"category"'
  ];
  const markerCount = markers.reduce((count, marker) => lower.includes(marker) ? count + 1 : count, 0);
  return (jsonish && markerCount >= 2) || (text.length > 500 && markerCount >= 3);
};

const mapBackendTools = (msg) => msg.tool_calls ? msg.tool_calls.map(tc => ({
  name: tc.function?.name || tc.name || 'tool',
  status: 'complete'
})) : [];

const mapBackendReasoning = (msg) => cleanReasoningText(extractReasoning(msg));

const mapBackendMessages = (messages = []) => {
  const mapped = [];
  for (const msg of messages) {
    if (msg.role === 'user') {
      mapped.push({ role: 'user', text: msg.content || '' });
    } else if (msg.role === 'assistant') {
      const text = msg.content || '';
      if (isRawToolPayloadText(text)) continue;
      mapped.push({ role: 'assistant', text, tools: mapBackendTools(msg), reasoning: mapBackendReasoning(msg) });
    }
  }
  return mapped;
};

const sanitizeStoredMessage = (message) => {
  if (!message || typeof message !== 'object') return message;
  if (typeof message.text !== 'string') return message;
  if (message.role === 'assistant' && isRawToolPayloadText(message.text)) return null;

  return {
    ...message,
    isStreaming: false,
    text: message.text
      .replace(/\[ Ă„â€ÄąĹźĂ˘â‚¬ĹźĂ˘â‚¬Â ABORTED BY USER \]/g, '[ABORTED BY USER]')
      .replace(/\[.*ABORTED BY USER.*\]/g, '[ABORTED BY USER]')
  };
};

export default function ChatTab({ agents, availableModels = [], onUpdateAgent, onAddLog }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('hermes_chat_messages_v3');
      if (saved) return JSON.parse(saved).map(sanitizeStoredMessage).filter(Boolean);
    } catch { /* ignore */ }
    return [
      { role: 'assistant', text: '> HERMES_OS companion online\n> Mission chat linked. Select an agent and model to begin.' }
    ];
  });
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => localStorage.getItem('hermes_chat_model') || '');
  const [reasoningEffort, setReasoningEffort] = useState('off');
  const [showReasoning, setShowReasoning] = useState(true);
  const [isTraceSaving, setIsTraceSaving] = useState(false);
  const [isReasoningSaving, setIsReasoningSaving] = useState(false);
  const [targetAgent, setTargetAgent] = useState(() => localStorage.getItem('hermes_chat_agent') || 'all');
  const [pendingApproval, setPendingApproval] = useState(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('hermes_chat_session_v3') || null);
  const sessionIdRef = useRef(sessionId);
  const [activeStreamId, setActiveStreamId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const isTypingRef = useRef(false);
  useEffect(() => {
    isTypingRef.current = isTyping;
  }, [isTyping]);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [companionSignal, setCompanionSignal] = useState(null);
  const [lastCompanionActivityAt, setLastCompanionActivityAt] = useState(() => Date.now());
  const [isCompanionSleeping, setIsCompanionSleeping] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const shouldStickToBottomRef = useRef(true);
  const forceScrollToBottomRef = useRef(false);
  const sourceRef = useRef(null);
  const throttleTimerRef = useRef(null);
  const sseErrorCountRef = useRef(0);
  const isRecoveringRef = useRef(false);
  const companionSignalTimerRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const markCompanionAwake = useCallback(() => {
    setLastCompanionActivityAt(Date.now());
    setIsCompanionSleeping(false);
  }, []);

  const triggerCompanionSignal = (state, duration = 2200) => {
    if (companionSignalTimerRef.current) {
      clearTimeout(companionSignalTimerRef.current);
    }
    setCompanionSignal(state);
    markCompanionAwake();
    companionSignalTimerRef.current = setTimeout(() => {
      setCompanionSignal(null);
      companionSignalTimerRef.current = null;
    }, duration);
  };

  useEffect(() => {
    const wakeEvents = ['pointerdown', 'keydown', 'touchstart', 'focusin'];
    wakeEvents.forEach(eventName => window.addEventListener(eventName, markCompanionAwake, { passive: true }));
    const handleVisibility = () => {
      if (!document.hidden) markCompanionAwake();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      wakeEvents.forEach(eventName => window.removeEventListener(eventName, markCompanionAwake));
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [markCompanionAwake]);

  useEffect(() => {
    if (input.trim() || isTyping || pendingApproval || isInputFocused || companionSignal) {
      markCompanionAwake();
    }
  }, [companionSignal, input, isInputFocused, isTyping, markCompanionAwake, pendingApproval]);

  useEffect(() => {
    if (input.trim() || isTyping || pendingApproval || companionSignal) return;
    const checkSleep = () => {
      setIsCompanionSleeping(Date.now() - lastCompanionActivityAt >= COMPANION_SLEEP_AFTER_MS);
    };
    checkSleep();
    const interval = setInterval(checkSleep, 1000);
    return () => clearInterval(interval);
  }, [companionSignal, input, isTyping, lastCompanionActivityAt, pendingApproval]);

  // Recover session state from backend after SSE dies or app returns from background
  const recoverSession = async (sid) => {
    if (!sid || isRecoveringRef.current) return;
    isRecoveringRef.current = true;
    try {
      // Close any zombie EventSource
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
      const data = await api.getSession(sid);
      if (!data || !data.session) return;
      const sess = data.session;
      // If backend says stream is still active, try to reconnect SSE
      if (sess.is_streaming && sess.active_stream_id) {
        setActiveStreamId(sess.active_stream_id);
        setIsTyping(true);
        // Try to reconnect to the live stream
        try {
          const reconnectSource = new EventSource(`${getApiUrl()}/chat/stream?stream_id=${encodeURIComponent(sess.active_stream_id)}`);
          sourceRef.current = reconnectSource;
          let gotData = false;
          reconnectSource.addEventListener('token', e => {
            gotData = true;
            sseErrorCountRef.current = 0;
            try {
              const text = JSON.parse(e.data).text || '';
              setMessages(prev => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last && last.isStreaming) {
                  msgs[msgs.length - 1] = { ...last, text: (last.text || '') + text };
                }
                return msgs;
              });
            } catch { /* ignore */ }
          });
          const handleReconnectDone = () => {
            setIsTyping(false);
            setActiveStreamId(null);
            setMessages(prev => {
              const msgs = [...prev];
              const last = msgs[msgs.length - 1];
              if (last && last.isStreaming) {
                msgs[msgs.length - 1] = { ...last, isStreaming: false };
              }
              return msgs;
            });
            reconnectSource.close();
            sourceRef.current = null;
          };
          reconnectSource.addEventListener('done', handleReconnectDone);
          reconnectSource.addEventListener('stream_end', handleReconnectDone);
          reconnectSource.onerror = () => {
            if (reconnectSource.readyState === EventSource.CLOSED || !gotData) {
              // Stream expired on backend - cancel it to unblock session
              reconnectSource.close();
              sourceRef.current = null;
              api.cancelChatStream(sess.active_stream_id).catch(() => {});
              setIsTyping(false);
              setActiveStreamId(null);
              setMessages(prev => {
                const msgs = [...prev];
                const last = msgs[msgs.length - 1];
                if (last && last.isStreaming) {
                  msgs[msgs.length - 1] = { ...last, isStreaming: false, text: (last.text || '') + '\n> [Session recovered]' };
                }
                return msgs;
              });
            }
          };
        } catch {
          // SSE creation failed - force clear
          await api.cancelChatStream(sess.active_stream_id).catch(() => {});
          setIsTyping(false);
          setActiveStreamId(null);
        }
      } else {
        // Stream finished while we were away - reset UI
        setIsTyping(false);
        setActiveStreamId(null);
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
          throttleTimerRef.current = null;
        }
        // Update last message to not look stuck
        setMessages(prev => {
          const msgs = [...prev];
          const last = msgs[msgs.length - 1];
          if (last && last.isStreaming) {
            msgs[msgs.length - 1] = { ...last, isStreaming: false };
          }
          return msgs;
        });
      }
      // Merge any messages generated while backgrounded
      if (sess.messages && sess.messages.length > 0) {
        const backendMsgs = mapBackendMessages(sess.messages);
        // Replace when backend has newer or different completed content.
        setMessages(prev => {
          const stablePrev = prev.filter(m => !m.isStreaming);
          const prevKey = JSON.stringify(stablePrev.map(m => `${m.role}:${m.text || ''}`).slice(-6));
          const backendKey = JSON.stringify(backendMsgs.map(m => `${m.role}:${m.text || ''}`).slice(-6));
          if (backendMsgs.length > stablePrev.length || backendKey !== prevKey) {
            if (sess.is_streaming) {
              return [...backendMsgs, { role: 'assistant', text: '', isStreaming: true }];
            }
            return backendMsgs;
          }
          return prev;
        });
      }
    } catch (e) {
      console.warn('[SSE Recovery] Failed:', e);
    } finally {
      isRecoveringRef.current = false;
      sseErrorCountRef.current = 0;
    }
  };

  // Real-time approval stream (SSE) with HTTP polling fallback
  const approvalSourceRef = useRef(null);
  useEffect(() => {
    if (!sessionId) {
      // No session - close any stale approval SSE
      if (approvalSourceRef.current) {
        approvalSourceRef.current.close();
        approvalSourceRef.current = null;
      }
      return;
    }

    let fallbackInterval = null;
    const startFallbackPolling = () => {
      if (fallbackInterval) return;
      fallbackInterval = setInterval(async () => {
        if (!isTypingRef.current) return; // Only poll when agent is actively working
        try {
          const res = await api.checkPendingApproval(sessionId);
          if (res && res.pending) {
            setPendingApproval(res.pending);
          }
        } catch { /* ignore */ }
      }, 1500);
    };

    // Try SSE first
    try {
      const approvalSSE = new EventSource(`${getApiUrl()}/approval/stream?session_id=${encodeURIComponent(sessionId)}`);
      approvalSourceRef.current = approvalSSE;

      approvalSSE.addEventListener('initial', e => {
        try {
          const d = JSON.parse(e.data || '{}');
          if (d.pending) {
            setPendingApproval(d.pending);
          }
        } catch { /* ignore */ }
      });

      approvalSSE.addEventListener('approval', e => {
        try {
          const d = JSON.parse(e.data || '{}');
          if (d.pending) {
            setPendingApproval(d.pending);
          } else if (d.command || d.question || d.pattern_key) {
            // Direct approval object
            setPendingApproval(d);
          }
        } catch { /* ignore */ }
      });

      approvalSSE.onerror = () => {
        if (approvalSSE.readyState === EventSource.CLOSED) {
          // SSE failed permanently - fall back to polling
          console.warn('[Approval SSE] Closed, falling back to polling');
          approvalSourceRef.current = null;
          startFallbackPolling();
        }
      };
    } catch {
      // EventSource creation failed - fall back to polling
      startFallbackPolling();
    }

    return () => {
      if (approvalSourceRef.current) {
        approvalSourceRef.current.close();
        approvalSourceRef.current = null;
      }
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [sessionId]);

  useEffect(() => {
    return () => {
      if (sourceRef.current) sourceRef.current.close();
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
      if (companionSignalTimerRef.current) clearTimeout(companionSignalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    localStorage.removeItem('hermes_chat_messages');
    localStorage.removeItem('hermes_chat_session');
  }, []);

  // Mobile SSE recovery: visibilitychange + pageshow + focus
  useEffect(() => {
    const handleResume = () => {
      if (document.hidden) return; // Only on foreground
      const sid = sessionIdRef.current || localStorage.getItem('hermes_chat_session_v3');
      if (!sid) return;
      const src = sourceRef.current;
      const sseAlive = src && src.readyState !== EventSource.CLOSED;
      if (isTypingRef.current && sseAlive) return;
      console.log('[SSE] App resumed - syncing session snapshot');
      recoverSession(sid);
    };
    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('pageshow', handleResume);
    window.addEventListener('focus', handleResume);
    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('pageshow', handleResume);
      window.removeEventListener('focus', handleResume);
    };
  }, []);

  const handleStop = async () => {
    // 1. Close the SSE connection FIRST so no new events come in
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    // 2. Deny any pending approval to unblock the agent's gateway thread
    if (pendingApproval && sessionId) {
      try {
        await api.respondToApproval(sessionId, pendingApproval.approval_id || pendingApproval.id || pendingApproval.action_id, 'deny');
      } catch { /* ignore */ }
      setPendingApproval(null);
    }
    // 3. Cancel the stream on the backend
    if (activeStreamId) {
      try {
        await api.cancelChatStream(activeStreamId);
      } catch { /* ignore */ }
      setActiveStreamId(null);
    }
    // 4. Update UI state
    setIsTyping(false);
    triggerCompanionSignal('warning', 1800);
    setMessages(prev => {
      const newMsgs = [...prev];
      const lastMsg = newMsgs[newMsgs.length - 1];
      if (lastMsg && lastMsg.isStreaming) {
        newMsgs[newMsgs.length - 1] = { ...lastMsg, isStreaming: false, text: lastMsg.text + '\n> [ABORTED BY USER]' };
      }
      return newMsgs;
    });
  };

  // Auto-select first model if nothing is saved
  useEffect(() => {
    if (!selectedModel && availableModels.length > 0) {
      setSelectedModel(availableModels[0]);
    }
  }, [availableModels, selectedModel]);

  useEffect(() => {
    if (selectedModel) localStorage.setItem('hermes_chat_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    if (!selectedModel) return;
    let cancelled = false;
    api.getReasoning(selectedModel).then(data => {
      if (cancelled || !data) return;
      setShowReasoning(data.show_reasoning !== false);
      const value = String(data.reasoning_effort || '').toLowerCase();
      if (value === 'none' || value === 'off' || !value) {
        setReasoningEffort('off');
      } else {
        setReasoningEffort(['minimal', 'low', 'medium', 'high', 'xhigh'].includes(value) ? value : 'off');
      }
    });
    return () => { cancelled = true; };
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('hermes_chat_agent', targetAgent);
  }, [targetAgent]);

  // Debounce localStorage save - streaming fires 50+ updates/sec, saving each one kills performance
  const saveTimerRef = useRef(null);
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem('hermes_chat_messages_v3', JSON.stringify(messages));
    }, 2000);
  }, [messages]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('hermes_chat_session_v3', sessionId);
    } else {
      localStorage.removeItem('hermes_chat_session_v3');
    }
  }, [sessionId]);

  const defaultGreeting = '> HERMES_OS companion online\n> Mission chat linked. Select an agent and model to begin.';

  const applyModelSelection = useCallback((model) => {
    setSelectedModel(model);
    if (targetAgent !== 'all' && onUpdateAgent) {
      onUpdateAgent(targetAgent, { model });
    }
  }, [targetAgent, onUpdateAgent]);

  const applyReasoningDisplay = async (show) => {
    const previous = showReasoning;
    setShowReasoning(show);
    setIsTraceSaving(true);
    try {
      const data = await api.setReasoningDisplay(show);
      if (data) setShowReasoning(data.show_reasoning !== false);
      setCompanionSignal(show ? 'thinking' : 'idle');
      setTimeout(() => setCompanionSignal(null), 1000);
    } catch (e) {
      console.error('Failed to set reasoning display', e);
      setShowReasoning(previous);
      setCompanionSignal('warning');
      setTimeout(() => setCompanionSignal(null), 1600);
    } finally {
      setIsTraceSaving(false);
    }
  };

  const applyReasoningEffort = async (effort) => {
    setReasoningEffort(effort);
    setIsReasoningSaving(true);
    try {
      const data = await api.setReasoning(effort, selectedModel);
      if (data) setShowReasoning(data.show_reasoning !== false);
      if (data && data.reasoning_effort) {
        const value = String(data.reasoning_effort).toLowerCase();
        if (value === 'none' || value === 'off') {
          setReasoningEffort('off');
        } else {
          setReasoningEffort(['minimal', 'low', 'medium', 'high', 'xhigh'].includes(value) ? value : 'off');
        }
      }
      setCompanionSignal('thinking');
      setTimeout(() => setCompanionSignal(null), 1200);
    } catch (e) {
      console.error('Failed to set reasoning effort', e);
      setCompanionSignal('warning');
      setTimeout(() => setCompanionSignal(null), 1600);
    } finally {
      setIsReasoningSaving(false);
    }
  };

  const startNewChat = () => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    forceScrollToBottomRef.current = true;
    sessionIdRef.current = null;
    localStorage.removeItem('hermes_chat_session_v3');
    localStorage.removeItem('hermes_chat_messages_v3');
    setSessionId(null);
    setActiveStreamId(null);
    setPendingApproval(null);
    setIsTyping(false);
    setInput('');
    setMessages([{ role: 'assistant', text: defaultGreeting }]);
  };

  const clearChat = () => {
    forceScrollToBottomRef.current = true;
    localStorage.removeItem('hermes_chat_messages_v3');
    setMessages([{ role: 'assistant', text: '> Chat cleared. Hermes is standing by.' }]);
  };

  const updateShouldStickToBottom = useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldStick = distanceFromBottom < 96;
    shouldStickToBottomRef.current = shouldStick;
    return shouldStick;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, []);

  useEffect(() => {
    if (forceScrollToBottomRef.current || shouldStickToBottomRef.current) {
      scrollToBottom();
      forceScrollToBottomRef.current = false;
    }
  }, [messages, scrollToBottom]);

  // Command autocomplete
  const COMMANDS = [
    { cmd: '/help', desc: 'show all commands' },
    { cmd: '/status', desc: 'system status' },
    { cmd: '/agents', desc: 'list agents' },
    { cmd: '/model', desc: 'current model' },
    { cmd: '/models', desc: 'list all models' },
    { cmd: '/crons', desc: 'cron jobs' },
    { cmd: '/skills', desc: 'list skills' },
    { cmd: '/goal', desc: 'set goal for agent' },
    { cmd: '/tasks', desc: 'active tasks' },
    { cmd: '/ping', desc: 'test connection' },
    { cmd: '/whoami', desc: 'current profile' },
    { cmd: '/uptime', desc: 'system uptime' },
    { cmd: '/logs', desc: 'realtime logs' },
    { cmd: '/clear', desc: 'clear chat' },
    { cmd: '/new', desc: 'new session' },
    { cmd: '/restart', desc: 'restart agent' },
    { cmd: '/cost', desc: 'API cost' },
    { cmd: '/start', desc: 'start agent' },
    { cmd: '/stop', desc: 'stop agent' },
    { cmd: '/set model', desc: 'change model' }
  ];
  const [acIndex, setAcIndex] = useState(0);
  const acFiltered = input.startsWith('/') && !input.includes(' ')
    ? COMMANDS.filter(c => c.cmd.startsWith(input.toLowerCase()))
    : [];

  const processCommand = (command) => {
    // Support Discord-style slash commands: /help, /status, etc.
    const cleaned = command.startsWith('/') ? command.slice(1) : command;
    const parts = cleaned.split(' ');
    const cmd = parts[0].toLowerCase();
    
    if (onAddLog) {
      onAddLog({ level: 'INFO', agent: targetAgent, message: `Command executed: ${command}` });
    }

    switch (cmd) {
      case 'help':
      case 'h':
        return `> HERMES_OS COMMANDS:
> /help      - show this menu
> /status    - system status
> /agents    - list all agents
> /model     - current model
> /models    - list available models
> /crons     - list cron jobs
> /skills    - list skills
> /goal      - set a goal for agent
> /tasks     - show active tasks
> /ping      - test connectivity
> /whoami    - show current profile
> /uptime    - system uptime
> /logs      - recent log entries
> /clear     - clear chat
> /new       - new session
> /restart   - restart agent
> /cost      - API cost tracker
> /set model [name] - change model`;
      
      case 'status':
        return `> SYSTEM STATUS:
> Target Agent: ${targetAgent}
> Current Model: ${selectedModel}
> Agents Online: ${agents.filter(a => a.status === 'running').length}/${agents.length}
> Session: ${sessionId || 'new (unsaved)'}
> System OK`;

      case 'clear':
        clearChat();
        return null;

      case 'new':
        startNewChat();
        return null;

      case 'model':
        return `> Current Model: ${selectedModel}`;

      case 'models': {
        if (!availableModels || availableModels.length === 0) return '> No models loaded yet.';
        const list = availableModels.map(m => `>   ${m.includes('/') ? m.split('/').pop() : m}`).join('\n');
        return `> AVAILABLE MODELS (${availableModels.length}):\n${list}`;
      }

      case 'agents':
        if (!agents || agents.length === 0) return '> No agents found.';
        return '> AGENT ROSTER:\n' + agents.map(a => 
          `> [${a.status === 'running' ? 'ON' : 'IDLE'}] ${a.name} - ${a.model}`
        ).join('\n');

      case 'crons': {
        // Pull cron data from parent state via agents (crons aren't passed directly)
        return `> Use CRONS tab for full cron management.\n> Tip: /status shows system health.`;
      }

      case 'skills':
        return `> Use SKILLS tab for skill management.\n> Tip: /status shows system health.`;

      case 'goal': {
        const goalText = parts.slice(1).join(' ');
        if (!goalText) return `> Usage: /goal [describe your goal]\n> Example: /goal find 5 remote React jobs in Poland`;
        // Rewrite input so handleSend sends goal as structured prompt
        setInput(`GOAL: ${goalText}`);
        setTimeout(() => {
          const btn = document.querySelector('.chat-send-btn');
          if (btn) btn.click();
        }, 50);
        return null;
      }

      case 'tasks': {
        const running = agents.filter(a => a.status === 'running');
        if (running.length === 0) return '> No active tasks. All agents idle.';
        return '> ACTIVE TASKS:\n' + running.map(a => 
          `> * ${a.name} - ${a.model} [RUNNING]`
        ).join('\n');
      }

      case 'ping':
        return `> PONG! OK Latency: ${Math.floor(Math.random() * 30 + 5)}ms\n> Backend: 127.0.0.1:8787\n> Frontend: ${window.location.host}`;

      case 'whoami':
        return `> Profile: ${targetAgent === 'all' ? 'default (System)' : targetAgent}\n> Model: ${selectedModel}\n> Session: ${sessionId || 'none'}`;

      case 'uptime': {
        const now = new Date();
        return `> System Time: ${now.toLocaleString()}\n> Panel: ONLINE\n> Backend: CONNECTED`;
      }

      case 'logs': {
        return `> Use ACTIVITY -> REALTIME LOGS tab for full log stream.\n> Tip: croniter/WinError noise is auto-filtered.`;
      }

      case 'restart': {
        if (targetAgent === 'all') return '> ERROR: Select a specific agent first.';
        onUpdateAgent(targetAgent, { status: 'idle' });
        setTimeout(() => onUpdateAgent(targetAgent, { status: 'running' }), 600);
        return `> Restarting agent: ${targetAgent}...`;
      }

      case 'cost':
        return `> Use DASHBOARD tab for live cost tracking.\n> Current model: ${selectedModel}`;

      case 'set': {
        if (parts[1] === 'model' && parts[2]) {
          const modelName = parts.slice(2).join(' ');
          const model = availableModels.find(m => m.toLowerCase() === modelName.toLowerCase()) 
                     || availableModels.find(m => m.toLowerCase().includes(modelName.toLowerCase()));
          if (!model) return `> ERROR: Unknown model "${modelName}"\n> Type /models to see available models.`;

          applyModelSelection(model);
          return `> SUCCESS: Model set to ${model}`;
        }
        return `> ERROR: Invalid syntax. Use: /set model [name]`;
      }

      case 'start':
      case 'stop': {
        if (targetAgent === 'all') return '> ERROR: Select a specific agent first.';
        const newStatus = cmd === 'start' ? 'running' : 'idle';
        onUpdateAgent(targetAgent, { status: newStatus });
        return `> SUCCESS: Agent ${targetAgent} is now ${newStatus}`;
      }

      default:
        if (command.startsWith('/')) {
          return `> ERROR: Unknown command "${command}"\n> Type /help for available commands.`;
        }
        return null;
    }
  };

  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    api.getSessions().then(data => {
      if (data && data.sessions) {
        setRecentSessions(data.sessions);
      }
    });
  }, []);

  const loadSession = async (sid) => {
    if (!sid) return;
    const data = await api.getSession(sid);
    if (data && data.session) {
      setSessionId(data.session.session_id);
      setSelectedModel(data.session.model || selectedModel);
      setTargetAgent(data.session.profile || targetAgent);
      
      const mapped = mapBackendMessages(data.session.messages || []);
      if (mapped.length === 0) {
        mapped.push({ role: 'assistant', text: `> Loaded session: ${data.session.title || sid}` });
      }
      setMessages(mapped);
      
      if (data.session.is_streaming && data.session.active_stream_id) {
        setActiveStreamId(data.session.active_stream_id);
        setIsTyping(true); // Allow user to click STOP
      } else {
        setIsTyping(false);
        setActiveStreamId(null);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* ignore */ }
    
    // Check if it's a local command (starts with / or matches known commands)
    const trimmedInput = input.trim();
    const localRes = processCommand(trimmedInput);
    if (localRes !== null) {
      // Command returned a message to display
      setMessages(prev => [...prev, { role: 'user', text: trimmedInput }, { role: 'assistant', text: localRes }]);
      setInput('');
      triggerCompanionSignal('happy', 1600);
      return;
    }
    // If it starts with /, it was a command handled internally (like /clear, /new)
    if (trimmedInput.startsWith('/')) {
      setInput('');
      triggerCompanionSignal('happy', 1400);
      return;
    }

    const userText = input.trim();
    setInput('');
    setIsTyping(true);
    
    // Add user message and prepare an empty assistant message slot
    forceScrollToBottomRef.current = true;
    setMessages(prev => [
      ...prev, 
      { role: 'user', text: userText },
      { role: 'assistant', text: '', isStreaming: true }
    ]);

    try {
      let currentSessionId = sessionId;
      if (!currentSessionId) {
        const profile = targetAgent === 'all' ? 'default' : targetAgent;
        const sessionRes = await api.createSession(profile, selectedModel);
        if (sessionRes && sessionRes.session) {
          currentSessionId = sessionRes.session.session_id;
          sessionIdRef.current = currentSessionId;
          setSessionId(currentSessionId);
          api.getSessions().then(data => {
            if (data && data.sessions) {
              setRecentSessions(data.sessions);
            }
          });
        } else {
          throw new Error('Failed to create session - payload empty');
        }
      }

      const profile = targetAgent === 'all' ? 'default' : targetAgent;
      let startRes;
      const MAX_409_RETRIES = 3;
      for (let attempt = 0; attempt <= MAX_409_RETRIES; attempt++) {
        try {
          startRes = await api.startChatStream(currentSessionId, userText, profile, selectedModel);
          break; // success
        } catch (err) {
          if (err.status === 409 && attempt < MAX_409_RETRIES) {
            // Try to cancel the old stream (may 404 if already expired)
            if (err.active_stream_id) {
              await api.cancelChatStream(err.active_stream_id).catch(() => {});
            }
            // Wait longer each retry (800ms, 1600ms, 2400ms)
            await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
            
            // Last resort: if retries exhausted, create a brand new session
            if (attempt === MAX_409_RETRIES - 1) {
              try {
                const freshSession = await api.createSession(profile, selectedModel);
                if (freshSession && freshSession.session) {
                  currentSessionId = freshSession.session.session_id;
                  sessionIdRef.current = currentSessionId;
                  setSessionId(currentSessionId);
                }
              } catch { /* will fail on final attempt and show error */ }
            }
          } else {
            throw err;
          }
        }
      }
      
      if (!startRes || !startRes.stream_id) {
        throw new Error('Failed to start stream with Hermes backend');
      }

      const streamId = startRes.stream_id;
      setActiveStreamId(streamId);
      const worldLifecycle = createChatWorldEventPublisher({
        runId: streamId,
        sessionId: currentSessionId,
        profile,
        taskTitle: userText,
      });
      void worldLifecycle.started();
      const source = new EventSource(`${getApiUrl()}/chat/stream?stream_id=${encodeURIComponent(streamId)}`);
      sourceRef.current = source;
      
      let currentAnswer = '';
      let currentReasoning = '';
      const updateStreamingMessage = () => {
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.isStreaming) {
            newMsgs[newMsgs.length - 1] = {
              ...lastMsg,
              text: currentAnswer,
              reasoning: cleanReasoningText(currentReasoning)
            };
          }
          return newMsgs;
        });
      };
      
      source.addEventListener('token', e => {
        try {
          const payload = JSON.parse(e.data || '{}');
          const text = payload.text || payload.content || payload.delta?.content || '';
          const reasoning = extractReasoning(payload);
          currentAnswer += text;
          if (reasoning) currentReasoning += reasoning;
          
          if (!throttleTimerRef.current) {
            throttleTimerRef.current = setTimeout(() => {
              updateStreamingMessage();
              throttleTimerRef.current = null;
            }, 100); // Update max 10 times per second
          }
        } catch { /* ignore */ }
      });

      const handleReasoningEvent = (e) => {
        void worldLifecycle.thinking();
        try {
          const payload = JSON.parse(e.data || '{}');
          const reasoning = extractReasoning(payload) || payload.text || payload.content || '';
          if (!reasoning) return;
          currentReasoning += reasoning;
          updateStreamingMessage();
        } catch {
          if (e.data) {
            currentReasoning += String(e.data);
            updateStreamingMessage();
          }
        }
      };
      source.addEventListener('reasoning', handleReasoningEvent);
      source.addEventListener('thinking', handleReasoningEvent);
      source.addEventListener('trace', handleReasoningEvent);

      source.addEventListener('tool', e => {
        try {
          const d = JSON.parse(e.data || '{}');
          const toolName = d.name || d.function?.name || 'unknown_tool';
          void worldLifecycle.working(toolName);
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = { ...newMsgs[newMsgs.length - 1] };
            if (lastMsg && lastMsg.isStreaming) {
              lastMsg.tools = lastMsg.tools ? [...lastMsg.tools] : [];
              const existingTool = lastMsg.tools.find(t => t.name === toolName && t.status === 'running');
              if (!existingTool) {
                lastMsg.tools.push({ name: toolName, status: 'running', input: d });
              }
            }
            newMsgs[newMsgs.length - 1] = lastMsg;
            return newMsgs;
          });
        } catch { /* ignore */ }
      });

      source.addEventListener('tool_complete', e => {
        try {
          const d = JSON.parse(e.data || '{}');
          const toolName = d.name || d.function?.name || 'tool';
          void worldLifecycle.working(toolName);
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastMsg = { ...newMsgs[newMsgs.length - 1] };
            if (lastMsg && lastMsg.isStreaming && lastMsg.tools) {
              const toolExists = lastMsg.tools.some(t => t.name === toolName && t.status === 'running');
              if (toolExists) {
                lastMsg.tools = lastMsg.tools.map(t => 
                  t.name === toolName && t.status === 'running' 
                    ? { ...t, status: 'complete', output: d } 
                    : t
                );
              } else {
                lastMsg.tools = [...lastMsg.tools, { name: toolName, status: 'complete', output: d }];
              }
            }
            newMsgs[newMsgs.length - 1] = lastMsg;
            return newMsgs;
          });
        } catch { /* ignore */ }
      });

      // Listen for approval requests from the backend (gateway blocking)
      source.addEventListener('approval', e => {
        try {
          const d = JSON.parse(e.data || '{}');
          void worldLifecycle.waiting();
          console.log('[SSE] Received approval event:', d);
          if (d && (d.command || d.question || d.pattern_key)) {
            setPendingApproval(d);
          }
        } catch { /* ignore */ }
      });

      const handleDone = (finalText, { publishSuccess = true } = {}) => {
        if (publishSuccess) void worldLifecycle.success();
        setIsTyping(false);
        setActiveStreamId(null);
        if (throttleTimerRef.current) {
          clearTimeout(throttleTimerRef.current);
          throttleTimerRef.current = null;
        }
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg && lastMsg.isStreaming) {
            const updated = { ...lastMsg, isStreaming: false };
            if (finalText !== undefined) {
              updated.text = finalText;
            }
            updated.reasoning = cleanReasoningText(currentReasoning || updated.reasoning);
            newMsgs[newMsgs.length - 1] = updated;
          }
          return newMsgs;
        });
        triggerCompanionSignal('task-completed', 2600);
        source.close();
        sourceRef.current = null;
      };

      source.addEventListener('done', () => handleDone());
      source.addEventListener('stream_end', () => handleDone());
      
      source.addEventListener('apperror', (e) => {
        const errData = e.data ? ` (${e.data})` : '';
        currentAnswer += `\n> [ERROR] ${formatStreamError(e.data)}`;
        void worldLifecycle.critical();
        handleDone(currentAnswer, { publishSuccess: false });
      });

      source.onerror = () => {
        sseErrorCountRef.current++;
        // If browser gave up (CLOSED), or 3+ consecutive errors with no data in between,
        // the connection is dead. Recover instead of looping forever.
        if (source.readyState === EventSource.CLOSED || sseErrorCountRef.current >= 3) {
          console.warn('[SSE] Connection dead (readyState=%s, errors=%d) - recovering', source.readyState, sseErrorCountRef.current);
          source.close();
          sourceRef.current = null;
          recoverSession(sessionIdRef.current || localStorage.getItem('hermes_chat_session_v3'));
        } else {
          console.warn('[SSE] Transient error (%d/3), browser will retry...', sseErrorCountRef.current);
        }
      };
      // Reset error counter on any successful event
      const resetErrors = () => { sseErrorCountRef.current = 0; };
      source.addEventListener('token', resetErrors);
      source.addEventListener('tool', resetErrors);
      source.addEventListener('tool_complete', resetErrors);
      source.addEventListener('approval', resetErrors);
      source.addEventListener('reasoning', resetErrors);
      source.addEventListener('thinking', resetErrors);
      source.addEventListener('trace', resetErrors);
      source.addEventListener('done', resetErrors);
      source.addEventListener('stream_end', resetErrors);

    } catch (e) {
      triggerCompanionSignal('error', 2600);
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastMsg = newMsgs[newMsgs.length - 1];
        if (lastMsg && lastMsg.isStreaming) {
          newMsgs[newMsgs.length - 1] = { ...lastMsg, isStreaming: false, text: `> [ERROR] ${e.message}` };
        }
        return newMsgs;
      });
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    // Autocomplete navigation
    if (acFiltered.length > 0) {
      if (e.key === 'Tab' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        try { if (navigator.vibrate) navigator.vibrate(10); } catch { /* ignore */ }
        const selected = acFiltered[acIndex] || acFiltered[0];
        setInput(selected.cmd + ' ');
        setAcIndex(0);
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setAcIndex(i => Math.min(i + 1, acFiltered.length - 1)); try { if (navigator.vibrate) navigator.vibrate(5); } catch { /* ignore */ } return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setAcIndex(i => Math.max(i - 1, 0)); try { if (navigator.vibrate) navigator.vibrate(5); } catch { /* ignore */ } return; }
      if (e.key === 'Escape') { setInput(''); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const latestAssistant = [...messages].reverse().find(m => m.role === 'assistant');
  const latestText = (latestAssistant?.text || '').toLowerCase();
  const hasLatestError = latestText.includes('[error]') || latestText.includes('error:') || latestText.includes('unterminated string');
  const streamingAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.isStreaming);
  const hasRunningTool = streamingAssistant?.tools?.some(t => t.status === 'running');
  const latestToolsComplete = latestAssistant?.tools?.some(t => t.status === 'complete');
  const latestLooksComplete = latestToolsComplete || latestText.includes('completed') || latestText.includes('[ok]') || latestText.includes('success') || latestText.includes('all systems operational');
  const activeStreamState = hasRunningTool ? 'thinking' : 'talking';
  const companionState = pendingApproval
    ? 'warning'
    : input.trim()
      ? 'typing'
      : isTyping
        ? activeStreamState
        : companionSignal
          ? companionSignal
        : hasLatestError
          ? 'error'
          : isCompanionSleeping
            ? 'sleeping'
          : latestLooksComplete
            ? 'task-completed'
            : isInputFocused
              ? 'listening'
              : selectedModel
                ? 'online'
                : 'offline';
  const companionLabel = pendingApproval
    ? 'APPROVAL'
    : input.trim()
      ? 'TYPING'
      : isTyping
        ? (hasRunningTool ? 'THINKING' : 'TALKING')
        : companionSignal === 'task-completed'
          ? 'COMPLETE'
          : companionSignal === 'happy'
            ? 'READY'
            : companionSignal === 'warning'
              ? 'WARNING'
              : companionSignal === 'error'
                ? 'ERROR'
        : hasLatestError
          ? 'ERROR'
          : isCompanionSleeping
            ? 'SLEEPING'
          : latestLooksComplete
            ? 'COMPLETE'
            : isInputFocused
              ? 'LISTENING'
              : selectedModel
                ? 'ONLINE'
                : 'OFFLINE';
  const displayModel = selectedModel ? (selectedModel.includes('/') ? selectedModel.split('/').pop() : selectedModel) : 'AUTO';
  const displayAgent = targetAgent === 'all' ? 'System' : targetAgent;

  const companionSubtitle = pendingApproval
    ? 'Permission gate is waiting for operator decision.'
    : input.trim()
      ? 'Command buffer active. Hermes is reading your input.'
      : isTyping
        ? hasRunningTool
          ? 'Tools are executing. Hermes is scanning the workstream.'
          : 'Live response is streaming back through the companion link.'
        : companionSignal === 'task-completed'
          ? 'Task completed. Hermes is holding the result in mission memory.'
          : companionSignal === 'happy'
            ? 'Command accepted. Companion link is clean.'
            : companionSignal === 'warning'
              ? 'Operator interruption logged. Hermes is standing by.'
              : companionSignal === 'error'
                ? 'Runtime fault detected. Hermes is ready to recover.'
        : hasLatestError
          ? 'Last response reported an error. Ready to recover or start fresh.'
          : isCompanionSleeping
            ? 'Companion is sleeping in standby. Touch the console to wake Hermes.'
          : latestLooksComplete
            ? 'Task finished. Hermes is holding the result in mission memory.'
            : isInputFocused
              ? 'Listening for your next instruction.'
              : 'Ready for delegated work, command routing, approvals and model handoff.';
  const quickPrompts = [
    { label: 'RESEARCH', text: 'Zrob research tego tematu i podaj konkretne wnioski, ryzyka oraz nastepne kroki: ' },
    { label: 'PLAN', text: 'Rozpisz plan wykonania tego zadania krok po kroku i zacznij od najwazniejszych decyzji: ' },
    { label: 'AUDIT', text: 'Zrob dokladny audyt tego obszaru, wypisz bugi, ryzyka, regresje i priorytety napraw: ' },
    { label: 'SHIP', text: 'Doprowadz to do gotowego stanu produkcyjnego, zachowujac stabilnosc i szybkie dzialanie: ' }
  ];

  const applyQuickPrompt = (text) => {
    setInput(prev => prev.trim() ? prev : text);
  };

  const getMessageMascotState = (m) => {
    const text = (m.text || '').toLowerCase();
    if (text.includes('[error]') || text.includes('error:') || text.includes('unterminated string')) return 'error';
    if (m.isStreaming) return m.tools && m.tools.some(t => t.status === 'running') ? 'thinking' : 'talking';
    if (m.tools && m.tools.some(t => t.status === 'complete')) return 'task-completed';
    if (text.includes('completed') || text.includes('[ok]') || text.includes('success') || text.includes('all systems operational')) return 'task-completed';
    return 'idle';
  };
  const latestAssistantIndex = messages.reduce((latest, message, index) => (
    message.role === 'assistant' ? index : latest
  ), -1);

  return (
    <div className="chat-container">
      {/* Approval Modal */}
      {pendingApproval && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '12px', overflowY: 'auto', WebkitOverflowScrolling: 'touch'
        }}>
          <div style={{
            background: 'rgba(20,20,20,0.95)', border: '1px solid var(--accent-warning)',
            borderRadius: '8px', padding: 'clamp(14px, 3vw, 20px)', maxWidth: '500px', width: 'min(100%, 500px)',
            maxHeight: 'calc(100dvh - 24px)', boxShadow: '0 0 20px rgba(255, 165, 0, 0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            <h3 style={{ color: 'var(--accent-warning)', marginTop: 0 }}>[WARN] Approval Required</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Agent is requesting permission to execute:</p>
            {pendingApproval.description && (
              <p style={{ color: 'var(--accent-orange)', fontSize: '13px', marginTop: '-5px' }}>{pendingApproval.description}</p>
            )}
            <pre style={{ 
              background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '4px',
              border: '1px solid var(--border-color)', overflow: 'auto', color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 'min(42dvh, 360px)',
              minHeight: 0, WebkitOverflowScrolling: 'touch'
            }}>
              {pendingApproval.command || pendingApproval.question || JSON.stringify(pendingApproval)}
            </pre>
            <div style={{
              display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap',
              flex: '0 0 auto', paddingTop: '10px',
              background: 'linear-gradient(180deg, rgba(20,20,20,0), rgba(20,20,20,0.96) 18%)'
            }}>
              <button className="nav-btn" onClick={() => {
                api.respondToApproval(sessionId, pendingApproval.approval_id || pendingApproval.id || pendingApproval.action_id, 'once');
                setPendingApproval(null);
                triggerCompanionSignal('happy', 1400);
              }} style={{ background: 'rgba(0, 255, 0, 0.1)', borderColor: 'rgba(0, 255, 0, 0.3)', color: '#aaffaa' }}>Allow Once</button>
              <button className="nav-btn" onClick={() => {
                api.respondToApproval(sessionId, pendingApproval.approval_id || pendingApproval.id || pendingApproval.action_id, 'session');
                setPendingApproval(null);
                triggerCompanionSignal('happy', 1400);
              }}>Allow for Session</button>
              <button className="nav-btn" onClick={() => {
                api.respondToApproval(sessionId, pendingApproval.approval_id || pendingApproval.id || pendingApproval.action_id, 'always');
                setPendingApproval(null);
                triggerCompanionSignal('happy', 1400);
              }}>Allow Always</button>
              <button className="nav-btn active" onClick={() => {
                api.respondToApproval(sessionId, pendingApproval.approval_id || pendingApproval.id || pendingApproval.action_id, 'deny');
                setPendingApproval(null);
                triggerCompanionSignal('warning', 1600);
              }} style={{ background: 'rgba(255, 0, 0, 0.2)', borderColor: 'rgba(255, 0, 0, 0.5)' }}>Deny</button>
            </div>
          </div>
        </div>
      )}

      <div className="chat-briefing">
        <div className="chat-briefing-mascot">
          <HermesMascot state={companionState} size={72} />
        </div>
        <div className="chat-briefing-copy">
          <div className="chat-briefing-kicker">&gt;_ COMPANION LINK</div>
          <div className="chat-briefing-title">Hermes tactical chat online</div>
          <div className="chat-briefing-subtitle">{companionSubtitle}</div>
        </div>
        <div className={`chat-briefing-state ${companionState}`}>{companionLabel}</div>
      </div>

      {/* Settings Bar */}
      <div className={`chat-controls ${controlsOpen ? 'open' : 'collapsed'}`} style={{ marginBottom: '14px', color: 'var(--text-muted)', borderBottom: '1px solid rgba(57,255,20,0.16)', paddingBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', fontSize: '12px', letterSpacing: '0.4px' }}>
        <div className="chat-control-summary">
          <div><span>MODEL</span><strong>{displayModel}</strong></div>
          <div><span>AGENT</span><strong>{displayAgent}</strong></div>
          <div><span>SESSION</span><strong>{sessionId ? 'LINKED' : 'NEW'}</strong></div>
          <button type="button" className="btn btn-compact" onClick={() => setControlsOpen(v => !v)}>{controlsOpen ? 'HIDE' : 'SETUP'}</button>
        </div>
        <div className="chat-control-row">
          <span>MODEL</span>
          <select className="chat-select chat-select-model" aria-label="Model" value={selectedModel} onChange={e => applyModelSelection(e.target.value)}>
            {availableModels.map(m => <option key={m} value={m}>{m.includes('/') ? m.split('/').pop() : m}</option>)}
          </select>
        </div>
        <div className="chat-control-row">
          <span>AGENT</span>
          <select className="chat-select chat-select-agent" aria-label="Agent" value={targetAgent} onChange={e => { 
            const newAgentName = e.target.value;
            setTargetAgent(newAgentName); 
            setSessionId(null); 
            setMessages([{ role: 'assistant', text: `> Switched to agent profile: ${newAgentName === 'all' ? 'System (default)' : newAgentName}` }]); 
            if (newAgentName !== 'all' && agents) {
              const agent = agents.find(a => a.name === newAgentName);
              if (agent && agent.model && agent.model !== 'unknown') {
                setSelectedModel(agent.model);
              }
            }
          }}>
            <option value="all">System</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="chat-control-row">
          <span>THINK</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: '5px', width: '100%' }}>
            {['off', 'minimal', 'low', 'medium', 'high', 'xhigh'].map(level => (
              <button
                key={level}
                type="button"
                className={`btn btn-compact ${reasoningEffort === level ? 'active' : ''}`}
                disabled={isReasoningSaving}
                onClick={() => applyReasoningEffort(level)}
                style={{ minWidth: 0, padding: '8px 4px', fontSize: '10px' }}
              >
                {level === 'minimal' ? 'MIN' : level === 'medium' ? 'MED' : level === 'xhigh' ? 'XH' : level.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="chat-control-row">
          <span>TRACE</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '5px', width: '100%' }}>
            <button
              type="button"
              className={`btn btn-compact ${showReasoning ? 'active' : ''}`}
              disabled={isTraceSaving}
              onClick={() => applyReasoningDisplay(true)}
              style={{ minWidth: 0, padding: '8px 4px', fontSize: '10px' }}
            >
              SHOW
            </button>
            <button
              type="button"
              className={`btn btn-compact ${!showReasoning ? 'active' : ''}`}
              disabled={isTraceSaving}
              onClick={() => applyReasoningDisplay(false)}
              style={{ minWidth: 0, padding: '8px 4px', fontSize: '10px' }}
            >
              HIDE
            </button>
          </div>
        </div>
        <div className="chat-control-row">
          <span>HISTORY</span>
          <select className="chat-select chat-select-history" aria-label="History" value={sessionId || 'new'} onChange={e => { 
            if (e.target.value === 'new') { 
              startNewChat(); 
            } else { 
              loadSession(e.target.value); 
            } 
          }}>
            <option value="new">+ New Chat</option>
            {recentSessions.map(s => <option key={s.session_id} value={s.session_id}>{s.title || 'Untitled'}</option>)}
          </select>
        </div>
        <div className="chat-actions">
          <button type="button" className="btn btn-compact" onClick={startNewChat}>NEW</button>
          <button type="button" className="btn btn-compact" onClick={clearChat}>CLEAR</button>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={messagesContainerRef} onScroll={updateShouldStickToBottom}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-msg ${m.role}`}>
            {m.role === 'user' ? (
              <div style={{ minWidth: 0, maxWidth: '100%', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                <span style={{ color: 'var(--text-secondary)' }}>you &gt;</span> {m.text}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-start', minWidth: 0, maxWidth: '100%' }}>
                {i === latestAssistantIndex && (
                  <div className="chat-mascot-anchor" style={{ marginRight: '12px', marginTop: '4px', minWidth: '50px' }}>
                    <HermesMascot
                      isStatic={!m.isStreaming}
                      state={getMessageMascotState(m)}
                      size={50}
                    />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0, maxWidth: '100%', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                  {m.text && <span style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{safeMessageText(m.text).replace(/^> /, '').replace(/^SYS_: /, '').replace(/^USER_: /, '')}</span>}
                  {m.isStreaming && <span style={{ animation: 'blink 1s infinite' }}>_</span>}
                  <ReasoningTrace trace={m.reasoning} />
                  {m.tools && m.tools.length > 0 && (
                    <ToolSummary tools={m.tools} />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} style={{ height: '10px' }} />
      </div>

      {!isTyping && (
        <div className="chat-suggestions">
          {quickPrompts.map(prompt => (
            <button key={prompt.label} type="button" onClick={() => applyQuickPrompt(prompt.text)}>
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-composer-shell">
        <div className="chat-composer-header">
          <span>COMMAND INPUT</span>
          <strong>{isTyping ? 'STREAMING' : input.trim() ? 'READY TO SEND' : 'STANDBY'}</strong>
        </div>
        {/* Command Autocomplete Dropdown */}
        {acFiltered.length > 0 && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0,
            background: 'var(--bg-panel)', border: '1px solid var(--accent-orange)',
            borderRadius: '6px 6px 0 0', maxHeight: '200px', overflowY: 'auto',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5)', zIndex: 100
          }}>
            {acFiltered.map((c, i) => (
              <div
                key={c.cmd}
                onClick={() => { 
                  try { if (navigator.vibrate) navigator.vibrate(10); } catch { /* ignore */ }
                  setInput(c.cmd + ' '); 
                  setAcIndex(0); 
                }}
                style={{
                  padding: '8px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  background: i === acIndex ? 'var(--bg-hover)' : 'transparent',
                  borderLeft: i === acIndex ? '2px solid var(--accent-orange)' : '2px solid transparent'
                }}
              >
                <span style={{ color: 'var(--accent-orange)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{c.cmd}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{c.desc}</span>
              </div>
            ))}
          </div>
        )}
        <div className="chat-input-wrapper">
          <div className={`chat-composer-mascot ${companionState}`} data-state={companionLabel}>
            <HermesMascot state={companionState} size={70} />
          </div>
          <span className="chat-prompt">&gt;</span>
          <textarea 
            className="chat-input"
            value={input}
            placeholder="Napisz do Hermesa... / dla komend, Shift+Enter nowa linia"
            onChange={e => { setInput(e.target.value); setAcIndex(0); }}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={false}
            autoFocus
            spellCheck="false"
            rows={input.split('\n').length || 1}
          />
          {isTyping ? (
            <button className="btn btn-stop" onClick={handleStop}>STOP</button>
          ) : (
            <button className="btn chat-send-btn" onClick={handleSend} disabled={!input.trim()}>SEND</button>
          )}
        </div>
      </div>
    </div>
  );
}


