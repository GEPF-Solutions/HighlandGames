import { api } from './client';

export interface TokenDto {
    token: string;
}

export const authApi = {
    login: (password: string) => api.post<TokenDto>('/auth/login', { password }),
};