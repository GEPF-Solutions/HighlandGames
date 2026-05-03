import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LiveBanner } from './components/LiveBanner';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TeamsPage } from './pages/TeamsPage';
import { DisciplinePage } from './pages/DisciplinePage';
import { AdminPage } from './pages/AdminPage';
import { TvPage } from './pages/TvPage';

function MainLayout() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ paddingTop: 72, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <LiveBanner />
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/results" element={<ResultsPage />} />
                    <Route path="/disciplines" element={<MatchesPage />} />
                    <Route path="/disciplines/:id" element={<DisciplinePage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

function App() {
    return (
        <Routes>
            <Route path="/tv" element={<TvPage />} />
            <Route path="/*" element={<MainLayout />} />
        </Routes>
    );
}

export default App;
