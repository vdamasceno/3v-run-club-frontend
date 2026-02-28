// --- (NOVO) Componente Navbar (Barra de Navegação) ---
const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="w-full bg-indigo-700 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Título */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-white">3V Run Club</h1>
          </div>
          
          {/* Info do Usuário e Sair */}
          <div className="flex items-center">
            <span className="text-sm text-indigo-200 hidden sm:block">
              Logado como: {user.nome_completo} ({user.role})
            </span>
            <button
              onClick={onLogout}
              className="ml-4 px-3 py-2 bg-indigo-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-indigo-700"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;