import axios from 'axios';

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const value = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))?.split('=')[1];

    return value ? decodeURIComponent(value) : null;
}

const MUTATING_METHODS = new Set(['post', 'put', 'patch', 'delete']);

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
    withCredentials: true
})

api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase();

    if (method && MUTATING_METHODS.has(method)) {
        const csrfToken = getCookie('csrfToken');

        if (csrfToken){
            config.headers['x-csrf-token'] = csrfToken;
        }
    }

    return config;
})