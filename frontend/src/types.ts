export interface Task {
  id: number;
  user_id: number;
  title: string;
  description?: string;
  category_color: string;
  status: 'PENDENTE' | 'CONCLUIDA';
  estimated_minutes: number;
  due_date: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA';
  created_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  profile_type?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}