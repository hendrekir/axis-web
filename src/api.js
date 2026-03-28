const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || 'Request failed');
  }
  return res.json();
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

// Brain dump — currently public, no auth needed
export function postBrainDump(text) {
  return request('/brain-dump', {
    method: 'POST',
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
