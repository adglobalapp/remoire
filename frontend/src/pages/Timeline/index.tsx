import Navbar from '../../components/common/Navbar';
import Sidebar from './components/sidebar/Left';
import Canvas from './components/canvas/Canvas';
import Loader from '../../components/common/Loader';
import { useTimelineContext } from '../../contexts/TimelineContext';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const TimelinePage = () => {
    const { leftOpen: isLeftOpen, toggleLeft } = useResponsiveSidebar();
    const { isLoading } = useTimelineContext();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                {isLoading ? (
                    <Loader centered />
                ) : (
                    <>
                        <div className="sidebar-left">
                            <Sidebar
                                isOpen={isLeftOpen}
                                onToggle={toggleLeft}
                            />
                        </div>

                        <section className="content-area-full">
                            <Canvas />
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default TimelinePage;
