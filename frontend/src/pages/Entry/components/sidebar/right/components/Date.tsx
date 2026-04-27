import { Calendar } from 'lucide-react';
import { useEntryContext } from '../../../../../../contexts/EntryContext';
import styles from '../Right.module.css';
import toast from 'react-hot-toast';
import { type ApiError } from '../../../../../../types';

const Date = () => {
    const { activeEntry, updateEntry } = useEntryContext();

    const handleDateChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (activeEntry) {
            try {
                const res = await updateEntry(activeEntry.id, { date: e.target.value });
                if (res?.message) toast.success(res.message);
            } catch (err: unknown) {
                const error = err as ApiError;
                toast.error(error.message || 'Failed to update date');
            }
        }
    };

    const dateValue = activeEntry?.date ? activeEntry.date.substring(0, 10) : '';

    return (
        <div className={styles.metaGroup}>
            <div className={styles.infoLabelGroup}>
                <Calendar size={16} />
                <label>Date</label>
            </div>
            <div className={styles.metaValue}>
                <input
                    type="date"
                    value={dateValue}
                    onChange={handleDateChange}
                    onClick={(e) => 'showPicker' in e.target && (e.target as HTMLInputElement).showPicker()}
                    className={styles.dateInput}
                    disabled={!activeEntry}
                />
            </div>
        </div>
    );
};

export default Date;
