const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...optHeaders,
    },
    ...rest,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = error.detail;
    const message = typeof detail === 'string' ? detail
      : Array.isArray(detail) ? detail.map(d => d.msg || JSON.stringify(d)).join('; ')
      : typeof detail === 'object' && detail !== null ? (detail.message || JSON.stringify(detail))
      : 'Request failed';
    throw new Error(message);
  }
  return res.json();
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

export function postBrainDump(text, token) {
  return request('/brain-dump', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
}

// Thread
export function postThread(content, token) {
  return request('/thread', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ content }),
  });
}

export function getThreadHistory(token, limit = 50) {
  return request(`/thread/history?limit=${limit}`, {
    headers: authHeaders(token),
  });
}

// Signal + Tasks
export function getSignal(token) {
  return request('/signal', { headers: authHeaders(token) });
}

export function createTask(task, token) {
  return request('/tasks', {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(task),
  });
}

export function updateTask(taskId, updates, token) {
  return request(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
}

// Brief
export function getBrief(token) {
  return request('/brief', { headers: authHeaders(token) });
}

// Skills
export function chatWithSkill(skillId, message, token) {
  return request(`/skills/${skillId}/chat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
}

// Settings — Gmail OAuth
export function getGmailAuthUrl(token) {
  // Returns the redirect URL; caller should window.location.href to it
  return `${API_URL}/auth/gmail`;
}

export function getMe(token) {
  return request('/me', { headers: authHeaders(token) });
}

export function updateMe(updates, token) {
  return request('/me', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
}

// Stripe — create checkout session for Pro upgrade
export function createCheckoutSession(token) {
  return request('/billing/checkout', {
    method: 'POST',
    headers: authHeaders(token),
  });
}

// Brain dump usage count
export function getBrainDumpUsage(token) {
  return request('/brain-dump/usage', { headers: authHeaders(token) });
}

// Skills
export function getSkills(token) {
  return request('/skills', { headers: authHeaders(token) });
}

export function updateSkill(skillId, updates, token) {
  return request(`/skills/${skillId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
}

export function runSkill(skillId, message, token) {
  return request(`/skills/${skillId}/run`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ message }),
  });
}

// Apprentice
export function getApprentice(token) {
  return request('/apprentice', { headers: authHeaders(token) });
}

export function correctApprentice(patternType, correction, token) {
  return request('/apprentice/correct', {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ pattern_type: patternType, correction }),
  });
}
