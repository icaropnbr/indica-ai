import { Link, useLocation } from 'react-router-dom';
import { Home, User, Settings, LogIn, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Indicar', path: '/indicate', icon: PlusCircle },
    { name: 'Perfil', path: '/profile', icon: User },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/5 backdrop-blur-md border-t border-white/10 md:relative md:border-t-0 md:border-b md:bg-white/5 md:fixed md:top-0 md:bottom-auto z-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between md:justify-start items-center h-16 md:gap-8">
          <Link to="/" className="hidden md:flex items-center gap-2">
            <span className="text-2xl font-slackey text-primary tracking-tight">Indica aí</span>
          </Link>
          
          <div className="flex w-full md:w-auto justify-around md:justify-start md:gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex flex-col md:flex-row items-center gap-1 p-2 rounded-xl transition-all ${
                    isActive 
                      ? 'text-primary md:border-b-2 md:border-primary md:rounded-none md:bg-transparent' 
                      : 'text-on-surface-variant hover:text-on-surface md:hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-6 h-6 md:w-5 md:h-5 ${isActive ? 'fill-primary/20' : ''}`} />
                  <span className={`text-[10px] md:text-sm font-semibold ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex flex-1 justify-end">
            {!user ? (
              <Link to="/login" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/90 transition-colors">
                <LogIn className="w-4 h-4" /> Entrar
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-on-surface">{user.displayName || user.name || 'Usuário'}</span>
                  <span className="text-xs text-on-surface-variant">{user.email}</span>
                </div>
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                  {(user.displayName || user.name || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
