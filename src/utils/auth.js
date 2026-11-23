import API_BASE_URL from "../services/api";

const API_BASE = API_BASE_URL;

export const getCurrentUser = async () => {
    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            method: 'GET',
            credentials: 'include',
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.user;

    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        return null;
    }
};

export const isLoggedIn = async () => {
    const user = await getCurrentUser();
    return user !== null;
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao cadastrar');
    }

    return response.json();
};

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao realizar login');
    }

    return response.json();
};

export const logout = async () => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erro ao sair da conta');
    }

    window.dispatchEvent(new Event('logoutSuccess'));

    return response.json();
};

export const updateUser = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar usuário');
    }

    return response.json();
};
