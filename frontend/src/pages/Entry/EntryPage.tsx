import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import EntryEditor from './components/EntryEditor';
import { useEntryContext } from '../../contexts/EntryContext';
const EntryPage = () => {
    const { activeEntry } = useEntryContext();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                <div className="sidebar-left">
                    <LeftSidebar />
                </div>

                <section className="content-area-full">
                    <EntryEditor key={activeEntry?.id ?? 'none'} />
                </section>

                <div className="sidebar-right">
                    <RightSidebar />
                </div>
            </main>
        </div>
    );
};

export default EntryPage;