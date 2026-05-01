import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { type User, type UserProfileContextType, type ApiError } from '../types';
import UserProfile from '../pages/Friendlist/components/modal/UserProfile';
import { getBlockedUsers, unblockUser as apiUnblockUser } from '../api/profile';
import { blockUser as apiBlockUser } from '../api/relationships';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

export const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(new Set());
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [isLoadingBlocked, setIsLoadingBlocked] = useState(false);
    const { isAuthenticated } = useAuth();

    const refreshBlockedUsers = useCallback(
        async (silent = false) => {
            if (!isAuthenticated) {
                setBlockedUserIds(new Set());
                setBlockedUsers([]);
                return;
            }

            if (!silent) setIsLoadingBlocked(true);
            try {
                const blocked = await getBlockedUsers();
                setBlockedUsers(blocked.map((u) => ({ ...u, relationship_status: 'blocked' })));
                setBlockedUserIds(new Set(blocked.map((u) => u.id)));
            } catch (err) {
                console.error('Failed to refresh blocked users:', err);
            } finally {
                if (!silent) setIsLoadingBlocked(false);
            }
        },
        [isAuthenticated],
    );

    useEffect(() => {
        refreshBlockedUsers(false);
    }, [refreshBlockedUsers]);

    const isBlocked = (userId: number) => blockedUserIds.has(userId);

    const blockUser = async (userId: number) => {
        try {
            const res = await apiBlockUser(userId);
            await refreshBlockedUsers(true);
            if (res?.message) toast.success(res.message);
            return true;
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to block user');
            return false;
        }
    };

    const unblockUser = async (userId: number) => {
        try {
            const res = await apiUnblockUser(userId);
            await refreshBlockedUsers(true);
            if (res?.message) toast.success(res.message);
            return true;
        } catch (err: unknown) {
            const error = err as ApiError;
            toast.error(error.message || 'Failed to unblock user');
            return false;
        }
    };

    const handleShowProfile = (user: User) => {
        const userWithStatus = { ...user };

        if (isBlocked(user.id)) {
            userWithStatus.relationship_status = 'blocked';
        } else if (!userWithStatus.relationship_status) {
            userWithStatus.relationship_status = 'none';
        }

        setSelectedUser(userWithStatus);
    };

    return (
        <UserProfileContext.Provider
            value={{
                showProfile: handleShowProfile,
                blockedUserIds,
                blockedUsers,
                isLoadingBlocked,
                isBlocked,
                refreshBlockedUsers,
                blockUser,
                unblockUser,
            }}
        >
            {children}
            {selectedUser && <UserProfile user={selectedUser} onClose={() => setSelectedUser(null)} />}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const ctx = useContext(UserProfileContext);
    if (ctx === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return ctx;
};
