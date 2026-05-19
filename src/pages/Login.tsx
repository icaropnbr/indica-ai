import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

export function Login() {
  const { user, signInWithGoogle, signInWithApple, signOut } = useAuth();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithGoogle();
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (err: any) {
      setError('Ocorreu um erro ao fazer login com o Google.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAppleLogin = async () => {
    setError('');
    setIsLoggingIn(true);
    try {
      await signInWithApple();
      const origin = location.state?.from?.pathname || '/';
      navigate(origin);
    } catch (err: any) {
      setError('Ocorreu um erro ao fazer login com a Apple.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError('Erro ao sair.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto w-full px-4 pt-16">
      <div className="w-full glass-card p-8 rounded-3xl flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-slackey text-primary mb-4 tracking-normal">Indica aí</h1>
        <p className="text-on-surface-variant mb-8">Faça login para compartilhar e favoritar indicações.</p>
        
        {error && <div className="text-error mb-4 text-sm">{error}</div>}

        {user ? (
          <div className="flex flex-col items-center w-full">
            <p className="mb-4 font-semibold">Logado como {user.email}</p>
            <button 
              onClick={handleSignOut}
              className="w-full bg-surface-variant text-on-surface py-3 rounded-xl font-bold hover:bg-surface-variant/80 transition-colors"
            >
              Sair
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? 'Entrando...' : 'Entrar com Google'}
            </button>
            <button 
              onClick={handleAppleLogin}
              disabled={isLoggingIn}
              className="w-full bg-[#000000] text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoggingIn ? 'Entrando...' : 'Entrar com Apple'}
            </button>
          </div>
        )}
        
        <p className="text-xs text-on-surface-variant mt-8 max-w-xs">
          Ao continuar, você concorda com nossos <br className="hidden sm:block" /> Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
