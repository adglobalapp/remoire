import { useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

// The initial theme is applied by the inline script in index.html to avoid a flash on load.
const getCurrentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export const useTheme = () => {
    const [theme, setTheme] = useState<Theme>(getCurrentTheme);

    const toggleTheme = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Storage unavailable (private mode) - theme still applies for this session.
        }
        setTheme(next);
    };

    return { theme, toggleTheme };
};
