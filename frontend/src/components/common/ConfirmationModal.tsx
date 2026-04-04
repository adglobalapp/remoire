import { createPortal } from 'react-dom';
import { AlertCircle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
    title: string;
    message: string | React.ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel
}) => {
    return createPortal(
        <div className="global-modal-overlay" onClick={onCancel}>
            <div className="global-modal-content" onClick={e => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <div className={styles.headerTitleContainer}>
                        <div className={styles.warningIcon}>
                            <AlertCircle size={28} />
                        </div>
                        <h3>{title}</h3>
                    </div>
                    <button className="global-modal-close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.modalMessage}>
                        {message}
                    </p>
                </div>
                <div className={styles.modalFooter}>
                    <button className="btn btn-secondary" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button className={`btn btn-danger ${styles.confirmBtn}`} onClick={onConfirm}>
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
