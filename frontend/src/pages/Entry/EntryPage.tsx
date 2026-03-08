import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import EntryEditor from './components/EntryEditor';
import { useEntryContext } from '../../contexts/EntryContext';
import styles from './EntryPage.module.css';

const EntryPage = () => {
    const { activeEntry } = useEntryContext();

    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <main className={styles.mainLayout}>
                <div className={styles.leftColumn}>
                    <LeftSidebar />
                </div>

                <section className={styles.editorArea}>
                    <EntryEditor key={activeEntry?.id ?? 'none'} />
                </section>

                <div className={styles.rightColumn}>
                    <RightSidebar />
                </div>
            </main>
        </div>
    );
};

export default EntryPage;