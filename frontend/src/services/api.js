
const DEFAULT_API_URL = 'http://localhost:5001/api';

const API_URL = (
  import.meta.env.VITE_API_URL || DEFAULT_API_URL
)
  .trim()
  .replace(/\/+$/, '');

export function getToken() {
  return sessionStorage.getItem('bookleaf_token');
}

export function setSession(token, user) {
  sessionStorage.setItem('bookleaf_token', token);
  sessionStorage.setItem('bookleaf_user', JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem('bookleaf_token');
  sessionStorage.removeItem('bookleaf_user');
}

export function getSessionUser() {
  try {
    return JSON.parse(
      sessionStorage.getItem('bookleaf_user') || 'null'
    );
  } catch {
    return null;
  }
}

export async function api(
  path,
  { method = 'GET', body, signal } = {}
) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Ensure the API path starts with one slash.
  const normalizedPath = `/${String(path).replace(/^\/+/, '')}`;
  const requestUrl = `${API_URL}${normalizedPath}`;

  let response;

  try {
    response = await fetch(requestUrl, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }

    throw new Error(
      'Unable to connect to BookLeaf. Check your internet connection and try again.'
    );
  }

  const result = await response.json().catch(() => ({
    success: false,
    error: {
      message: 'The server returned an unreadable response',
    },
  }));

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      clearSession();
    }

    throw new Error(
      result?.error?.message || 'Request failed. Please try again.'
    );
  }

  return result.data;
}
