import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import styles from './DeleteConfirmation.module.css';
import { type DeleteConfirmationProps } from '../../types';

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    loadingText,
}) => {
    return createPortal(
        <div className="global-modal-overlay" onClick={isLoading ? undefined : onCancel}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitleContainer}>
                        <AlertTriangle className={styles.alertIcon} size={24} />
                        <h3>{title}</h3>
                    </div>
                    <button className="global-modal-close-btn" onClick={onCancel} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.modalMessage}>{message}</p>
                </div>

                <div className={styles.modalFooter}>
                    <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button className={`btn btn-danger`} onClick={onConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" /> {loadingText || 'Processing...'}
                            </>
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root')!,
    );
};

export default DeleteConfirmation;
