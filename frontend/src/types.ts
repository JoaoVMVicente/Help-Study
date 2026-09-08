export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category_color: string;
  estimated_minutes: number;
  due_date: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  created_at?: string;
}