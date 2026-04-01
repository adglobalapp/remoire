import Navbar from '../../components/common/Navbar';
import LeftSidebar from './components/LeftSidebar';
import TimelineCanvas from './components/TimelineCanvas';
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar';

const TimelinePage = () => {
    const { leftOpen: isLeftOpen, toggleLeft } = useResponsiveSidebar();

    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                <div className="sidebar-left">
                    <LeftSidebar
                        isOpen={isLeftOpen}
                        onToggle={toggleLeft}
                    />
                </div>

                <section className="content-area-full">
                    <TimelineCanvas />
                </section>
            </main>
        </div>
    );
};

export default TimelinePage;
