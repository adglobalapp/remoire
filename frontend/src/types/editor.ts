import { type Editor } from '@tiptap/react';
import { type PageSettings } from './pages';
import '@tiptap/core';

declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        setFontSize: (size: string) => ReturnType;
        unsetFontSize: () => ReturnType;
    }
}

export type FontSizeOptions = {
    types: string[];
};

export interface EditorToolbarProps {
    editor: Editor | null;
    isDragMode?: boolean;
    onToggleDragMode?: () => void;
    onColorPickerToggle?: (active: boolean) => void;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}

export interface Transform {
    x: number;
    y: number;
    scale: number;
}

export interface Options {
    minScale?: number;
    maxScale?: number;
    initialPadding?: number;
    zoomSpeed?: number;
    initialTransform?: Transform;
}

export interface TypographyProps {
    editor: Editor;
    isDragMode: boolean;
}

export interface FormattingProps {
    editor: Editor;
    isDragMode: boolean;
}

export interface ColorPaletteProps {
    editor: Editor;
    isDragMode: boolean;
    onColorPickerToggle?: (isPicking: boolean) => void;
}

export interface PageSettingsProps {
    isDragMode: boolean;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}

export interface TiptapNode {
    type: string;
    text?: string;
    content?: TiptapNode[];
    attrs?: Record<string, unknown>;
}
