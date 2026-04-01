import Navbar from '../../components/Navbar/Navbar';
import LeftSidebar from './components/LeftSidebar';
import TimelineCanvas from './components/TimelineCanvas';

const TimelinePage = () => {
    return (
        <div className="page-container">
            <Navbar />

            <main className="main-layout">
                <div className="sidebar-left">
                    <LeftSidebar />
                </div>

                <section className="content-area-full">
                    <TimelineCanvas />
                </section>
            </main>
        </div>
    );
};

export default TimelinePage;
