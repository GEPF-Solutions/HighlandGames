import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { LiveBanner } from './components/LiveBanner';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TeamsPage } from './pages/TeamsPage';
import { DisciplinePage } from './pages/DisciplinePage';
import { AdminPage } from './pages/AdminPage';
import { TvPage } from './pages/TvPage';
import { Footer } from './components/Footer';

function App() {
    if (window.location.pathname === '/tv') return <TvPage />;
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
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ paddingTop: 72, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <LiveBanner />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/matches" element={<MatchesPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/discipline/:id" element={<DisciplinePage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;
