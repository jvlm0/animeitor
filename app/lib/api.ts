// lib/api.ts
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const fetchApi = (path: string, options?: RequestInit) => {
  return fetch(`${BASE_PATH}${path}`, options);
};