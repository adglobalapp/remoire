import { type ReactNode } from 'react';
import { type Entry, type User } from './models';

export interface LeftProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

export interface NodeProps {
    entry: Entry;
    side: 'left' | 'right';
    index?: number;
}

export interface AddNodeProps {
    onClose: () => void;
    entryToEdit?: Entry;
}

export interface EntryPreviewProps {
    entry: Entry;
    onClose: () => void;
}

export interface ConfirmationProps {
    title: string | ReactNode;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'danger';
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
    onBlock: (id: number) => void;
}

export interface RowProps {
    user: User;
    type: 'friend' | 'pending' | 'sent';
    onAccept?: (id: number) => void;
    onDelete: (id: number) => void;
    onViewProfile: (user: User) => void;
    index?: number;
}

export interface AddFriendProps {
    onClose: () => void;
    onRefresh: () => void;
}

export interface AddParticipantProps {
    onClose: () => void;
    onSelectFriend: (userId: number) => void;
    friends: User[];
}

export interface AvatarProps {
    user?: User | { name: string; avatar_url?: string | null; id?: number };
    text?: string;
    size?: number;
    className?: string;
    showName?: boolean;
    backgroundColor?: string;
    color?: string;
}
