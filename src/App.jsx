import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import GardenLayout from './feature/GardenOS/Layout';
import Dashboard from './feature/GardenOS/pages/Dashboard';
import GardenSetup from './feature/GardenOS/pages/GardenSetup';
import Analytics from './feature/GardenOS/pages/Analytics';
import AIInsights from './feature/GardenOS/pages/AIInsights';
import ControlPanel from './feature/GardenOS/pages/ControlPanel';
import Reports from './feature/GardenOS/pages/Reports';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<GardenLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="setup" element={<GardenSetup />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="insights" element={<AIInsights />} />
          <Route path="control" element={<ControlPanel />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
