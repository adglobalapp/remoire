import { useState, useEffect, useRef } from 'react';

export const useResponsiveSidebar = (activeEntryId?: number, breakpoint = 1400) => {
    const isLargeScreen = typeof window !== 'undefined' && window.innerWidth > breakpoint;

    const [leftOpen, setLeftOpen] = useState(isLargeScreen);
    const [rightOpen, setRightOpen] = useState(isLargeScreen);
    const lastEntryId = useRef(activeEntryId);

    useEffect(() => {
        const handleResize = () => {
            const isDesktop = window.innerWidth > breakpoint;
            setLeftOpen(isDesktop);
            setRightOpen(isDesktop);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [breakpoint]);

    useEffect(() => {
        const isMobile = window.innerWidth <= breakpoint;
        if (!isMobile) return;

        const entryChanged = activeEntryId !== lastEntryId.current;

        if (entryChanged) {
            setLeftOpen(false);
            setRightOpen(false);
        }

        lastEntryId.current = activeEntryId;
    }, [activeEntryId, breakpoint]);

    const toggleLeft = () => {
        const isMobile = window.innerWidth <= breakpoint;
        if (isMobile) {
            if (!leftOpen) {
                setLeftOpen(true);
                setRightOpen(false);
            } else {
                setLeftOpen(false);
            }
        } else {
            setLeftOpen((prev) => !prev);
        }
    };

    const toggleRight = () => {
        const isMobile = window.innerWidth <= breakpoint;
        if (isMobile) {
            if (!rightOpen) {
                setRightOpen(true);
                setLeftOpen(false);
            } else {
                setRightOpen(false);
            }
        } else {
            setRightOpen((prev) => !prev);
        }
    };

    return {
        leftOpen,
        rightOpen,
        toggleLeft,
        toggleRight,
    };
};
