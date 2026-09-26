import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const row = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`));
    const value = row?.slice(name.length + 1);

    return value ? decodeURIComponent(value) : null;
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

const clientConfig = {
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
    withCredentials: true,
};

export const api = axios.create(clientConfig);

// Separate client so the refresh call skips the 401 interceptor below.
const refreshApi = axios.create(clientConfig);

export const AUTH_EXPIRED_EVENT = 'sentinelops:auth-expired';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _sentinelopsRetried?: boolean;
};

let refreshPromise: Promise<void> | null = null;

function attachCsrfToken(config: InternalAxiosRequestConfig) {
    const method = config.method?.toLowerCase();
    const csrfToken = getCookie('csrfToken');

    if (method && MUTATING_METHODS.has(method) && csrfToken) {
        config.headers['x-csrf-token'] = csrfToken;
    }

    return config;
}

api.interceptors.request.use(attachCsrfToken);
refreshApi.interceptors.request.use(attachCsrfToken);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const request = error.config as RetryableRequestConfig | undefined;
        // A 401 from login means bad credentials, not an expired session.
        const isLoginRequest = request?.url?.includes('/auth/login');

        if (error.response?.status !== 401 || !request || request._sentinelopsRetried || isLoginRequest) {
            return Promise.reject(error);
        }

        request._sentinelopsRetried = true;

        if (!refreshPromise) {
            refreshPromise = refreshApi
                .post('/auth/refresh')
                .then(() => undefined)
                .catch((refreshError) => {
                    // Fire once per failed refresh, not once per queued request.
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
                    }
                    throw refreshError;
                })
                .finally(() => {
                    refreshPromise = null;
                });
        }

        await refreshPromise;
        return api(request);
    },
);
