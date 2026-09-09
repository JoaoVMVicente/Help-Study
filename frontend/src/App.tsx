import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Plus, Trash2, BookOpen, Loader2, Filter, LogOut, User as UserIcon } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import type { Task, User } from './types';
import { Auth } from './components/Auth';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_URL = `${BASE_URL}/tasks`;

export function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('@helpstudy:token'));
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('@helpstudy:user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'BAIXA' | 'MEDIA' | 'ALTA'>('MEDIA');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [filterStatus, setFilterStatus] = useState<'TODAS' | 'PENDENTE' | 'CONCLUIDA'>('TODAS');
  const [filterPriority, setFilterPriority] = useState<'TODAS' | 'BAIXA' | 'MEDIA' | 'ALTA'>('TODAS');

  // Configurar Header de Autenticação do Axios
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${token}` }
  });

  // Buscar tarefas
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const response = await axios.get<Task[]>(API_URL, getAuthHeader());
      setTasks(response.data);
    } catch (error: any) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        toast.error('Erro ao carregar tarefas.');
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  // Handler de Sucesso de Login
  const handleLoginSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('@helpstudy:token', newToken);
    localStorage.setItem('@helpstudy:user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  // Handler de Logout
  const handleLogout = () => {
    localStorage.removeItem('@helpstudy:token');
    localStorage.removeItem('@helpstudy:user');
    setToken(null);
    setUser(null);
    setTasks([]);
  };

  // Criar tarefa
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error('Preencha o título e o prazo.');
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(
        API_URL,
        {
          title,
          description,
          estimated_minutes: estimatedMinutes,
          due_date: dueDate,
          priority,
          category_color: '#3B82F6',
        },
        getAuthHeader()
      );

      toast.success('Tarefa criada com sucesso!');
      setTitle('');
      setDescription('');
      setEstimatedMinutes(30);
      setDueDate('');
      setPriority('MEDIA');
      fetchTasks();
    } catch (error) {
      toast.error('Falha ao criar tarefa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status
  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
    try {
      await axios.put(`${API_URL}/${task.id}`, { status: newStatus }, getAuthHeader());
      toast.success(newStatus === 'CONCLUIDA' ? 'Tarefa concluída!' : 'Tarefa reaberta!');
      fetchTasks();
    } catch (error) {
      toast.error('Erro ao atualizar status.');
    }
  };

  // Deletar
  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      toast.success('Tarefa removida!');
      fetchTasks();
    } catch (error) {
      toast.error('Erro ao deletar tarefa.');
    }
  };

  // Filtragem
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      filterStatus === 'TODAS' ||
      (filterStatus === 'PENDENTE' && task.status !== 'CONCLUIDA') ||
      (filterStatus === 'CONCLUIDA' && task.status === 'CONCLUIDA');

    const matchesPriority =
      filterPriority === 'TODAS' || task.priority === filterPriority;

    return matchesStatus && matchesPriority;
  });

  // Renderizar Auth se não estiver logado
  if (!token || !user) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />
        <Auth onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f8fafc' } }} />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header com Perfil do Usuário */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold tracking-wide">Help Study</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
              <UserIcon className="w-4 h-4 text-blue-400" />
              <span>{user.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1 cursor-pointer"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Form de Nova Tarefa */}
        <form onSubmit={handleCreateTask} className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4 shadow-lg">
          <h2 className="text-lg font-semibold text-slate-200">Nova Tarefa</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Título da tarefa..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <textarea
            placeholder="Descrição da tarefa (opcional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-4 items-center">
              <label className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Est. Minutos:
                <input
                  type="number"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-16 bg-slate-800 border border-slate-700 rounded p-1 text-center text-sm ml-1"
                />
              </label>

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'BAIXA' | 'MEDIA' | 'ALTA')}
                className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs focus:outline-none"
              >
                <option value="BAIXA">Prioridade Baixa</option>
                <option value="MEDIA">Prioridade Média</option>
                <option value="ALTA">Prioridade Alta</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 font-medium text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Adicionar
            </button>
          </div>
        </form>

        {/* Painel de Filtros e Lista */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <Filter className="w-4 h-4" />
              <span>Filtros:</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-lg bg-slate-800 p-1 text-xs">
                <button
                  onClick={() => setFilterStatus('TODAS')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'TODAS' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('PENDENTE')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'PENDENTE' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Pendentes
                </button>
                <button
                  onClick={() => setFilterStatus('CONCLUIDA')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${filterStatus === 'CONCLUIDA' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Concluídas
                </button>
              </div>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="TODAS">Todas as Prioridades</option>
                <option value="ALTA">Alta Prioridade</option>
                <option value="MEDIA">Média Prioridade</option>
                <option value="BAIXA">Baixa Prioridade</option>
              </select>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-slate-200">
            Minhas Tarefas ({filteredTasks.length})
          </h2>

          {filteredTasks.length === 0 ? (
            <p className="text-slate-500 text-sm italic py-4 text-center">
              Nenhuma tarefa encontrada.
            </p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex items-start justify-between transition-all ${
                  task.status === 'CONCLUIDA' ? 'bg-slate-900/50 border-slate-800 opacity-60' : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-1 text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className={`w-5 h-5 ${task.status === 'CONCLUIDA' ? 'text-emerald-500 fill-emerald-500/20' : ''}`} />
                  </button>

                  <div>
                    <h3 className={`font-medium ${task.status === 'CONCLUIDA' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {task.title}
                    </h3>
                    {task.description && <p className="text-xs text-slate-400 mt-1">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>Prazo: {task.due_date}</span>
                      <span>•</span>
                      <span>{task.estimated_minutes} min</span>
                      <span>•</span>
                      <span className={`font-semibold ${task.priority === 'ALTA' ? 'text-rose-400' : task.priority === 'MEDIA' ? 'text-amber-400' : 'text-slate-400'}`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-500 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;