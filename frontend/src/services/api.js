import { getIdToken } from './firebase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

/**
 * Makes an authenticated API request.
 */
async function apiFetch(path, options = {}) {
  const token = await getIdToken();
  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

/**
 * Starts a contract analysis (non-streaming).
 * Returns { analysis_id, status_url }
 */
export async function startAnalysis(file) {
  const formData = new FormData();
  formData.append('file', file);

  return apiFetch('/v1/analyze', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Starts a streaming analysis via SSE.
 * Returns an EventSource-like interface.
 */
export function startStreamingAnalysis(file, onChunk, onComplete, onError) {
  return new Promise(async (resolve) => {
    const token = await getIdToken();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/v1/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Unknown error' }));
        onError?.(new Error(err.error || 'Analysis failed'));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let analysisId = null;

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'started') {
                  analysisId = data.analysisId;
                  resolve(analysisId);
                } else if (data.type === 'chunk') {
                  onChunk?.(data.content);
                } else if (data.type === 'complete') {
                  onComplete?.(data.analysis);
                } else if (data.type === 'error') {
                  onError?.(new Error(data.message));
                }
              } catch {
                // ignore malformed JSON in SSE
              }
            }
          }
        }
      };

      processStream().catch((err) => onError?.(err));
    } catch (err) {
      onError?.(err);
    }
  });
}

/**
 * Gets analysis results by ID.
 */
export async function getAnalysis(analysisId) {
  return apiFetch(`/v1/analysis/${analysisId}`);
}

/**
 * Lists all analyses for the current user.
 */
export async function listAnalyses() {
  return apiFetch('/v1/analyses');
}

/**
 * Submits feedback on a clause.
 */
export async function submitFeedback(analysisId, clauseId, feedbackType, comment = '') {
  return apiFetch('/v1/feedback', {
    method: 'POST',
    body: JSON.stringify({
      analysis_id: analysisId,
      clause_id: clauseId,
      feedback_type: feedbackType,
      comment,
    }),
  });
}

/**
 * Creates a living contract monitor.
 */
export async function createMonitor(analysisId, contractName, events) {
  return apiFetch('/v1/monitors', {
    method: 'POST',
    body: JSON.stringify({
      analysis_id: analysisId,
      contract_name: contractName,
      events,
    }),
  });
}

/**
 * Lists all monitors for the current user.
 */
export async function listMonitors() {
  return apiFetch('/v1/monitors');
}

/**
 * Deletes (deactivates) a monitor.
 */
export async function deleteMonitor(monitorId) {
  return apiFetch(`/v1/monitors/${monitorId}`, { method: 'DELETE' });
}
