import idleSprite from '../assets/mascot/mascot_idle.webp';
import listeningSprite from '../assets/mascot/mascot_listening.webp';
import typingSprite from '../assets/mascot/mascot_typing.webp';
import thinkingSprite from '../assets/mascot/mascot_thinking.webp';
import successSprite from '../assets/mascot/mascot_success.webp';
import errorSprite from '../assets/mascot/mascot_error.webp';
import sleepingSprite from '../assets/mascot/mascot_sleeping.webp';
import alertSprite from '../assets/mascot/mascot_alert.webp';

const stateAssets = {
  idle: idleSprite,
  online: idleSprite,
  listening: listeningSprite,
  talking: listeningSprite,
  typing: typingSprite,
  thinking: thinkingSprite,
  success: successSprite,
  happy: successSprite,
  completed: successSprite,
  'task-completed': successSprite,
  error: errorSprite,
  alert: alertSprite,
  warning: alertSprite,
  sleeping: sleepingSprite,
  offline: sleepingSprite
};

const normalizeState = (state) => {
  if (state === 'replying' || state === 'talking') return 'listening';
  if (state === 'happy' || state === 'completed' || state === 'task-completed') return 'success';
  if (state === 'warning') return 'alert';
  if (state === 'offline') return 'sleeping';
  return state || 'idle';
};

export default function HermesMascot({ state = 'idle', size = 40, isStatic = false }) {
  const mode = normalizeState(state);
  const src = stateAssets[mode] || idleSprite;
  const accent = mode === 'error' ? '#ff3434' : '#39ff14';

  return (
    <div
      className={`hermes-mascot hermes-sprite-mascot ${mode} ${isStatic ? 'static' : 'live'}`}
      data-state={mode}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        marginRight: '12px',
        flexShrink: 0,
        '--mascot-accent': accent
      }}
    >
      <span className="mascot-orbit" />
      <span className="mascot-halo" />
      <img className="mascot-sprite" src={src} alt="" draggable="false" />
      <span className="mascot-blink" />
      {(mode === 'listening') && <span className="mascot-bars" />}
      {(mode === 'typing') && <span className="mascot-keyglow" />}
      {(mode === 'thinking') && <span className="mascot-scan-ring" />}
      {(mode === 'alert') && <span className="mascot-alert-ping" />}
      {(mode === 'error') && <span className="mascot-error-slice" />}
    </div>
  );
}
