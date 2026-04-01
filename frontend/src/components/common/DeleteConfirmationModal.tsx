import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import styles from './DeleteConfirmationModal.module.css';
import type { DeleteConfirmationModalProps } from '../../types';

const DeleteConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message
}: DeleteConfirmationModalProps) => {
    if (!isOpen) return null;

    return createPortal(
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitleContainer}>
                        <div className={styles.warningIcon}>
                            <AlertTriangle size={28} />
                        </div>
                        <h3>{title}</h3>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.modalMessage}>
                        {message}
                    </p>
                </div>
                <div className={styles.modalFooter}>
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className={`btn ${styles.deleteBtn}`} onClick={onConfirm}>
                        Delete
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default DeleteConfirmationModal;
