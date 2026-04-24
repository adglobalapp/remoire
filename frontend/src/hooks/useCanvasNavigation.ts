import { useState, useCallback, useEffect, useRef } from 'react';

import { type Transform, type Options } from '../types';

export const useCanvasNavigation = (options: Options = {}) => {
    const { minScale = 0.3, maxScale = 2, initialTransform = { x: 0, y: 0, scale: 1 } } = options;

    const [transform, setTransform] = useState<Transform>(initialTransform);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const lastTouchPosRef = useRef({ x: 0, y: 0 });
    const lastTouchDistanceRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent, canDrag: boolean) => {
        if (e.button === 0 && canDrag) {
            e.preventDefault();
            setIsDragging(true);
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            return true;
        }
        return false;
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                const dx = e.clientX - lastMousePosRef.current.x;
                const dy = e.clientY - lastMousePosRef.current.y;
                setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
                lastMousePosRef.current = { x: e.clientX, y: e.clientY };
            }
        },
        [isDragging],
    );

    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    const handleTouchStart = useCallback((e: React.TouchEvent, canDrag: boolean) => {
        if (!canDrag) return;

        if (e.touches.length === 1) {
            setIsDragging(true);
            lastTouchPosRef.current = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY,
            };
            lastTouchDistanceRef.current = null;
        } else if (e.touches.length === 2) {
            setIsDragging(true);
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            lastTouchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        }
    }, []);

    const handleTouchMove = useCallback(
        (e: TouchEvent) => {
            if (!isDragging) return;

            if (e.touches.length === 1 && lastTouchDistanceRef.current === null) {
                const dx = e.touches[0].clientX - lastTouchPosRef.current.x;
                const dy = e.touches[0].clientY - lastTouchPosRef.current.y;
                setTransform((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
                lastTouchPosRef.current = {
                    x: e.touches[0].clientX,
                    y: e.touches[0].clientY,
                };
            } else if (e.touches.length === 2) {
                e.preventDefault();
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastTouchDistanceRef.current !== null && containerRef.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
                    const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;

                    const ratio = distance / lastTouchDistanceRef.current;

                    setTransform((prev) => {
                        const nextScale = Math.min(maxScale, Math.max(minScale, prev.scale * ratio));
                        if (nextScale === prev.scale) return prev;

                        const nextX = centerX - ((centerX - prev.x) * nextScale) / prev.scale;
                        const nextY = centerY - ((centerY - prev.y) * nextScale) / prev.scale;
                        return { x: nextX, y: nextY, scale: nextScale };
                    });
                }
                lastTouchDistanceRef.current = distance;
            }
        },
        [isDragging, maxScale, minScale],
    );

    const handleTouchEnd = useCallback(() => {
        setIsDragging(false);
        lastTouchDistanceRef.current = null;
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();

            if (e.ctrlKey) {
                const rect = container.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;
                const sensitivity = 0.001;
                const delta = e.deltaY * sensitivity;

                setTransform((prev) => {
                    const nextScale = Math.min(maxScale, Math.max(minScale, prev.scale - delta));
                    if (nextScale === prev.scale) return prev;
                    const nextX = mouseX - ((mouseX - prev.x) * nextScale) / prev.scale;
                    const nextY = mouseY - ((mouseY - prev.y) * nextScale) / prev.scale;
                    return { x: nextX, y: nextY, scale: nextScale };
                });
            } else {
                setTransform((prev) => ({
                    ...prev,
                    x: prev.x - e.deltaX,
                    y: prev.y - e.deltaY,
                }));
            }
        };

        container.addEventListener('wheel', onWheel, { passive: false });
        return () => container.removeEventListener('wheel', onWheel);
    }, [maxScale, minScale]);

    return {
        transform,
        setTransform,
        isDragging,
        containerRef,
        handleMouseDown,
        handleTouchStart,
    };
};
