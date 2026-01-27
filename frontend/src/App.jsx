import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Alerts from './pages/Alerts';
import SystemInfo from './pages/SystemInfo';
import Settings from './pages/Settings';
import InfoPanel from './components/InfoPanel';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'history':
        return <History />;
      case 'alerts':
        return <Alerts />;
      case 'system-info':
        return <SystemInfo />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Router>
      <div className="flex h-screen bg-dark-bg overflow-hidden">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={setCurrentPage}
          onAboutClick={() => setShowInfoPanel(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
        <InfoPanel isOpen={showInfoPanel} onClose={() => setShowInfoPanel(false)} />
      </div>
    </Router>
  );
}

export default App;
