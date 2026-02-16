import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import styles from './EntryPage.module.css';

const EntryPage = () => {
    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <main className={styles.mainLayout}>

                <div className={styles.leftColumn}>
                    <LeftSidebar />
                </div>

                <section className={styles.editorArea}></section>

                <div className={styles.rightColumn}>
                    <RightSidebar />
                </div>

            </main>
        </div>
    );
};

export default EntryPage;