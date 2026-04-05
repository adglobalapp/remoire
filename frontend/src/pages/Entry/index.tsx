import Navbar from '../../components/common/Navbar';
import LeftSidebar from './components/sidebar/LeftSidebar';
import RightSidebar from './components/sidebar/RightSidebar';
import Canvas from './components/editor/Canvas';
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
                    <Canvas key={activeEntry?.id ?? 'none'} />
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