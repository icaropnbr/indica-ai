import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="hidden md:flex w-full py-8 px-margin-desktop bg-surface-container-lowest border-t border-outline-variant justify-between items-center gap-4 mt-20">
      <div className="flex gap-8">
        <Link to="/sobre" className="text-on-surface-variant hover:text-primary transition-colors text-base">
          Sobre
        </Link>
        <Link to="/privacidade" className="text-on-surface-variant hover:text-primary transition-colors text-base">
          Privacidade
        </Link>
        <Link to="/termos" className="text-on-surface-variant hover:text-primary transition-colors text-base">
          Termos
        </Link>
        <Link to="/contato" className="text-on-surface-variant hover:text-primary transition-colors text-base">
          Contato
        </Link>
      </div>
      <div className="flex flex-col gap-2 items-end">
        <h2 className="font-slackey text-2xl text-primary">Indica aí</h2>
        <p className="text-on-surface-variant text-sm">© {new Date().getFullYear()} Indica aí. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
