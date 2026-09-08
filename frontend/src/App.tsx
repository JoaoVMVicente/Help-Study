import { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle2, Clock, Plus, Trash2, BookOpen } from 'lucide-react';
import type { Task } from './types';

const API_URL = 'http://localhost:3000/api/tasks';

export function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'BAIXA' | 'MEDIA' | 'ALTA'>('MEDIA');

  // Buscar tarefas da API
  const fetchTasks = async () => {
    try {
      const response = await axios.get<Task[]>(API_URL);
      setTasks(response.data);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Criar nova tarefa
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    try {
      await axios.post(API_URL, {
        title,
        description,
        estimated_minutes: estimatedMinutes,
        due_date: dueDate,
        priority,
        category_color: '#3B82F6',
      });

      setTitle('');
      setDescription('');
      setEstimatedMinutes(30);
      setDueDate('');
      setPriority('MEDIA');
      fetchTasks();
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
    }
  };

  // Alternar status (Concluir/Pendente)
  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
    try {
      await axios.put(`${API_URL}/${task.id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Deletar tarefa
  const handleDeleteTask = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <BookOpen className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold tracking-wide">Help Study</h1>
        </header>

        {/* Form para adicionar tarefas */}
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
                onChange={(e) => setPriority(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded p-1.5 text-xs focus:outline-none"
              >
                <option value="BAIXA">Prioridade Baixa</option>
                <option value="MEDIA">Prioridade Média</option>
                <option value="ALTA">Prioridade Alta</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 font-medium text-sm py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </div>
        </form>

        {/* Lista de tarefas */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Minhas Tarefas ({tasks.length})</h2>

          {tasks.length === 0 ? (
            <p className="text-slate-500 text-sm italic">Nenhuma tarefa cadastrada ainda.</p>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex items-start justify-between transition-all ${
                  task.status === 'CONCLUIDA'
                    ? 'bg-slate-900/50 border-slate-800 opacity-60'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="mt-1 text-slate-500 hover:text-emerald-500 transition-colors"
                  >
                    <CheckCircle2
                      className={`w-5 h-5 ${
                        task.status === 'CONCLUIDA' ? 'text-emerald-500 fill-emerald-500/20' : ''
                      }`}
                    />
                  </button>

                  <div>
                    <h3
                      className={`font-medium ${
                        task.status === 'CONCLUIDA' ? 'line-through text-slate-400' : 'text-slate-100'
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                      <span>Prazo: {task.due_date}</span>
                      <span>•</span>
                      <span>{task.estimated_minutes} min</span>
                      <span>•</span>
                      <span className={`font-semibold ${
                        task.priority === 'ALTA' ? 'text-rose-400' : task.priority === 'MEDIA' ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-slate-500 hover:text-rose-500 transition-colors p-1"
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