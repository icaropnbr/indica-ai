import { useAuth } from '../hooks/useAuth';

export function Login() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] max-w-md mx-auto w-full px-4 pt-16">
      <div className="w-full glass-card p-8 rounded-3xl flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-slackey text-primary mb-4 tracking-normal">Indica aí</h1>
        <p className="text-on-surface-variant mb-8">Faça login para compartilhar e favoritar indicações.</p>
        
        {user ? (
          <div className="flex flex-col items-center w-full">
            <p className="mb-4 font-semibold">Logado como {user.email}</p>
            <button className="w-full bg-surface-variant text-on-surface py-3 rounded-xl font-bold hover:bg-surface-variant/80 transition-colors">
              Sair
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full">
            <button className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm">
              Entrar com Google
            </button>
            <button className="w-full bg-[#000000] text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors shadow-sm">
              Entrar com Apple
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
