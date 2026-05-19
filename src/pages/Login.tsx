import { useState, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

function getPasswordStrength(password: string) {
  let score = 0;
  if (!password) return { score, label: '', color: 'bg-transparent' };
  
  if (password.length > 5) score += 1;
  if (password.length > 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score, label: 'Fraca', color: 'bg-red-500' };
  if (score <= 4) return { score, label: 'Média', color: 'bg-yellow-500' };
  return { score, label: 'Forte', color: 'bg-green-500' };
}

export function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Preencha email e senha.');
      return;
    }
    setError('');
    setIsLoggingIn(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      navigate('/');
    } catch (err: any) {
      let message = isSignUp ? 'Erro ao criar conta.' : 'Erro ao fazer login.';
      if (err.code === 'auth/email-already-in-use') message = 'E-mail já está em uso.';
      if (err.code === 'auth/invalid-credential') message = 'Credenciais inválidas.';
      if (err.code === 'auth/weak-password') message = 'A senha é muito fraca.';
      setError(message);
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

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto w-full px-4 pt-16">
      <div className="w-full glass-card p-8 rounded-3xl flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-slackey text-primary mb-4 tracking-normal">Indica aí</h1>
        <p className="text-on-surface-variant mb-6">
          {isSignUp ? 'Crie sua conta para compartilhar indicações.' : 'Faça login para compartilhar e favoritar indicações.'}
        </p>
        
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
          <div className="flex flex-col gap-6 w-full">
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-on-surface">Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-surface border border-outline rounded-xl px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="******"
                  required
                />
                {isSignUp && password.length > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant">Força da senha:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{strength.label}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level} 
                            className={`h-2 w-4 rounded-sm ${level <= strength.score ? strength.color : 'bg-surface-variant'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button 
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? 'Aguarde...' : isSignUp ? 'Criar conta' : 'Login com e-mail'}
              </button>

              <div className="text-center mt-2">
                {isSignUp ? (
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-primary hover:underline text-sm font-medium">
                    Já tenho conta
                  </button>
                ) : (
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-primary hover:underline text-sm font-medium">
                    Criar conta
                  </button>
                )}
              </div>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-outline"></div>
              <span className="flex-shrink-0 mx-4 text-on-surface-variant text-sm">ou</span>
              <div className="flex-grow border-t border-outline"></div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-white text-gray-900 border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Entrar com Google
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
