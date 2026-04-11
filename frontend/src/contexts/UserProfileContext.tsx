import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User, type UserProfileContextType } from '../types';
import UserProfile from '../pages/Friendlist/components/modal/UserProfile';
import { getBlockedUsers, unblockUser as apiUnblockUser } from '../api/profile';
import { blockUser as apiBlockUser } from '../api/friends';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [blockedUserIds, setBlockedUserIds] = useState<Set<number>>(new Set());
    const { isAuthenticated } = useAuth();

    const refreshBlockedUsers = async () => {
        if (!isAuthenticated) {
            setBlockedUserIds(new Set());
            return;
        }
        try {
            const blocked = await getBlockedUsers();
            setBlockedUserIds(new Set(blocked.map(u => u.id)));
        } catch (error) {
            console.error('Failed to fetch blocked users:', error);
        }
    };

    useEffect(() => {
        refreshBlockedUsers();
    }, [isAuthenticated]);

    const isBlocked = (userId: number) => blockedUserIds.has(userId);

    const blockUser = async (userId: number) => {
        try {
            const success = await apiBlockUser(userId);
            if (success) {
                toast.success('User blocked');
                refreshBlockedUsers();
                return true;
            }
        } catch (error) {
            toast.error('Failed to block user');
        }
        return false;
    };

    const unblockUser = async (userId: number) => {
        try {
            await apiUnblockUser(userId);
            toast.success('User unblocked');
            refreshBlockedUsers();
            return true;
        } catch (error) {
            toast.error('Failed to unblock user');
        }
        return false;
    };

    const handleShowProfile = (user: User) => {
        const userWithStatus = { ...user };

        if (isBlocked(user.id)) {
            userWithStatus.friend_status = 'blocked';
        } else if (!userWithStatus.friend_status) {
            userWithStatus.friend_status = 'none';
        }

        setSelectedUser(userWithStatus);
    };

    return (
        <UserProfileContext.Provider value={{
            showProfile: handleShowProfile,
            blockedUserIds,
            isBlocked,
            refreshBlockedUsers,
            blockUser,
            unblockUser
        }}>
            {children}
            {selectedUser && (
                <UserProfile
                    user={selectedUser}
                    onClose={() => setSelectedUser(null)}
                />
            )}
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
