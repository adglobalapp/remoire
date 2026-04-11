import Navbar from '../../components/common/Navbar';
import Sidebar from './components/sidebar/Left';
import Canvas from './components/canvas/Canvas';
import Loader from '../../components/common/Loader';
import { useTimelineContext } from '../../contexts/TimelineContext';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const TimelinePage = () => {
    const { leftOpen: isLeftOpen, toggleLeft } = useResponsiveSidebar();
    const { isLoading, activeTimeline } = useTimelineContext();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                {isLoading && !activeTimeline ? (
                    <Loader centered />
                ) : (
                    <div className="display-contents" data-reloading={isLoading ? '' : undefined}>
                        <div className="sidebar-left">
                            <Sidebar
                                isOpen={isLeftOpen}
                                onToggle={toggleLeft}
                            />
                        </div>

                        <section className="content-area-full">
                            <Canvas />
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
};

export default TimelinePage;
