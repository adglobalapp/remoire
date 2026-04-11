import type { FriendListProps } from '../../../../types';
import Row from './Row';
import classNames from 'classnames';
import styles from '../../index.module.css';

const FriendList = ({
    title,
    users,
    type,
    onAccept,
    onDelete,
    onViewProfile,
    titleClassName = '',
    showEmptyState = false,
    emptyMessage = "You haven't added any friends yet.",
    delay = 0
}: FriendListProps) => {
    if (users.length === 0 && !showEmptyState) return null;

    return (
        <div className={classNames(styles.friendList, { [styles.listMargin]: (type === 'pending' || type === 'sent') && users.length > 0 })} style={{ '--delay': delay } as React.CSSProperties}>
            <div className={`${styles.sectionTitle} ${titleClassName}`}>
                {title} {type === 'friend' && users.length > 0 && `(${users.length})`}
            </div>
            {users.length > 0 ? (
                users.map(user => (
                    <Row
                        key={user.id}
                        user={user}
                        type={type}
                        onAccept={onAccept}
                        onDelete={() => onDelete(user)}
                        onViewProfile={onViewProfile}
                    />
                ))
            ) : (
                <div className="empty-state-placeholder">{emptyMessage}</div>
            )}
        </div>
    );
};

export default FriendList;
