import Navbar from '../../components/common/Navbar';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import EntryEditor from './components/EntryEditor';
import { useEntryContext } from '../../contexts/EntryContext';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const EntryPage = () => {
    const { activeEntry } = useEntryContext();
    const {
        leftOpen,
        rightOpen,
        toggleLeft,
        toggleRight
    } = useResponsiveSidebar();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                <div className="sidebar-left">
                    <LeftSidebar
                        isOpen={leftOpen}
                        onToggle={toggleLeft}
                    />
                </div>

                <section className="content-area-full">
                    <EntryEditor key={activeEntry?.id ?? 'none'} />
                </section>

                <div className="sidebar-right">
                    <RightSidebar
                        isOpen={rightOpen}
                        onToggle={toggleRight}
                    />
                </div>
            </main>
        </div>
    );
};

export default EntryPage;