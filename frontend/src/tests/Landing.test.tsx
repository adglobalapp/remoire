import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LandingPage from '../pages/Landing/index';

describe('LandingPage', () => {
    it('renders correctly', () => {
        render(<LandingPage />);

        expect(screen.getByText('Remoire')).toBeInTheDocument();
        expect(screen.getByText(/Capture the rhythm of your life/i)).toBeInTheDocument();
    });

    it('shows login modal when Sign In button is clicked', () => {
        render(<LandingPage />);

        fireEvent.click(screen.getByText('Sign In'));
        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    });

    it('shows register modal when Get Started button is clicked', () => {
        render(<LandingPage />);

        fireEvent.click(screen.getByText('Get Started'));
        expect(screen.getByText('Start Your Archive')).toBeInTheDocument();
    });

    it('renders feature cards', () => {
        render(<LandingPage />);

        expect(screen.getByText('Personal Journal')).toBeInTheDocument();
        expect(screen.getByText('Living Timelines')).toBeInTheDocument();
        expect(screen.getByText('Quick Thoughts')).toBeInTheDocument();
        expect(screen.getByText('Share the Journey')).toBeInTheDocument();
    });
});
