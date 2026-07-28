import type { StudyDeck } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:3001/api';

export type ApiErrorCode =
  | 'TIMEOUT'
  | 'ABORT'
  | 'NETWORK_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'INVALID_REQUEST'
  | 'RATE_LIMIT'
  | 'BACKEND_UNAVAILABLE'
  | 'INTERNAL_SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export interface ApiError extends Error {
  code: ApiErrorCode;
  details?: unknown;
}

const createApiError = (message: string, code: ApiErrorCode, details?: unknown): ApiError => {
  const error = new Error(message) as ApiError;
  error.name = code;
  error.code = code;
  if (details) error.details = details;
  return error;
};

const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'code' in error && typeof (error as ApiError).code === 'string';
};

async function parseJsonSafe(response: Response) {
  try {
    return await response.json();
  } catch {
    let bodyText = 'Unable to read response body.';
    try {
      bodyText = await response.text();
    } catch {
      /* ignore */
    }
    throw createApiError(`Unexpected server response: ${bodyText}`, 'INVALID_JSON', { status: response.status });
  }
}

/**
 * Custom fetch wrapper that implements timeout and supports AbortSignal propagation.
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const externalSignal = options.signal;
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => {
      controller.abort();
    });
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
      if (externalSignal?.aborted) {
        throw createApiError('Request aborted by the user.', 'ABORT');
      }
      throw createApiError('Request timed out after 15 seconds. Please try again.', 'TIMEOUT');
    }
    throw createApiError('Network request failed. Please check your connection.', 'NETWORK_ERROR');
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

    const data = await parseJsonSafe(response);
    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to generate study materials.';
      const errorCode = (data?.code as ApiErrorCode) ||
        (response.status === 429 ? 'RATE_LIMIT' :
        response.status === 400 ? 'INVALID_REQUEST' :
        response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR');
      throw createApiError(errorMessage, errorCode, data?.details);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (isApiError(error)) {
      throw error;
    }
    throw createApiError((error as Error)?.message || 'Network error. Please make sure the backend server is running.', 'BACKEND_UNAVAILABLE');
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

    const data = await parseJsonSafe(response);

    if (!response.ok) {
      const errorMessage = data?.error || 'Failed to refine study materials.';
      const errorCode = (data?.code as ApiErrorCode) ||
        (response.status === 429 ? 'RATE_LIMIT' :
        response.status === 400 ? 'INVALID_REQUEST' :
        response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR');
      throw createApiError(errorMessage, errorCode, data?.details);
    }

    return data;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    if (isApiError(error)) {
      throw error;
    }
    throw createApiError((error as Error)?.message || 'Network error. Please make sure the backend server is running.', 'BACKEND_UNAVAILABLE');
  }
}
