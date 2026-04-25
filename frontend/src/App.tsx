import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Loader from './components/common/Loader';
import Navbar from './components/common/Navbar';
import EntryPage from './pages/Entry';
import TimelinePage from './pages/Timeline';
import LandingPage from './pages/Landing';
import FriendlistPage from './pages/Friendlist';
import NotesPage from './pages/Notes';
import MapsPage from './pages/Maps';
import ProfilePage from './pages/Profile';
import { EntryProvider } from './contexts/EntryContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';

function AuthGuard({ children, type }: { children: React.ReactNode; type: 'private' | 'guest' }) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        if (type === 'private') {
            return (
                <div className="page-container">
                    <Navbar />
                    <main className="main-layout">
                        <Loader centered />
                    </main>
                </div>
            );
        }
        return <Loader centered />;
    }

    if (type === 'private' && !isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (type === 'guest' && isAuthenticated) {
        return <Navigate to="/entries" replace />;
    }

    return <>{children}</>;
}

function AppContent() {
    return (
        <EntryProvider>
            <TimelineProvider>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <AuthGuard type="guest">
                                <LandingPage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/entries"
                        element={
                            <AuthGuard type="private">
                                <EntryPage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/timelines"
                        element={
                            <AuthGuard type="private">
                                <TimelinePage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/friends"
                        element={
                            <AuthGuard type="private">
                                <FriendlistPage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/notes"
                        element={
                            <AuthGuard type="private">
                                <NotesPage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/maps"
                        element={
                            <AuthGuard type="private">
                                <MapsPage />
                            </AuthGuard>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <AuthGuard type="private">
                                <div className="page-container">
                                    <Navbar />
                                    <main className="main-layout">
                                        <ProfilePage />
                                    </main>
                                </div>
                            </AuthGuard>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </TimelineProvider>
        </EntryProvider>
    );
}

function App() {
    return (
        <AuthProvider>
            <UserProfileProvider>
                <BrowserRouter>
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
                </BrowserRouter>
            </UserProfileProvider>
        </AuthProvider>
    );
}

export default App;
