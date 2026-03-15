import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import { Bell, List, MagnifyingGlass } from '@phosphor-icons/react';

// Pages
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import FertilizerCalculator from './pages/FertilizerCalculator';
import DiseaseDetection from './pages/DiseaseDetection';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <List />
          </button>
          
          <div className="search-bar">
            <MagnifyingGlass weight="bold" />
            <input type="text" placeholder="Search insights..." />
          </div>
          
          <div className="user-profile">
            <div className="notification-icon">
              <Bell size={24} weight="duotone" />
              <span className="badge"></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">FA</div>
            </div>
          </div>
        </header>

        <section className="content-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/crop" element={<CropRecommendation />} />
            <Route path="/fertilizer" element={<FertilizerCalculator />} />
            <Route path="/disease" element={<DiseaseDetection />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default App;
