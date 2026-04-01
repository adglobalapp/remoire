import { useState, useCallback, useEffect, useRef } from 'react';

interface Transform {
    x: number;
    y: number;
    scale: number;
}

interface Options {
    minScale?: number;
    maxScale?: number;
    initialTransform?: Transform;
}

export const useCanvasNavigation = (options: Options = {}) => {
    const {
        minScale = 0.3,
        maxScale = 2,
        initialTransform = { x: 0, y: 0, scale: 1 }
    } = options;

    const [transform, setTransform] = useState<Transform>(initialTransform);
    const [isDragging, setIsDragging] = useState(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });
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

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging) {
            const dx = e.clientX - lastMousePosRef.current.x;
            const dy = e.clientY - lastMousePosRef.current.y;
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        }
    }, [isDragging]);


    const handleMouseUp = useCallback(() => setIsDragging(false), []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

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

                setTransform(prev => {
                    const nextScale = Math.min(maxScale, Math.max(minScale, prev.scale - delta));
                    if (nextScale === prev.scale) return prev;
                    const nextX = mouseX - (mouseX - prev.x) * nextScale / prev.scale;
                    const nextY = mouseY - (mouseY - prev.y) * nextScale / prev.scale;
                    return { x: nextX, y: nextY, scale: nextScale };
                });
            } else {
                setTransform(prev => ({
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
        handleMouseUp,
    };
};
