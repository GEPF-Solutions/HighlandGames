import { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';

function App() {
    const [page, setPage] = useState<string>(() => localStorage.getItem('hg_page') || 'home');

    const navigate = useCallback((p: string) => {
        setPage(p);
        localStorage.setItem('hg_page', p);
        window.scrollTo(0, 0);
    }, []);

    const renderPage = () => {
        switch (page) {
            case 'home': return <HomePage navigate={navigate} />;
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