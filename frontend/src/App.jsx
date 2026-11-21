import { Routes, Route } from 'react-router-dom';
import BottomNav from './components/BottomNav.jsx';
import PWABadge from './components/PWABadge.jsx';
import Hangar from './pages/Hangar.jsx';
import Progress from './pages/Progress.jsx';
import KitDetail from './pages/KitDetail.jsx';
import EditKit from './pages/EditKit.jsx';
import BuildLog from './pages/BuildLog.jsx';
import LogDetail from './pages/LogDetail.jsx';
import Add from './pages/Add.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <div className="shell">
      <main className="page">
        <Routes>
          <Route path="/" element={<Hangar />} />
          <Route path="/progres" element={<Progress />} />
          <Route path="/kit/:id" element={<KitDetail />} />
          <Route path="/kit/:id/edit" element={<EditKit />} />
          <Route path="/log" element={<BuildLog />} />
          <Route path="/log/:id" element={<LogDetail />} />
          <Route path="/tambah" element={<Add />} />
          <Route path="/profil" element={<Profile />} />
          <Route path="*" element={<p className="state">Halaman tidak ditemukan.</p>} />
        </Routes>
      </main>
      <PWABadge />
      <BottomNav />
    </div>
  );
}
