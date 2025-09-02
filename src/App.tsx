import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import PlayerDashboard from './pages/PlayerDashboard';
import ViewerDashboard from './pages/ViewerDashboard';
import GameMasterDashboard from './pages/GameMasterDashboard';

const App: React.FC = () => (
  <div>
    <nav className="nav">
      <Link to="/players" className="nav-link">Players</Link>
      <Link to="/viewer" className="nav-link">Viewer</Link>
      <Link to="/gamemaster" className="nav-link">GameMaster</Link>
    </nav>
    <Routes>
      <Route path="/players" element={<PlayerDashboard />} />
      <Route path="/viewer" element={<ViewerDashboard />} />
      <Route path="/gamemaster" element={<GameMasterDashboard />} />
      <Route path="*" element={<div className="select-view">Select a view above to get started</div>} />
    </Routes>
  </div>
);

export default App;
