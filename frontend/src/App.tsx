import { useState, createContext, useContext } from 'react';
import EntryPage from './pages/Entry/EntryPage';
import TimelinePage from './pages/Timeline/TimelinePage';
import { EntryProvider } from './contexts/EntryContext';
import { TimelineProvider } from './contexts/TimelineContext';

import { type Page } from './types';

export const PageContext = createContext<{
    page: Page;
    setPage: (p: Page) => void;
}>({ page: 'entries', setPage: () => { } });

export const usePage = () => useContext(PageContext);

function App() {
    const [page, setPage] = useState<Page>('entries');

    return (
        <PageContext.Provider value={{ page, setPage }}>
            <EntryProvider>
                <TimelineProvider>
                    {page === 'entries' && <EntryPage />}
                    {page === 'timelines' && <TimelinePage />}
                </TimelineProvider>
            </EntryProvider>
        </PageContext.Provider>
    );
}

export default App;
