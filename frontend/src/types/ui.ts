import { type ReactNode } from 'react';
import { type Entry, type User } from './models';
import { type PageSettings } from './pages';

export interface LeftProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

export interface EditorProps {
    isDragMode: boolean;
    pageSettings?: PageSettings;
    onPageSettingsChange?: (settings: PageSettings) => void;
}

export interface LoaderProps {
    className?: string;
    size?: number;
    contextual?: boolean;
    centered?: boolean;
}

export interface FeatureCardProps {
    icon: any;
    title: string;
    content: string;
    children?: ReactNode;
    accentColor?: string;
    index: number;
}

export interface EntryCardProps {
    entry: Entry;
    side: 'left' | 'right';
    index?: number;
}

export interface AddEntryCardProps {
    onClose: () => void;
    entryToEdit?: Entry;
}

export interface EntryPreviewProps {
    entry: Entry;
    onClose: () => void;
}

export interface DeleteConfirmationProps {
    title: string | ReactNode;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
    loadingText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface RegisterProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export interface LoginProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export interface UserProfileProps {
    user: User;
    onClose: () => void;
}

export interface RowProps {
    user: User;
    type: 'friend' | 'pending' | 'sent';
    onAccept?: (id: number) => void;
    onDelete: (id: number) => void;
    onViewProfile: (user: User) => void;
    index?: number;
}

export interface LocationData {
    name: string;
    lat: number;
    lng: number;
}

export interface LocationPickerProps {
    onClose: () => void;
    onSelect: (location: LocationData) => void;
    initialLocation?: { lat: number; lng: number; name?: string };
}

export interface AddConnectionProps {
    onClose: () => void;
    onRefresh: () => void;
}

export interface RelationshipListProps {
    title: string;
    users: User[];
    type: 'pending' | 'sent' | 'friend';
    onAccept?: (id: number) => void;
    onDelete: (user: User) => void;
    onViewProfile: (user: User) => void;
    titleClassName?: string;
    showEmptyState?: boolean;
    emptyMessage?: string;
    delay?: number;
}

export interface AddParticipantProps {
    onClose: () => void;
    onSelectUser: (userId: number) => void;
    users: User[];
}

export interface AvatarProps {
    user?: User | { name: string; avatar_url?: string | null; id?: number };
    text?: string;
    size?: number;
    className?: string;
    showName?: boolean;
    backgroundColor?: string;
    color?: string;
    onClick?: () => void;
}

export interface UserProfileContextType {
    showProfile: (user: User) => void;
    blockedUserIds: Set<number>;
    isBlocked: (userId: number) => boolean;
    refreshBlockedUsers: () => Promise<void>;
    blockUser: (userId: number) => Promise<boolean>;
    unblockUser: (userId: number) => Promise<boolean>;
}
