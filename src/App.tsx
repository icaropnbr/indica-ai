import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Admin } from './pages/Admin';
import { CategoriesAdmin } from './pages/CategoriesAdmin';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { Indicate } from './pages/Indicate';

export default function App() {
  return (
    <div className="bg-background min-h-screen pb-20 font-sans text-on-surface">
      <Navbar />
      <main className="max-w-[1200px] mx-auto p-4 md:p-8 mt-16 md:mt-24">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/categories" element={<CategoriesAdmin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/indicate" element={<Indicate />} />
        </Routes>
      </main>
    </div>
  );
}

