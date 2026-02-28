import React, { useState } from 'react';

// --- (MODIFICADO) Componente de Login (com Logo e Footer) ---
const LoginScreen = ({ onLogin, error }) => {
  const [email, setEmail] = useState('admin@jefetraining.com');
  const [password, setPassword] = useState('1234');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onLogin(email, password);
    setIsLoading(false);
  };

  return (
    // (MODIFICADO) O div principal agora é flex-col para incluir o footer
    <div className="min-h-screen flex flex-col bg-gray-100">
      
      {/* (MODIFICADO) Conteúdo principal centralizado que "cresce" */}
      <div className="flex-grow flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          
          {/* --- (NOVO) Logo --- */}
          <div className="flex justify-center mb-6">
            <img 
              src="/jv-running-logo.png" // Caminho para a pasta 'public'
              alt="JV Running App Logo" 
              className="w-56 h-auto" // Ajuste o 'w-32' (largura) conforme necessário
            />
          </div>
          {/* --- Fim do Logo --- */}
          
          {/* O <h1>Jefe Training - App</h1> foi removido */}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-400"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
      
      {/* --- (NOVO) Footer --- */}
      <footer className="text-center p-4 text-gray-500 text-sm">
        Sistema Desenvolvido por VD System - Copyright @ 2025.
      </footer>
      {/* --- Fim do Footer --- */}
      
    </div>
  );
};

export default LoginScreen;