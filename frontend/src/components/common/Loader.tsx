import { Loader2 } from 'lucide-react';
import styles from './Loader.module.css';

interface LoaderProps {
    className?: string;
    size?: number;
    contextual?: boolean;
}

const Loader = ({ className = '', size = 32, contextual = false }: LoaderProps) => {
    return (
        <div className={`${contextual ? styles.contextual : styles.loader} ${className}`}>
            <Loader2 className="loading-icon" size={size} />
        </div>
    );
};

export default Loader;
