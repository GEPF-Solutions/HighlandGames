import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { MatchesPage } from './pages/MatchesPage';
import { TeamsPage } from './pages/TeamsPage';
import { DisciplinePage } from './pages/DisciplinePage';
import { AdminPage } from './pages/AdminPage';
import { Footer } from './components/Footer';

function App() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ paddingTop: 72, flex: 1, display: 'flex', flexDirection: 'column' }}>
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
