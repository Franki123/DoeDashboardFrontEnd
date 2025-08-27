import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import PlayerDashboard from './pages/PlayerDashboard';
import ViewerDashboard from './pages/ViewerDashboard';
import GameMasterDashboard from './pages/GameMasterDashboard';

const App: React.FC = () => (
  <div>
    <nav style={{ display: 'flex', gap: '1rem' }}>
      <Link to="/players">Players</Link>
      <Link to="/viewer">Viewer</Link>
      <Link to="/gamemaster">GameMaster</Link>
    </nav>
    <Routes>
      <Route path="/players" element={<PlayerDashboard />} />
      <Route path="/viewer" element={<ViewerDashboard />} />
      <Route path="/gamemaster" element={<GameMasterDashboard />} />
      <Route path="*" element={<div>Select a view</div>} />
    </Routes>
  </div>
);

export default App;
