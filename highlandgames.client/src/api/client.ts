const BASE_URL = '/api';

function getToken(): string | null {
    return localStorage.getItem('hg_token');
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const response = await fetch(`${BASE_URL}${path}`, {
        headers: { 'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    if (response.status === 204) return null as T;
    return response.json();
}

export const api = {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}