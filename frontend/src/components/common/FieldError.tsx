import React from 'react';
import { AlertCircle } from 'lucide-react';

import { type FieldErrorProps } from '../../types';

const FieldError: React.FC<FieldErrorProps> = ({ errors }) => {
    if (!errors || errors.length === 0) return null;

    const messages = errors.filter((msg) => msg && msg.trim());
    if (messages.length === 0) return null;

    return (
        <div className="field-errors-container">
            {messages.map((msg, idx) => (
                <span key={idx} className="field-error-text">
                    <AlertCircle size={16} /> {msg}
                </span>
            ))}
        </div>
    );
};

export default FieldError;
