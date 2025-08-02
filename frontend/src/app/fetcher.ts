const BASES = {
  auth:
    process.env.NEXT_PUBLIC_AUTH_API_BASE ||
    'http://localhost:8080/api/v1/auth',
  messages:
    process.env.NEXT_PUBLIC_MESSAGES_API_BASE ||
    'http://localhost:8080/api/v1/messages',
};

let token: string | null = null;

export function setToken(newToken: string | null) {
  token = newToken;
  if (typeof window !== 'undefined') {
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  }
}

export function getToken() {
  if (token) return token;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('token');
    return token;
  }
  return null;
}

async function fetcher(
  path: string,
  options: RequestInit = {},
  base: 'auth' | 'messages' = 'messages'
) {
  console.log(path);

  const headers: any = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const t = getToken();
  if (t) headers['Authorization'] = `Bearer ${t}`;
  const res = await fetch(`${BASES[base]}${path}`, { ...options, headers });
  console.log(`${BASES[base]}${path}`);
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const errorMsg = data?.message || res.statusText || 'API Error';
    const error = new Error(errorMsg);
    (error as any).data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path: string, base: 'auth' | 'messages' = 'messages') =>
    fetcher(path, { method: 'GET' }, base),
  post: (path: string, body?: any, base: 'auth' | 'messages' = 'messages') =>
    fetcher(path, { method: 'POST', body: JSON.stringify(body) }, base),
  put: (path: string, body?: any, base: 'auth' | 'messages' = 'messages') =>
    fetcher(path, { method: 'PUT', body: JSON.stringify(body) }, base),
};
