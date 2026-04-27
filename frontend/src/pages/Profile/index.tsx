import Navbar from '../../components/common/Navbar';
import styles from './index.module.css';
import Header from './components/Header';
import Details from './components/Details';
import Password from './components/Password';
import Blocked from './components/Blocked';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../contexts/UserProfileContext';

const Profile = () => {
    const { isLoading: isAuthLoading } = useAuth();
    const { isLoadingBlocked } = useUserProfile();

    const isLoading = isAuthLoading || isLoadingBlocked;

    return (
        <div className="page-container">
            <Navbar />
            <main className="main-layout">
                {isLoading ? (
                    <Loader centered />
                ) : (
                    <div className={styles.profilePage}>
                        <div className={styles.profileContainer}>
                            <Header />

                            <div className={`${styles.profileCard} ${styles.formGrid}`}>
                                <Details />
                                <Password />
                            </div>

                            <Blocked />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
