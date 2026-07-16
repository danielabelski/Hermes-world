export const getApiUrl = () => {
  return `/api`;
};

const parseJsonSafely = async (res, fallback = null, strict = false) => {
  const text = await res.text();
  if (!text || !text.trim()) {
    if (strict) throw new SyntaxError(`Hermes API returned an empty response for ${res.url || 'an endpoint'}`);
    return fallback;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    if (strict) throw error;
    return fallback;
  }
};

export class HermesApiError extends Error {
  constructor(message, { status = null, url = null, cause = null } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = 'HermesApiError';
    this.status = status;
    this.url = url;
  }
}

const notifyUnauthorized = () => {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('hermes_unauthorized'));
};

/**
 * Read-only world endpoints keep their legacy fallback behaviour by default.
 * WorldBridge opts into strict mode so an unavailable domain cannot be
 * mistaken for a genuinely empty Hermes response.
 */
const readJson = async (path, { fallback = null, strict = false } = {}) => {
  const url = `${getApiUrl()}${path}`;
  try {
    const res = await fetch(url);
    if (res.status === 401) notifyUnauthorized();
    if (!res.ok) throw new HermesApiError(`Hermes API request failed: ${res.status}`, { status: res.status, url });
    return await parseJsonSafely(res, fallback, strict);
  } catch (error) {
    if (strict) {
      if (error instanceof HermesApiError) throw error;
      throw new HermesApiError(`Hermes API request failed for ${url}`, { url, cause: error });
    }
    return fallback;
  }
};

export const api = {
  // AGENTS (Profiles)
  async getProfiles({ strict = false } = {}) {
    return readJson('/profiles', { fallback: [], strict });
  },
  async setProfileModel(profileName, model) {
    try {
      await fetch(`${getApiUrl()}/profiles/${profileName}/model`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
    } catch (e) { console.error('Failed to set model', e); }
  },

  // CRONS
  async getCrons({ strict = false } = {}) {
    return readJson('/crons', { fallback: [], strict });
  },
  async toggleCron(jobId, pause) {
    try {
      await fetch(`${getApiUrl()}/crons/${jobId}/${pause ? 'pause' : 'resume'}`, { method: 'POST' });
    } catch (e) { console.error('Failed to toggle cron', e); }
  },

  async runCron(id) {
    try {
      const res = await fetch(`${getApiUrl()}/crons/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id })
      });
      return res.ok;
    } catch (e) { console.error('Failed to run cron', e); return false; }
  },

  // MODELS
  async getModels({ strict = false } = {}) {
    return readJson('/models', { fallback: null, strict });
  },

  // REASONING
  async getReasoning(model) {
    try {
      if (!model) return null;
      const qs = `?model=${encodeURIComponent(model)}`;
      const res = await fetch(`${getApiUrl()}/reasoning${qs}`);
      // Reasoning status is optional UI metadata. A transient 401 here must not
      // reset the whole app auth flow or block model loading.
      if (res.status === 401) return null;
      return res.ok ? await parseJsonSafely(res, null) : null;
    } catch (e) { console.error('Failed to load reasoning status', e); return null; }
  },

  async setReasoning(effort, model) {
    const body = { effort: effort === 'off' ? 'none' : effort };
    if (model) body.model = model;
    const res = await fetch(`${getApiUrl()}/reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Reasoning update failed: ${res.status} ${text}`);
    }
    return parseJsonSafely(res, null);
  },

  async setReasoningDisplay(show) {
    const res = await fetch(`${getApiUrl()}/reasoning`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display: show ? 'show' : 'hide' })
    });
    if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Reasoning display update failed: ${res.status} ${text}`);
    }
    return parseJsonSafely(res, null);
  },

  // SKILLS
  async getSkills({ strict = false } = {}) {
    return readJson('/skills', { fallback: [], strict });
  },
  async toggleSkill(name, enabled) {
    try {
      await fetch(`${getApiUrl()}/skills/toggle`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, enabled })
      });
    } catch (e) { console.error('Failed to toggle skill', e); }
  },

  // LOGS
  async getLogs({ strict = false } = {}) {
    return readJson('/logs?lines=500', { fallback: { lines: [] }, strict });
  },

  // MEMORY
  async getMemory({ strict = false } = {}) {
    return readJson('/memory', { fallback: null, strict });
  },

  async getCronHistory({ strict = false } = {}) {
    return readJson('/crons/recent', { fallback: null, strict });
  },

  async getSystemMetrics({ strict = false } = {}) {
    return readJson('/system/metrics', { fallback: null, strict });
  },



  // KANBAN
  async getKanbanBoards() {
    try {
      const res = await fetch(`${getApiUrl()}/kanban/boards`);
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok ? await parseJsonSafely(res, { boards: [] }) : { boards: [] };
    } catch { return { boards: [] }; }
  },

  async getKanbanStats(board) {
    try {
      const qs = board ? `?board=${encodeURIComponent(board)}` : '';
      const res = await fetch(`${getApiUrl()}/kanban/stats${qs}`);
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok ? await parseJsonSafely(res, null) : null;
    } catch { return null; }
  },

  async getKanbanTasks({ board, status = 'all', sort = 'updated', strict = false } = {}) {
    try {
      const params = new URLSearchParams();
      if (board) params.set('board', board);
      if (status) params.set('status', status);
      if (sort) params.set('sort', sort);
      return await readJson(`/kanban/tasks?${params.toString()}`, { fallback: { tasks: [] }, strict });
    } catch (error) {
      if (strict) throw error;
      return { tasks: [] };
    }
  },

  async getSessions({ strict = false } = {}) {
    return readJson('/sessions/search?limit=50', { fallback: null, strict });
  },

  async getSession(id) {
    try {
      const res = await fetch(`${getApiUrl()}/session?session_id=${id}`);
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },

  // CHAT
  async createSession(profile, model) {
    const res = await fetch(`${getApiUrl()}/session/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profile, model })
    });
    if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Session creation failed: ${res.status} ${text}`);
    }
    return res.json();
  },
  
  async sendChatMessage(sessionId, message, profile) {
    try {
      const res = await fetch(`${getApiUrl()}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message, profile })
      });
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok ? await res.json() : null;
    } catch (e) { console.error('Failed to send chat', e); return null; }
  },
  
  async startChatStream(sessionId, message, profile, model) {
    const body = { session_id: sessionId, message, profile, explicit_model_pick: true };
    if (model) {
      body.model = model;
    }
    const res = await fetch(`${getApiUrl()}/chat/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
    if (!res.ok) {
      if (res.status === 409) {
        const data = await res.json().catch(() => null);
        if (data && data.active_stream_id) {
          const err = new Error('Session is busy');
          err.status = 409;
          err.active_stream_id = data.active_stream_id;
          throw err;
        }
      }
      const text = await res.text();
      throw new Error(`Stream start failed: ${res.status} ${text}`);
    }
    return res.json();
  },

  async cancelChatStream(streamId) {
    try {
      const res = await fetch(`${getApiUrl()}/chat/cancel?stream_id=${encodeURIComponent(streamId)}`);
      return res.ok ? await res.json() : null;
    } catch (e) { console.error('Failed to cancel stream', e); return null; }
  },

  async checkPendingApproval(sessionId) {
    try {
      const res = await fetch(`${getApiUrl()}/approval/pending?session_id=${encodeURIComponent(sessionId)}`);
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },

  async respondToApproval(sessionId, approvalId, choice) {
    try {
      const res = await fetch(`${getApiUrl()}/approval/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, approval_id: approvalId, choice })
      });
      if (res.status === 401) window.dispatchEvent(new Event('hermes_unauthorized'));
      return res.ok;
    } catch { return false; }
  }
};



