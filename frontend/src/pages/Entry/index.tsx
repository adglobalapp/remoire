import Navbar from '../../components/common/Navbar';
import LeftSidebar from './components/sidebar/Left';
import RightSidebar from './components/sidebar/Right';
import Canvas from './components/editor/Canvas';
import Loader from '../../components/common/Loader';
import { useEntryContext } from '../../contexts/EntryContext';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const EntryPage = () => {
    const { activeEntry, isLoading } = useEntryContext();
    const { leftOpen, rightOpen, toggleLeft, toggleRight } = useResponsiveSidebar();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                {isLoading ? (
                    <Loader centered />
                ) : (
                    <>
                        <div className="sidebar-left">
                            <LeftSidebar isOpen={leftOpen} onToggle={toggleLeft} />
                        </div>

                        <section className="content-area-full">
                            <Canvas key={activeEntry?.id ?? 'none'} />
                        </section>

                        <div className="sidebar-right">
                            <RightSidebar isOpen={rightOpen} onToggle={toggleRight} />
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default EntryPage;
