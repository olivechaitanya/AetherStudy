import type { StudyDeck } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Custom fetch wrapper that implements timeout and supports AbortSignal propagation.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const externalSignal = options.signal;
  if (externalSignal) {
    // If the external controller aborts, abort our internal controller too
    externalSignal.addEventListener('abort', () => {
      controller.abort();
    });
    // If it's already aborted, trigger immediately
    if (externalSignal.aborted) {
      controller.abort();
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    return response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      // Differentiate between user-initiated abort and timeout-initiated abort
      if (externalSignal?.aborted) {
        throw new DOMException('Request aborted by user.', 'AbortError');
      } else {
        throw new Error('Request timed out after 15 seconds. Please try again.');
      }
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}

export async function generateStudyDeck(
  notes: string,
  type: 'flashcards' | 'quiz',
  count: number,
  signal?: AbortSignal
): Promise<StudyDeck> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes, type, count }),
      signal
    }, 20000); // 20s timeout for generation since AI models can take time

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to generate study materials.');
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error; // Let callers handle explicit aborts
    }
    throw new Error(error.message || 'Network error. Please make sure the backend server is running.');
  }
}

export async function refineStudyDeck(
  currentData: StudyDeck,
  instruction: string,
  signal?: AbortSignal
): Promise<StudyDeck> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/refine`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentData, instruction }),
      signal
    }, 20000); // 20s timeout for refinement

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to refine study materials.');
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw error;
    }
    throw new Error(error.message || 'Network error. Please make sure the backend server is running.');
  }
}
