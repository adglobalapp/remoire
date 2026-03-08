import EntryPage from './pages/Entry/EntryPage';
import { EntryProvider } from './contexts/EntryContext';

function App() {
  return (
    <EntryProvider>
      <EntryPage />
    </EntryProvider>
  );
}

export default App;
