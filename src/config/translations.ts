export const translations = {
    en: {
        login: {
            title: "BankNext QMS",
            subtitle: "Queue Management System",
            welcome: "Welcome Back",
            emailLabel: "Email Address",
            passwordLabel: "Password",
            signInButton: "Sign In",
            signingIn: "Signing in...",
            demoAccounts: "Demo Accounts (Password: password)",
            footer: "© 2025 BankNext. All rights reserved.",
            error: "Invalid email or password",
            emailPlaceholder: "you@banknext.com",
            passwordPlaceholder: "••••••••"
        },
        menu: {
            profile: "Profile",
            profileDesc: "View and edit profile",
            settings: "Settings",
            settingsDesc: "Preferences and options",
            signOut: "Sign Out",
            signOutDesc: "End your session"
        },
        nav: {
            kiosk: "KIOSK",
            display: "DISPLAY",
            counter: "COUNTER",
            counterDisp: "COUNTER_DISP",
            feedback: "FEEDBACK",
            dashboard: "DASHBOARD",
            users: "USERS",
            categories: "CATEGORIES"
        },
        common: {
            loading: "Loading..."
        }
    },
    vi: {
        login: {
            title: "BankNext QMS",
            subtitle: "Hệ thống quản lý hàng đợi",
            welcome: "Chào mừng trở lại",
            emailLabel: "Địa chỉ Email",
            passwordLabel: "Mật khẩu",
            signInButton: "Đăng nhập",
            signingIn: "Đang đăng nhập...",
            demoAccounts: "Tài khoản Demo (Mật khẩu: password)",
            footer: "© 2025 BankNext. Bảo lưu mọi quyền.",
            error: "Email hoặc mật khẩu không đúng",
            emailPlaceholder: "email@banknext.com",
            passwordPlaceholder: "••••••••"
        },
        menu: {
            profile: "Hồ sơ cá nhân",
            profileDesc: "Xem và chỉnh sửa hồ sơ",
            settings: "Cài đặt",
            settingsDesc: "Tùy chọn và cấu hình",
            signOut: "Đăng xuất",
            signOutDesc: "Kết thúc phiên làm việc"
        },
        nav: {
            kiosk: "KIOSK",
            display: "MÀN HÌNH",
            counter: "QUẦY",
            counterDisp: "MÀN HÌNH QUẦY",
            feedback: "ĐÁNH GIÁ",
            dashboard: "THỐNG KÊ",
            users: "NHÂN VIÊN",
            categories: "DỊCH VỤ"
        },
        common: {
            loading: "Đang tải..."
        }
    }
};

export type Language = 'en' | 'vi';

// Simple hook for translations (can be moved to a context later if needed)
import { useState, useEffect } from 'react';

export const useTranslation = () => {
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem('qms_lang') as Language) || 'vi';
    });

    useEffect(() => {
        localStorage.setItem('qms_lang', lang);
    }, [lang]);

    return {
        t: translations[lang],
        lang,
        setLang
    };
};
