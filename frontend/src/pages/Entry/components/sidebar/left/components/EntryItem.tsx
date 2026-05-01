import { Trash2 } from 'lucide-react';
import { type EntryItemProps } from '../../../../../../types';
import { formatDateTime } from '../../../../../../utils/dateUtils';

const EntryItem = ({ entry, isActive, onSelect, onDelete }: EntryItemProps) => {
    return (
        <div className={`sidebar-item ${isActive ? 'active' : ''}`} onClick={() => onSelect(entry)}>
            <div className="sidebar-item-info">
                <span className="sidebar-item-title">{entry.title || 'Untitled'}</span>
                <span className="sidebar-item-meta">{formatDateTime(entry.created_at)}</span>
            </div>
            <button className="sidebar-delete-btn" onClick={(e) => onDelete(e, entry.id)}>
                <Trash2 size={16} />
            </button>
        </div>
    );
};

export default EntryItem;
