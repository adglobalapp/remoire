import Navbar from '../../components/common/Navbar';
import LeftSidebar from './components/sidebar/left/Left';
import RightSidebar from './components/sidebar/right/Right';
import Canvas from './components/editor/Canvas';
import Loader from '../../components/common/Loader';
import { useEntryContext } from '../../contexts/EntryContext';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const EntryPage = () => {
    const { activeEntry, isLoading } = useEntryContext();
    const { leftOpen, rightOpen, toggleLeft, toggleRight } = useResponsiveSidebar(activeEntry?.id);

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                <div className="sidebar-left">
                    <LeftSidebar isOpen={leftOpen} onToggle={toggleLeft} />
                </div>

                <section className="content-area-full">
                    {isLoading ? <Loader centered /> : <Canvas key={activeEntry?.id ?? 'none'} />}
                </section>

                <div className="sidebar-right">
                    <RightSidebar isOpen={rightOpen} onToggle={toggleRight} />
                </div>
            </main>
        </div>
    );
};

export default EntryPage;
