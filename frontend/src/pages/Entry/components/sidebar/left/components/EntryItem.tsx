import { Trash2 } from 'lucide-react';
import { type EntryItemProps } from '../../../../../../types';

const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('hu-HU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
};

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
