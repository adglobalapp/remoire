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
    const { isAuthenticated } = useAuth();

    const refreshBlockedUsers = useCallback(async () => {
        if (!isAuthenticated) {
            setBlockedUserIds(new Set());
            return;
        }
        const blocked = await getBlockedUsers();
        setBlockedUserIds(new Set(blocked.map((u) => u.id)));
    }, [isAuthenticated]);

    useEffect(() => {
        Promise.resolve().then(() => {
            refreshBlockedUsers();
        });
    }, [refreshBlockedUsers]);

    const isBlocked = (userId: number) => blockedUserIds.has(userId);

    const blockUser = async (userId: number) => {
        try {
            const res = await apiBlockUser(userId);
            if (res?.message) toast.success(res.message);
            refreshBlockedUsers();
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
            if (res?.message) toast.success(res.message);
            refreshBlockedUsers();
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
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};
