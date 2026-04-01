import { useState, createContext, useContext, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import EntryPage from './pages/Entry/EntryPage';
import TimelinePage from './pages/Timeline/TimelinePage';
import LandingPage from './pages/Landing/LandingPage';
import LoginModal from './components/auth/LoginModal';
import RegisterModal from './components/auth/RegisterModal';
import { EntryProvider } from './contexts/EntryContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { type Page } from './types';

export const PageContext = createContext<{
    page: Page;
    setPage: (p: Page) => void;
}>({ page: 'entries', setPage: () => { } });

export const usePage = () => useContext(PageContext);

function AppContent() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const { page, setPage } = usePage();
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    // Redirect to landing if not authenticated
    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            setPage('landing');
        } else if (!isAuthLoading && isAuthenticated && page === 'landing') {
            setPage('entries');
        }
    }, [isAuthenticated, isAuthLoading, page, setPage]);

    if (isAuthLoading) {
        return (
            <div className="loading-screen">
                <Loader2 className="loading-icon" size={48} />
            </div>
        );
    }

    if (!isAuthenticated || page === 'landing') {
        return (
            <>
                <LandingPage
                    onLogin={() => setShowLogin(true)}
                    onRegister={() => setShowRegister(true)}
                />
                {showLogin && (
                    <LoginModal
                        onClose={() => setShowLogin(false)}
                        onSwitchToRegister={() => {
                            setShowLogin(false);
                            setShowRegister(true);
                        }}
                    />
                )}
                {showRegister && (
                    <RegisterModal
                        onClose={() => setShowRegister(false)}
                        onSwitchToLogin={() => {
                            setShowRegister(false);
                            setShowLogin(true);
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <EntryProvider>
            <TimelineProvider>
                {page === 'entries' ? <EntryPage /> : <TimelinePage />}
            </TimelineProvider>
        </EntryProvider>
    );
}

function App() {
    const [page, setPage] = useState<Page>('entries');

    return (
        <AuthProvider>
            <PageContext.Provider value={{ page, setPage }}>
                <Toaster
                    position="bottom-right"
                    containerStyle={{ zIndex: 10000000 }}
                    toastOptions={{
                        duration: 3000,
                        className: 'custom-toast',
                        success: {
                            className: 'custom-toast custom-toast-success',
                            iconTheme: {
                                primary: 'var(--color-success)',
                                secondary: 'var(--color-light-beige)',
                            },
                        },
                        error: {
                            className: 'custom-toast custom-toast-error',
                            iconTheme: {
                                primary: 'var(--color-error)',
                                secondary: 'var(--color-light-beige)',
                            },
                        },
                    }}
                />
                <AppContent />
            </PageContext.Provider>
        </AuthProvider>
    );
}

export default App;
