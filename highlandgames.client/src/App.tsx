import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TeamsPage } from './pages/TeamsPage';
import { DisciplinePage } from './pages/DisciplinePage';
import { AdminPage } from './pages/AdminPage';

function App() {
    const [page, setPage] = useState<string>(() => localStorage.getItem('hg_page') || 'home');

    const navigate = useCallback((p: string) => {
        setPage(p);
        localStorage.setItem('hg_page', p);
        window.scrollTo(0, 0);
    }, []);

    const renderPage = () => {
        if (page.startsWith('disc-')) return <DisciplinePage discId={page.replace('disc-', '')} navigate={navigate} />;
        switch (page) {        
            case 'home': return <HomePage navigate={navigate} />;
            case 'results': return <ResultsPage />;
            case 'matches': return <MatchesPage navigate={navigate} />;
            case 'teams': return <TeamsPage />;            
            case 'admin': return <AdminPage />;
            default: return <HomePage navigate={navigate} />;
        }
    };

    return (
        <>
            <Header navigate={navigate} currentPage={page} />
            <main style={{ paddingTop: 72 }}>
                {renderPage()}
            </main>
        </>
    );
}

export default App;