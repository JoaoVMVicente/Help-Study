import { useState } from 'react';
import axios from 'axios';
import { BookOpen, LogIn, UserPlus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { AuthResponse } from '../types';

interface AuthProps {
  onLoginSuccess: (token: string, user: AuthResponse['user']) => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? 'http://localhost:3000/api/auth/login' : 'http://localhost:3000/api/auth/register';

    try {
      if (isLogin) {
        const response = await axios.post<AuthResponse>(endpoint, { email, password });
        toast.success(`Bem-vindo, ${response.data.user.name}!`);
        onLoginSuccess(response.data.token, response.data.user);
      } else {
        await axios.post(endpoint, { name, email, password });
        toast.success('Conta criada com sucesso! Faça login.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Erro ao processar requisição.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-xl text-blue-500 mb-2">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">Help Study</h1>
          <p className="text-xs text-slate-400">
            {isLogin ? 'Entre na sua conta para acessar suas tarefas' : 'Crie sua conta para organizar seus estudos'}
          </p>
        </div>

        {/* Toggle Login / Registro */}
        <div className="grid grid-cols-2 bg-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2 rounded-md transition-colors ${isLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2 rounded-md transition-colors ${!isLogin ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Cadastrar
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Nome Completo</label>
              <input
                type="text"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 mb-1 block">E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 mb-1 block">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 font-medium text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4" /> Entrar
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Cadastrar
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}