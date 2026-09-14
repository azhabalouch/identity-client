let accessToken = null;
let refreshing = null;

export class ApiError extends Error {
  constructor(status, data) {
    const text =
      data?.detail ||
      data?.error_description ||
      Object.values(data || {})
        .flat()
        .join(' ') ||
      `HTTP ${status}`;
    super(text);
    this.status = status;
    this.data = data;
  }
}

export function setAccessToken(token) {
  accessToken = token;
}

// One refresh at a time, even if several requests fail together.
export function restoreSession() {
  if (!refreshing) {
    refreshing = fetch('/api/v1/auth/refresh', { method: 'POST' })
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (!res.ok) throw new ApiError(res.status, data);

        accessToken = data.access_token;
        return data;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function api(path, { method = 'GET', body, retry = true } = {}) {
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`/api/v1${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 401 = fetch a new token (Chapter III G). Never loop, never retry auth routes.
  if (res.status === 401 && retry && !path.startsWith('/auth/')) {
    try {
      await restoreSession();
    } catch {
      accessToken = null;
      window.dispatchEvent(new Event('signed-out'));
      throw new ApiError(401, { detail: 'Please sign in again.' });
    }
    return api(path, { method, body, retry: false });
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null);

  if (!res.ok) throw new ApiError(res.status, data);

  return data;
}
