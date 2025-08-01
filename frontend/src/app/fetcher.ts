const BASES = {
  auth:
    process.env.NEXT_PUBLIC_AUTH_API_BASE ||
    'http://localhost:8080/api/v1/auth',
  messages:
    process.env.NEXT_PUBLIC_MESSAGES_API_BASE ||
    'http://localhost:8080/api/v1/messages',
  files:
    process.env.NEXT_PUBLIC_FILES_API_BASE ||
    'http://localhost:8080/api/files',
};

export { BASES };

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
  base: 'auth' | 'messages' | 'files' = 'messages'
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
  get: (path: string, base: 'auth' | 'messages' | 'files' = 'messages') =>
    fetcher(path, { method: 'GET' }, base),
  post: (path: string, body?: any, base: 'auth' | 'messages' | 'files' = 'messages') =>
    fetcher(path, { method: 'POST', body: JSON.stringify(body) }, base),
  put: (path: string, body?: any, base: 'auth' | 'messages' | 'files' = 'messages') =>
    fetcher(path, { method: 'PUT', body: JSON.stringify(body) }, base),
  
  // Special method for file uploads
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getToken();
    const response = await fetch(`${BASES.files}/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    return response.json();
  },
};
