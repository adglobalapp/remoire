import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import EntryPage from './pages/Entry';
import TimelinePage from './pages/Timeline';
import LandingPage from './pages/Landing';
import FriendlistPage from './pages/Friendlist';
import NotesPage from './pages/Notes';
import MapsPage from './pages/Maps';
import ProfilePage from './pages/Profile';
import MailboxPage from './pages/Mailbox';
import { EntryProvider } from './contexts/EntryContext';
import { TimelineProvider } from './contexts/TimelineContext';
import { useAuth } from './contexts/AuthContext';

function AuthenticatedLayout() {
    return (
        <EntryProvider>
            <TimelineProvider>
                <Outlet />
            </TimelineProvider>
        </EntryProvider>
    );
}

function App() {
    const { isAuthenticated, token } = useAuth();

    return (
        <BrowserRouter>
            <Toaster
                position="bottom-right"
                containerStyle={{ zIndex: 1000 }}
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
            <Routes>
                {token || isAuthenticated ? (
                    <Route element={<AuthenticatedLayout />}>
                        <Route path="/entries" element={<EntryPage />} />
                        <Route path="/timelines" element={<TimelinePage />} />
                        <Route path="/friends" element={<FriendlistPage />} />
                        <Route path="/notes" element={<NotesPage />} />
                        <Route path="/maps" element={<MapsPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/mailbox" element={<MailboxPage />} />
                        <Route path="*" element={<Navigate to="/entries" replace />} />
                    </Route>
                ) : (
                    <>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
