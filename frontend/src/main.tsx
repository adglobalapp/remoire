import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@fontsource/odor-mean-chey/400.css';
import '@fontsource/gurajada/400.css';
import '@fontsource/gudea/400.css';
import '@fontsource/gudea/700.css';
import '@fontsource/kaushan-script/400.css';

import { AuthProvider } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <AuthProvider>
            <UserProfileProvider>
                <App />
            </UserProfileProvider>
        </AuthProvider>
    </StrictMode>,
);
