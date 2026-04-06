import { Loader2 } from 'lucide-react';
import styles from './Loader.module.css';

interface LoaderProps {
    className?: string;
    size?: number;
    contextual?: boolean;
    centered?: boolean;
}

const Loader = ({ className = '', size = 40, contextual = false, centered = false }: LoaderProps) => {
    const classNames = [
        contextual ? styles.contextual : centered ? styles.centered : styles.loader,
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            <Loader2 className="loading-icon" size={size} />
        </div>
    );
};

export default Loader;
