const API_BASE = 'http://localhost:3000';

export const getStoredUser = () => {
    try {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    } catch (err) {
        console.error('Failed to parse stored user:', err);
        return null;
    }
};

export const setStoredUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
};

export const clearStoredUser = () => {
    localStorage.removeItem('user');
};

export const isLoggedIn = () => {
    return getStoredUser() !== null;
};

export const register = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
};

export const login = async (credentials) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
};

export const logout = async () => {
    const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
    });
    
    clearStoredUser();
    
    // ✅ Dispara evento para atualizar o Header
    window.dispatchEvent(new Event('logoutSuccess'));
    
    return response.json();
};

export const updateUser = async (userData) => {
    const response = await fetch(`${API_BASE}/auth/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
    }

    return response.json();
};