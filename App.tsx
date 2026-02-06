
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import QrCodes from './pages/QrCodes';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import PublicProfile from './pages/PublicProfile';
import Profile from './pages/Profile';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearch, setGlobalSearch] = useState('');
  const [publicProfileId, setPublicProfileId] = useState<string | null>(null);

  const checkUrlParams = () => {
    // Detecta ?profile=ID na URL
    const params = new URLSearchParams(window.location.search);
    const profileId = params.get('profile');
    
    if (profileId) {
      console.log("Detectado Perfil Público via URL:", profileId);
      setPublicProfileId(profileId);
    } else {
      setPublicProfileId(null);
    }
  };

  useEffect(() => {
    // 1. Checar parâmetros da URL imediatamente
    checkUrlParams();

    // 2. Checar sessão do administrador
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
    
    checkUser();

    // Listener para mudanças de navegação (popstate)
    const handleUrlChange = () => checkUrlParams();
    window.addEventListener('popstate', handleUrlChange);
    
    // Intervalo de segurança para detectar mudanças via scripts sem recarga
    const interval = setInterval(checkUrlParams, 300);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogin = () => setIsAuthenticated(true);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setActivePage('dashboard');
  };

  const handleBackFromPublic = () => {
    setPublicProfileId(null);
    // Remove o parâmetro da URL de forma limpa
    const url = new URL(window.location.href);
    url.searchParams.delete('profile');
    window.history.pushState({}, '', url.pathname);
  };

  // PRIORIDADE MÁXIMA: Perfil Público (Não exige login)
  if (publicProfileId) {
    return <PublicProfile id={publicProfileId} onBack={handleBackFromPublic} />;
  }

  // Estado de carregamento
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F6F8FA]">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Centro 4.0 Sincronizando</p>
      </div>
    );
  }

  // Se não estiver logado, mostra tela de Login
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard />;
      case 'management': return <Management searchTerm={globalSearch} />;
      case 'qrcodes': return <QrCodes />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex bg-[#F6F8FA] min-h-screen">
      <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
      
      <main className="flex-1 ml-64 min-h-screen">
        <Topbar 
          searchTerm={globalSearch}
          onSearch={(term) => {
            setGlobalSearch(term);
            if (term.length > 0 && activePage !== 'management') {
              setActivePage('management');
            }
          }} 
          onNavigate={setActivePage} 
          onLogout={handleLogout} 
        />
        <div className="relative">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
