import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Settings, LogIn, PlusCircle, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Feed', path: '/', icon: Home },
    { name: 'Indicar', path: '/indicate', icon: PlusCircle },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

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
              <div className="flex items-center gap-3 relative" ref={menuRef}>
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-on-surface">{user.displayName || user.name || 'Usuário'}</span>
                  <span className="text-xs text-on-surface-variant">{user.email}</span>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold hover:bg-primary/30 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {(user.displayName || user.name || 'U').charAt(0).toUpperCase()}
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-14 w-48 bg-surface-container-high border border-white/5 rounded-xl shadow-xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-4">
                    <Link
                      to="/profile"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-on-surface hover:bg-white/5 transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> Ver perfil
                    </Link>
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-white/5 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
