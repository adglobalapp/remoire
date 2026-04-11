import { useState } from 'react';
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
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import { EntryProvider } from './contexts/EntryContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return (
            <div className="page-container">
                <Navbar />
                <main className="main-layout">
                    <Loader centered />
                </main>
            </div>
        );
    }
    
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    
    return <>{children}</>;
}

function LandingRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) {
        return <Loader centered />;
    }
    
    if (isAuthenticated) {
        return <Navigate to="/entries" replace />;
    }
    
    return <>{children}</>;
}

function AppContent() {
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    return (
        <EntryProvider>
            <TimelineProvider>
                <Routes>
                    <Route path="/" element={
                        <LandingRoute>
                            <>
                                <LandingPage
                                    onLogin={() => setShowLogin(true)}
                                    onRegister={() => setShowRegister(true)}
                                />
                                {showLogin && (
                                    <Login
                                        onClose={() => setShowLogin(false)}
                                        onSwitchToRegister={() => {
                                            setShowLogin(false);
                                            setShowRegister(true);
                                        }}
                                    />
                                )}
                                {showRegister && (
                                    <Register
                                        onClose={() => setShowRegister(false)}
                                        onSwitchToLogin={() => {
                                            setShowRegister(false);
                                            setShowLogin(true);
                                        }}
                                    />
                                )}
                            </>
                        </LandingRoute>
                    } />
                    
                    <Route path="/entries" element={
                        <ProtectedRoute>
                            <EntryPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/timelines" element={
                        <ProtectedRoute>
                            <TimelinePage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/friends" element={
                        <ProtectedRoute>
                            <FriendlistPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/notes" element={
                        <ProtectedRoute>
                            <NotesPage />
                        </ProtectedRoute>
                    } />
                    
                    <Route path="/maps" element={
                        <ProtectedRoute>
                            <MapsPage />
                        </ProtectedRoute>
                    } />

                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <div className="page-container">
                                <Navbar />
                                <main className="main-layout">
                                    <ProfilePage />
                                </main>
                            </div>
                        </ProtectedRoute>
                    } />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </TimelineProvider>
        </EntryProvider>
    );
}

function App() {
    return (
        <AuthProvider>
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
        </AuthProvider>
    );
}

export default App;
