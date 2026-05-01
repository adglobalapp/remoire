import '@testing-library/jest-dom';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Lucide icons globally to avoid rendering complex SVGs in tests if needed,
// though usually not necessary with JSDOM.
// But ResizeObserver is definitely needed for some components.
globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

beforeEach(() => {
    console.log('Setup: creating modal-root');
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('id', 'modal-root');
    document.body.appendChild(modalRoot);
});

afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
});
