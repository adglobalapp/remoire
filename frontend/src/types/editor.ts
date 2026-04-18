import { type Editor } from '@tiptap/react';
import { type PageSettings } from './pages';

export type FontSizeOptions = {
    types: string[],
};

export interface ResizableImageAttributes {
    src: string;
    alt?: string;
    title?: string;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    rotation?: number;
}

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
