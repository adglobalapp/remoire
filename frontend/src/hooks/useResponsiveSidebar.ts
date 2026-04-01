import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar visibility based on screen width.
 * Standardizes the 1400px breakpoint for mode where sidebars are open by default.
 */
export const useResponsiveSidebar = (breakpoint = 1400) => {
    // Initial state based on current window width
    const getInitialState = () => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth > breakpoint;
    };

    const [leftOpen, setLeftOpen] = useState(getInitialState);
    const [rightOpen, setRightOpen] = useState(getInitialState);

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = window.innerWidth > breakpoint;
            // When crossing the breakpoint, force the state to match the new mode
            if (isDesktop) {
                setLeftOpen(true);
                setRightOpen(true);
            } else {
                setLeftOpen(false);
                setRightOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    const toggleLeft = () => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= breakpoint;
        if (isMobile) {
            if (!leftOpen) {
                setLeftOpen(true);
                setRightOpen(false); // Force close other sidebar on mobile
            } else {
                setLeftOpen(false);
            }
        } else {
            setLeftOpen(prev => !prev);
        }
    };

    const toggleRight = () => {
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= breakpoint;
        if (isMobile) {
            if (!rightOpen) {
                setRightOpen(true);
                setLeftOpen(false); // Force close other sidebar on mobile
            } else {
                setRightOpen(false);
            }
        } else {
            setRightOpen(prev => !prev);
        }
    };

    return {
        leftOpen,
        setLeftOpen,
        rightOpen,
        setRightOpen,
        toggleLeft,
        toggleRight
    };
};
