export const PRESET_COLORS = ['#f8a5c2', '#f9e2af', '#a6e3a1', '#89dceb', '#cba6f7', '#fab387', '#f5e0dc'];

const PALETTE_VARS: Record<string, string> = {
    '#f8a5c2': 'var(--color-pink)',
    '#f9e2af': 'var(--color-yellow)',
    '#a6e3a1': 'var(--color-green)',
    '#89dceb': 'var(--color-sky)',
    '#cba6f7': 'var(--color-mauve)',
    '#fab387': 'var(--color-peach)',
    '#f5e0dc': 'var(--color-flamingo)',
};

// Theme-aware surface color: palette colors resolve to their theme variant, other colors get tinted in dark mode.
export const themedColor = (hex: string) =>
    PALETTE_VARS[hex.toLowerCase()] ?? `color-mix(in srgb, ${hex} var(--tint-strength), var(--color-light-beige))`;
