import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../pages/Landing/index';

describe('LandingPage', () => {
    const onLogin = vi.fn();
    const onRegister = vi.fn();

    it('renders correctly', () => {
        render(<LandingPage onLogin={onLogin} onRegister={onRegister} />);

        expect(screen.getByText('Remoire')).toBeInTheDocument();
        expect(screen.getByText(/Capture the rhythm of your life/i)).toBeInTheDocument();
    });

    it('calls onLogin when Sign In button is clicked', () => {
        render(<LandingPage onLogin={onLogin} onRegister={onRegister} />);

        fireEvent.click(screen.getByText('Sign In'));
        expect(onLogin).toHaveBeenCalled();
    });

    it('calls onRegister when Get Started button is clicked', () => {
        render(<LandingPage onLogin={onLogin} onRegister={onRegister} />);

        fireEvent.click(screen.getByText('Get Started'));
        expect(onRegister).toHaveBeenCalled();
    });

    it('renders feature cards', () => {
        render(<LandingPage onLogin={onLogin} onRegister={onRegister} />);

        expect(screen.getByText('Personal Journal')).toBeInTheDocument();
        expect(screen.getByText('Living Timelines')).toBeInTheDocument();
        expect(screen.getByText('Quick Thoughts')).toBeInTheDocument();
        expect(screen.getByText('Share the Journey')).toBeInTheDocument();
    });
});
