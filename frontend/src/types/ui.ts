import { type ReactNode } from 'react';
import { type Entry, type User } from './models';

export interface LeftSidebarProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

export interface TimelineNodeProps {
    entry: Entry;
    side: 'left' | 'right';
}

export interface AddTimelineNodeModalProps {
    onClose: () => void;
    entryToEdit?: Entry;
}

export interface EntryPreviewModalProps {
    entry: Entry;
    onClose: () => void;
}

export interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: ReactNode;
}

export interface ConfirmationModalProps {
    title: string;
    message: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export interface RegisterModalProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export interface LoginModalProps {
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export interface UserProfileModalProps {
    user: User;
    onClose: () => void;
    onBlock: (id: number) => void;
}

export interface FriendRowProps {
    user: User;
    type: 'friend' | 'pending' | 'sent';
    onAccept?: (id: number) => void;
    onDelete: (id: number) => void;
    onViewProfile: (user: User) => void;
}

export interface AddFriendModalProps {
    onClose: () => void;
    onRefresh: () => void;
}

export interface AddParticipantModalProps {
    onClose: () => void;
    onSelectFriend: (userId: number) => void;
    friends: User[];
}
