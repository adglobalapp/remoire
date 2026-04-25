import { Loader2 } from 'lucide-react';
import styles from './Loader.module.css';

import { type LoaderProps } from '../../types';

const Loader: React.FC<LoaderProps> = ({ className = '', size = 40, centered = false }) => {
    const classNames = [centered ? styles.centered : styles.loader, className].filter(Boolean).join(' ');

    return (
        <div className={classNames}>
            <Loader2 className="loading-icon" size={size} />
        </div>
    );
};

export default Loader;
