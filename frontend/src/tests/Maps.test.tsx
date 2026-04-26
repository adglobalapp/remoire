import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MapsPage from '../pages/Maps/index';
import { EntryContext } from '../contexts/EntryContext';
import { AuthContext } from '../contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { type ReactNode } from 'react';
import { type AuthContextType, type EntryContextValue, type Entry, type User } from '../types';

vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }: { children: ReactNode }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: ({ children }: { children: ReactNode }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }: { children: ReactNode }) => <div data-testid="popup">{children}</div>,
}));

vi.mock('react-leaflet-cluster', () => ({
    default: ({ children }: { children: ReactNode }) => <div data-testid="cluster-group">{children}</div>,
}));

vi.mock('../components/common/Navbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));

const mockAuthContextValue: Partial<AuthContextType> = {
    user: { id: 1, name: 'John', email: 'john@example.com', friend_code: 'J1', created_at: '' } as User,
    isAuthenticated: true,
};

const mockEntryContextValue: Partial<EntryContextValue> = {
    entries: [
        {
            id: 1,
            user_id: 1,
            title: 'Map Entry',
            latitude: 47,
            longitude: 19,
            date: '2026-04-24',
            created_at: '',
            updated_at: '',
        } as Entry,
    ],
    selectEntry: vi.fn(),
};

describe('MapsPage', () => {
    it('renders map with markers', () => {
        render(
            <BrowserRouter>
                <AuthContext.Provider value={mockAuthContextValue as AuthContextType}>
                    <EntryContext.Provider value={mockEntryContextValue as EntryContextValue}>
                        <MapsPage />
                    </EntryContext.Provider>
                </AuthContext.Provider>
            </BrowserRouter>,
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByTestId('marker')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('Mapped Entries')).toBeInTheDocument();
    });
});
