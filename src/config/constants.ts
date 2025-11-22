export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5257/api';
export const SIGNALR_HUB_URL = import.meta.env.VITE_SIGNALR_URL || 'http://localhost:5257/qmsHub';

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    KIOSK: '/kiosk',
    DISPLAY: '/display',
    COUNTER: '/counter',
    COUNTER_DISPLAY: '/counter-display',
    FEEDBACK: '/feedback',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    CATEGORIES: '/categories',
    PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
    USER: 'qms_user',
    LANGUAGE: 'qms_lang',
    COUNTER_ID: 'display_counter_id',
} as const;

export const COLORS = {
    PRIMARY: '#3B82F6',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#06B6D4',
} as const;
